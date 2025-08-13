import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { action, token, password } = await request.json()

    if (action === 'request') {
      // Step 1: Request password setup
      console.log('Password setup request for user:', user.email)
      
      // Generate secure token
      const passwordSetupToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store token in user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          password_setup_token: passwordSetupToken,
          password_setup_token_expires: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error storing password setup token:', updateError)
        return NextResponse.json({ error: 'Failed to generate password setup link' }, { status: 500 })
      }

      // Send password setup email
      const setupUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password?token=${passwordSetupToken}`
      
      try {
        await resend.emails.send({
          from: 'AI Sidekick <support@ai-sidekick.io>',
          to: user.email!,
          subject: 'Set Your Account Password - AI Sidekick',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Set Your Account Password</h2>
              <p>Hi there!</p>
              <p>You requested to set a password for your AI Sidekick account. This will allow you to sign in with your email and password on any device.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${setupUrl}" 
                   style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Set Your Password
                </a>
              </div>
              <p><strong>This link expires in 24 hours.</strong></p>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                AI Sidekick - Specialized AI for Landscaping Businesses<br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #10b981;">ai-sidekick.io</a>
              </p>
            </div>
          `
        })

        console.log('Password setup email sent to:', user.email)
        return NextResponse.json({ 
          message: 'Password setup email sent. Check your inbox for the secure link.',
          success: true 
        })

      } catch (emailError) {
        console.error('Error sending password setup email:', emailError)
        return NextResponse.json({ error: 'Failed to send password setup email' }, { status: 500 })
      }

    } else if (action === 'set') {
      // Step 2: Set password with token
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
      }

      // Find user by token
      const { data: profile, error: tokenError } = await supabase
        .from('user_profiles')
        .select('id, email, password_setup_token_expires')
        .eq('password_setup_token', token)
        .single()

      if (tokenError || !profile) {
        return NextResponse.json({ error: 'Invalid or expired password setup link' }, { status: 400 })
      }

      // Check if token is expired
      const now = new Date()
      const expiresAt = new Date(profile.password_setup_token_expires)
      
      if (now > expiresAt) {
        return NextResponse.json({ error: 'Password setup link has expired. Please request a new one.' }, { status: 400 })
      }

      // Update user password in Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password
      })

      if (passwordError) {
        console.error('Error setting password:', passwordError)
        return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
      }

      // Clear the setup token
      const { error: clearTokenError } = await supabase
        .from('user_profiles')
        .update({
          password_setup_token: null,
          password_setup_token_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (clearTokenError) {
        console.error('Error clearing password setup token:', clearTokenError)
      }

      console.log('Password set successfully for user:', profile.email)
      return NextResponse.json({ 
        message: 'Password set successfully! You can now sign in with your email and password.',
        success: true 
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Password setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}