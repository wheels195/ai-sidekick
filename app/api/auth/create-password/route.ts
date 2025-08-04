import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { action, email, token, password } = await request.json()

    if (action === 'request') {
      // Step 1: Request password creation for an OAuth account
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      // Check if user exists in user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name')
        .eq('email', email)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ 
          error: 'No account found with this email address. Please sign up first or check your email.' 
        }, { status: 404 })
      }

      // Check if user already has a password set in Supabase Auth
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
        
        if (authUser.user && authUser.user.encrypted_password) {
          return NextResponse.json({ 
            error: 'This account already has a password. Use "Forgot Password?" to reset it instead.' 
          }, { status: 400 })
        }
      } catch (authError) {
        // User might not exist in auth yet (OAuth only) - this is expected
        console.log('User not in auth table yet (OAuth only):', authError)
      }

      // Generate secure token
      const setupToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store token in user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          password_setup_token: setupToken,
          password_setup_token_expires: expiresAt.toISOString()
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Failed to store password setup token:', updateError)
        return NextResponse.json({ error: 'Failed to generate verification token' }, { status: 500 })
      }

      // Send verification email
      const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-create-password?token=${setupToken}`

      try {
        await resend.emails.send({
          from: 'AI Sidekick <support@ai-sidekick.io>',
          to: email,
          subject: 'Create Password for Your AI Sidekick Account',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Create Password - AI Sidekick</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  margin: 0; 
                  padding: 0; 
                  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                }
                .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  padding: 40px 20px; 
                }
                .card {
                  background: rgba(255, 255, 255, 0.05);
                  backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 20px;
                  padding: 40px;
                  text-align: center;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .logo {
                  width: 60px;
                  height: 60px;
                  background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6);
                  border-radius: 15px;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 20px;
                  font-size: 24px;
                }
                h1 { 
                  color: #ffffff; 
                  margin: 0 0 20px 0; 
                  font-size: 28px;
                  font-weight: 700;
                  background: linear-gradient(135deg, #ffffff, #e2e8f0);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
                p { 
                  color: #d1d5db; 
                  margin: 0 0 20px 0; 
                  font-size: 16px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #10b981, #059669);
                  color: white;
                  text-decoration: none;
                  padding: 16px 32px;
                  border-radius: 12px;
                  font-weight: 600;
                  font-size: 16px;
                  margin: 20px 0;
                  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
                  transition: all 0.3s ease;
                }
                .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4);
                }
                .info-box {
                  background: rgba(59, 130, 246, 0.1);
                  border: 1px solid rgba(59, 130, 246, 0.2);
                  border-radius: 12px;
                  padding: 20px;
                  margin: 30px 0;
                  text-align: left;
                }
                .info-box h3 {
                  color: #60a5fa;
                  margin: 0 0 10px 0;
                  font-size: 16px;
                  font-weight: 600;
                }
                .info-box ol {
                  color: #d1d5db;
                  margin: 0;
                  padding-left: 20px;
                }
                .info-box li {
                  margin: 8px 0;
                  font-size: 14px;
                }
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .footer p {
                  color: #9ca3af;
                  font-size: 14px;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="logo">✨</div>
                  <h1>Create Your Password</h1>
                  <p>Hi ${profile.first_name || 'there'}!</p>
                  <p>You requested to add password authentication to your AI Sidekick account. This will let you sign in on any device, even when your Google Workspace isn't available.</p>
                  
                  <a href="${verificationUrl}" class="button">Create Password</a>
                  
                  <div class="info-box">
                    <h3>🔐 What happens next:</h3>
                    <ol>
                      <li>Click the button above to open the secure password creation page</li>
                      <li>Create a strong password that meets our security requirements</li>
                      <li>You'll be able to sign in with either Google OR your new password</li>
                      <li>Perfect for mobile access when Google Workspace isn't available!</li>
                    </ol>
                  </div>
                  
                  <p style="font-size: 14px; color: #9ca3af;">This link will expire in 24 hours for security.</p>
                  
                  <div class="footer">
                    <p>This email was sent because you requested to add password authentication to your account.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p style="margin-top: 20px;">
                      <strong style="color: #ffffff;">AI Sidekick</strong><br>
                      Specialized AI for Local Trades
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })

        console.log('Password creation verification email sent to:', email)
        return NextResponse.json({ 
          success: true, 
          message: 'Verification email sent successfully' 
        })

      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
      }

    } else if (action === 'verify') {
      // Step 2: Verify token and return user info
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, password_setup_token_expires')
        .eq('password_setup_token', token)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ 
          error: 'Invalid verification token. Please request a new verification email.' 
        }, { status: 400 })
      }

      // Check if token is expired
      const expiresAt = new Date(profile.password_setup_token_expires)
      if (expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'Verification link has expired. Please request a new one.' 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        email: profile.email 
      })

    } else if (action === 'create') {
      // Step 3: Create password for the user
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, password_setup_token_expires')
        .eq('password_setup_token', token)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ 
          error: 'Invalid verification token. Please request a new verification email.' 
        }, { status: 400 })
      }

      // Check if token is expired
      const expiresAt = new Date(profile.password_setup_token_expires)
      if (expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'Verification link has expired. Please request a new one.' 
        }, { status: 400 })
      }

      try {
        // Check if user exists in Supabase Auth
        let authUser = null
        try {
          const { data: existingUser } = await supabase.auth.admin.getUserById(profile.id)
          authUser = existingUser.user
        } catch (e) {
          console.log('User not in auth table yet (OAuth only):', e)
        }

        if (authUser) {
          // User exists in auth, update their password
          const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
            password: password
          })

          if (updateError) {
            console.error('Failed to update user password:', updateError)
            return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
          }
        } else {
          // User doesn't exist in auth (OAuth only), create auth record with password
          const { error: createError } = await supabase.auth.admin.createUser({
            email: profile.email,
            password: password,
            user_metadata: {
              linked_from_oauth: true
            }
          })

          if (createError) {
            console.error('Failed to create auth user with password:', createError)
            return NextResponse.json({ error: 'Failed to create password authentication' }, { status: 500 })
          }
        }

        // Clear the password setup token
        const { error: clearTokenError } = await supabase
          .from('user_profiles')
          .update({
            password_setup_token: null,
            password_setup_token_expires: null
          })
          .eq('id', profile.id)

        if (clearTokenError) {
          console.warn('Failed to clear password setup token:', clearTokenError)
        }

        console.log('Password created successfully for user:', profile.email)
        return NextResponse.json({ 
          success: true, 
          message: 'Password created successfully' 
        })

      } catch (error) {
        console.error('Error creating password:', error)
        return NextResponse.json({ error: 'Failed to create password' }, { status: 500 })
      }

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Password creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}