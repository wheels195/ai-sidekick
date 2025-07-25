import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  console.log('Simple transcribe endpoint called')
  
  try {
    // 1. Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('No OpenAI API key')
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }
    
    // 2. Get the audio file
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    
    console.log('Audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    })
    
    // 3. Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    // 4. Convert to buffer
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('Buffer created, size:', buffer.length)
    
    // 5. Create file for OpenAI
    const file = await openai.files.toFile(buffer, audioFile.name || 'audio.webm')
    
    console.log('Calling OpenAI Whisper...')
    
    // 6. Call Whisper
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      })
      
      console.log('Transcription success!')
      
      // Return the transcription
      return NextResponse.json({
        success: true,
        text: transcription,
        message: 'Transcribed successfully'
      })
      
    } catch (openaiError: any) {
      console.error('OpenAI error:', {
        message: openaiError.message,
        error: openaiError.error,
        status: openaiError.status,
        code: openaiError.code
      })
      
      return NextResponse.json({
        error: 'OpenAI transcription failed',
        details: openaiError.message,
        code: openaiError.error?.code,
        apiKeyValid: openaiError.error?.code !== 'invalid_api_key'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Endpoint error:', error)
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 })
  }
}