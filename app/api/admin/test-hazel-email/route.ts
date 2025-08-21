import { NextRequest, NextResponse } from 'next/server'
import { sendTrialDay1Email } from '@/lib/email'

export async function POST(request: NextRequest) {
  // Simple security check
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('key')
  
  if (authKey !== 'hazel-fix-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    console.log('🧪 Testing direct email send to Hazel...')
    
    const result = await sendTrialDay1Email('topguncleaner@gmail.com', 'Hazel')
    
    console.log('📧 Email send result:', result)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Day 1 email sent directly to Hazel',
        resend_data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Email send failed',
        details: result.error
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Test email error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error during email test', 
      details: error.message 
    }, { status: 500 })
  }
}