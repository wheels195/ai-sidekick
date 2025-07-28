import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { emailType, email, firstName, businessName, trade } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let result
    
    if (emailType === 'welcome') {
      // Test welcome email
      result = await sendWelcomeEmail(
        email,
        firstName || 'John',
        businessName || 'Green Thumb Landscaping',
        trade || 'landscaping'
      )
    } else if (emailType === 'verification') {
      // Test verification email
      const testToken = 'test-token-123'
      result = await sendVerificationEmail(email, testToken)
    } else {
      return NextResponse.json({ error: 'Invalid email type. Use "welcome" or "verification"' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `${emailType} email sent successfully to ${email}`,
        emailId: result.data?.id
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 })
  }
}

// Simple GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'welcome'

  if (!email) {
    return NextResponse.json({ 
      error: 'Please provide email parameter: /api/test/email?email=your@email.com&type=welcome' 
    }, { status: 400 })
  }

  try {
    let result
    
    if (type === 'welcome') {
      result = await sendWelcomeEmail(
        email,
        'Test User',
        'Demo Landscaping Co.',
        'landscaping'
      )
    } else {
      result = await sendVerificationEmail(email, 'test-verification-token')
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `${type} email sent to ${email}`,
        emailId: result.data?.id
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 })
  }
}