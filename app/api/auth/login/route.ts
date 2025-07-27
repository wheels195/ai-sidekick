import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { SignJWT } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe = false } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in' },
        { status: 401 }
      )
    }

    // Verify password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedPassword !== user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Create JWT token with extended expiration if remember me is checked
    const expirationTime = rememberMe ? '30d' : '7d'
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      trade: user.trade,
      rememberMe: rememberMe
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(JWT_SECRET)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        trade: user.trade,
        selectedPlan: user.selected_plan
      },
      message: 'Login successful'
    })

    // Set HTTP-only cookie with extended expiration if remember me is checked
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}