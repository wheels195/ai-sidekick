import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { createClient } from '@/lib/supabase/server'

// Initialize OpenAI client
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Get authenticated user
    const { supabase } = createClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data to get the audio file
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB as per OpenAI limits)
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Validate audio format
    const allowedTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 
      'audio/ogg', 'audio/m4a', 'audio/mp4', 'audio/x-wav',
      'audio/webm;codecs=opus', 'audio/mpga'
    ]
    
    const isValidType = allowedTypes.some(type => 
      audioFile.type === type || audioFile.type.includes(type.split('/')[1])
    )
    
    if (!isValidType) {
      return NextResponse.json(
        { error: `Unsupported audio format: ${audioFile.type}. Please use MP3, WAV, WebM, OGG, M4A, or MPGA.` },
        { status: 400 }
      )
    }

    // Get language preference from query parameters
    const url = new URL(request.url)
    const preferredLanguage = url.searchParams.get('language') || 'auto'

    // Initialize OpenAI client
    const openai = getOpenAIClient()

    // Convert File to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Create temporary file for OpenAI SDK compatibility
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`)
    
    try {
      // Write buffer to temp file
      await fs.promises.writeFile(tempFilePath, buffer)
      
      // Create read stream for OpenAI
      const fileStream = fs.createReadStream(tempFilePath)

      // Build transcription parameters
      const transcriptionParams: any = {
        file: fileStream as any,
        model: 'whisper-1',
        response_format: 'text',
        temperature: 0.2,
      }

      // Add language parameter if specified
      if (preferredLanguage !== 'auto') {
        transcriptionParams.language = preferredLanguage
      }

      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create(transcriptionParams)
      
      // Handle response format
      const text = typeof transcription === 'string' ? transcription : transcription.text

      // Calculate cost and duration for tracking
      // Estimate duration from file size (rough approximation: 1MB ≈ 1 minute for compressed audio)
      const estimatedDurationMinutes = Math.max(0.1, audioFile.size / (1024 * 1024)) // Minimum 0.1 minutes
      const whisperCostUsd = estimatedDurationMinutes * 0.006 // $0.006 per minute

      console.log(`🎙️ Whisper transcription completed:`, {
        fileSize: audioFile.size,
        estimatedMinutes: estimatedDurationMinutes,
        cost: whisperCostUsd,
        textLength: text.length
      })

      // Track API usage in database
      await supabase.from('api_usage_tracking').insert({
        user_id: user.id,
        api_type: 'whisper',
        endpoint: '/api/audio/transcribe',
        model_used: 'whisper-1',
        audio_minutes: estimatedDurationMinutes,
        cost_usd: whisperCostUsd,
        cost_breakdown: {
          model: 'whisper-1',
          duration_minutes: estimatedDurationMinutes,
          file_size_mb: audioFile.size / (1024 * 1024),
          text_length: text.length
        }
      })

      console.log('💾 Whisper API usage tracked')

      // Return the transcribed text
      return NextResponse.json({
        success: true,
        text: text,
        message: 'Audio transcribed successfully',
        usage: {
          duration_minutes: Math.round(estimatedDurationMinutes * 100) / 100,
          cost_usd: Math.round(whisperCostUsd * 10000) / 10000
        }
      })
      
    } catch (openaiError: any) {
      throw new Error(`OpenAI transcription failed: ${openaiError.message}`)
    } finally {
      // Clean up temp file
      try {
        await fs.promises.unlink(tempFilePath)
      } catch (e) {
        console.error('Failed to delete temp file:', e)
      }
    }

  } catch (error: any) {
    console.error('Transcription error:', error.message)

    // Handle specific OpenAI errors
    if (error.message?.includes('invalid_api_key')) {
      return NextResponse.json(
        { error: 'OpenAI API configuration error' },
        { status: 500 }
      )
    }

    if (error.message?.includes('rate_limit_exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (error.message?.includes('invalid_request_error')) {
      return NextResponse.json(
        { error: 'Invalid audio file format or corrupted file' },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to transcribe audio.' },
    { status: 405 }
  )
}