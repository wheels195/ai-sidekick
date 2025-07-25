import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    console.log('Test Whisper API endpoint called')
    
    // Check API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        hasKey: false
      })
    }
    
    // Test OpenAI client creation
    const openai = new OpenAI({
      apiKey: apiKey,
    })
    
    // Just test that we can create the client
    return NextResponse.json({
      success: true,
      hasKey: true,
      keyPrefix: apiKey.substring(0, 10) + '...',
      message: 'OpenAI client created successfully',
      whisperInfo: 'Use POST /api/audio/transcribe to transcribe audio'
    })
    
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: 'Failed to initialize OpenAI',
      message: error.message,
      hasKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 })
  }
}