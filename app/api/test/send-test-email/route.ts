import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'welcome' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let result;
    
    if (type === 'verification') {
      // Send verification email with a dummy token
      const dummyToken = 'test-token-' + Date.now()
      result = await sendVerificationEmail(email, dummyToken)
    } else {
      // Send welcome email with test data
      result = await sendWelcomeEmail(
        email,
        'John',                    // firstName
        'Test Landscaping Co',     // businessName
        'landscaping',            // trade
      )
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Test ${type} email sent to ${email}! Check your inbox (and spam folder).`,
        data: result.data
      })
    } else {
      console.error('Email send failed:', result.error)
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: result.error,
        rawError: JSON.stringify(result.error, null, 2)
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}

// Simple GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'welcome'

  if (!email) {
    return NextResponse.json({ 
      error: 'Email parameter required',
      usage: '/api/test/send-test-email?email=your@email.com&type=welcome',
      types: ['welcome', 'verification']
    }, { status: 400 })
  }

  let result;
    
  if (type === 'verification') {
    const dummyToken = 'test-token-' + Date.now()
    result = await sendVerificationEmail(email, dummyToken)
  } else {
    result = await sendWelcomeEmail(
      email,
      'Test User',
      'Test Landscaping Business',
      'landscaping'
    )
  }

  if (result.success) {
    return NextResponse.json({ 
      success: true, 
      message: `Test ${type} email sent to ${email}! Check your inbox.`,
      note: 'Check spam folder if not in inbox'
    })
  } else {
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: result.error 
    }, { status: 500 })
  }
}