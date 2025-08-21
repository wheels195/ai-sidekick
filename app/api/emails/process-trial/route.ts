import { NextRequest, NextResponse } from 'next/server'
import { processPendingTrialEmails } from '@/lib/email-automation'

// This endpoint processes and sends trial emails
// Should be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (you can add API key check here)
    const authHeader = request.headers.get('authorization')
    
    // Optional: Add API key protection
    // if (authHeader !== `Bearer ${process.env.CRON_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    console.log('🚀 Starting trial email processing...')
    
    await processPendingTrialEmails()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trial emails processed successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Trial email processing failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process trial emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Trial email processor endpoint',
    usage: 'POST to this endpoint to process pending trial emails'
  })
}