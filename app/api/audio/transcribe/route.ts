import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// Initialize OpenAI client only when needed
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 seconds timeout for audio processing
    maxRetries: 2,
  })
}

export async function POST(request: NextRequest) {
  // Ensure we always return JSON responses
  const headers = {
    'Content-Type': 'application/json',
  }
  
  try {
    console.log('Transcription API called')
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Check authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email)
    console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? `Present (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : 'MISSING!')

    // Parse form data to get the audio file
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      console.error('No audio file in request')
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    })

    // Debug: Log FormData contents
    console.log('FormData entries:', [...formData.entries()].map(([key, value]) => {
      if (value instanceof File) {
        return [key, `File(${value.name}, ${value.size} bytes, ${value.type})`]
      }
      return [key, value]
    }))

    // Validate file size (max 25MB as per OpenAI limits)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      console.error('File too large:', audioFile.size)
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // More flexible MIME type validation - support all OpenAI formats
    const allowedTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 
      'audio/ogg', 'audio/m4a', 'audio/mp4', 'audio/x-wav',
      'audio/webm;codecs=opus', 'audio/mpga' // Added mpga support
    ]
    
    // Check if the MIME type matches or contains allowed format
    const isValidType = allowedTypes.some(type => 
      audioFile.type === type || audioFile.type.includes(type.split('/')[1])
    )
    
    if (!isValidType) {
      console.error('Invalid file type:', audioFile.type)
      return NextResponse.json(
        { error: `Unsupported audio format: ${audioFile.type}. Please use MP3, WAV, WebM, OGG, M4A, or MPGA.` },
        { status: 400 }
      )
    }

    // Get language and model preferences from query parameters
    const url = new URL(request.url)
    const preferredLanguage = url.searchParams.get('language') || 'auto' // 'en', 'es', or 'auto'
    const useHighQuality = url.searchParams.get('quality') !== 'fast' // Default to high quality

    console.log('Transcription settings:', { preferredLanguage, useHighQuality })

    console.log('File validation passed, initializing OpenAI client...')

    // Initialize OpenAI client
    const openai = getOpenAIClient()

    console.log('Sending to OpenAI Whisper API...')

    // Create landscaping-specific prompt for better accuracy
    const landscapingPrompt = `This conversation is about landscaping business topics including: lawn care, landscape design, irrigation, hardscaping, tree services, seasonal maintenance, customer service, pricing, marketing, crew management, equipment, plant care, soil management, fertilization, pest control, commercial landscaping, residential landscaping, outdoor lighting, drainage systems, and business growth strategies.`

    // Use whisper-1 - it's the only available transcription model
    const models = ['whisper-1']
    
    let transcription: string | undefined
    let usedModel = ''
    
    for (const model of models) {
      try {
        console.log('Trying model:', model, 'with language:', preferredLanguage)
        
        // Convert File to Buffer for OpenAI SDK
        let buffer: Buffer
        try {
          buffer = Buffer.from(await audioFile.arrayBuffer())
          console.log('Buffer conversion successful:', {
            bufferSize: buffer.length,
            originalSize: audioFile.size,
            isBuffer: Buffer.isBuffer(buffer)
          })
        } catch (bufferError: any) {
          console.error('Buffer conversion failed:', bufferError)
          throw new Error(`Failed to convert audio file to buffer: ${bufferError.message}`)
        }
        
        // Simplify - create a File object from Buffer for OpenAI
        // The toFile method creates a File-like object that OpenAI SDK can use
        const file = await openai.files.toFile(
          buffer, 
          audioFile.name || 'audio.webm',
          { type: audioFile.type || 'audio/webm' }
        )

        // Build transcription parameters
        const transcriptionParams: any = {
          file: file,
          model: model,
          response_format: 'text',
          prompt: landscapingPrompt,
        }

        // Add language parameter if specified (don't set for auto-detection)
        if (preferredLanguage !== 'auto') {
          transcriptionParams.language = preferredLanguage
        }

        // For whisper-1, add temperature parameter
        if (model === 'whisper-1') {
          transcriptionParams.temperature = 0.2
        }

        console.log('Sending to OpenAI:', {
          model: model,
          language: preferredLanguage,
          fileSize: audioFile.size,
          fileType: audioFile.type,
          fileName: audioFile.name,
          bufferSize: buffer.length
        })

        // Call OpenAI API with properly formatted file
        try {
          console.log('Calling OpenAI transcription API...')
          const result = await openai.audio.transcriptions.create(transcriptionParams)
          
          // Handle different response types
          if (typeof result === 'string') {
            transcription = result
          } else if (result && typeof result === 'object' && 'text' in result) {
            transcription = result.text
          } else {
            console.error('Unexpected transcription result format:', result)
            throw new Error('Unexpected response format from OpenAI')
          }
          
          usedModel = model
          console.log('Transcription successful with model:', model)
          console.log('Transcription result:', transcription?.substring(0, 100))
          break // Success! Exit the loop
        } catch (openaiError: any) {
          console.error('OpenAI API call failed:', {
            error: openaiError,
            message: openaiError?.message,
            response: openaiError?.response,
            data: openaiError?.response?.data
          })
          throw openaiError
        }
        
      } catch (modelError: any) {
        console.error(`Model ${model} failed:`, {
          message: modelError.message,
          status: modelError.status,
          code: modelError?.error?.code,
          type: modelError?.error?.type,
          details: modelError?.error?.message,
          response: modelError?.response?.data,
          headers: modelError?.response?.headers,
          fullError: JSON.stringify(modelError, null, 2)
        })
        
        // If this is the last model, we'll throw the error
        if (model === models[models.length - 1]) {
          throw modelError
        }
        // Otherwise, continue to next model
      }
    }

    console.log('Transcription successful:', transcription?.substring(0, 100))

    // Return the transcribed text
    return NextResponse.json({
      success: true,
      text: transcription,
      model: usedModel,
      message: `Audio transcribed successfully using ${usedModel}`
    }, { headers })

  } catch (error: any) {
    console.error('Transcription error details:', {
      message: error.message,
      code: error?.error?.code,
      type: error?.error?.type,
      status: error?.status,
      stack: error?.stack,
      response: error?.response,
      full: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    })

    // Create detailed error response for debugging
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error?.error?.code,
      type: error?.error?.type,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10),
      fileInfo: {
        size: audioFile?.size,
        type: audioFile?.type,
        name: audioFile?.name
      }
    }

    // Handle specific OpenAI errors
    if (error?.error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          error: 'OpenAI API configuration error',
          details: 'API key is invalid or not properly configured',
          errorDetails 
        },
        { status: 500 }
      )
    }

    if (error?.error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in a moment.',
          errorDetails 
        },
        { status: 429 }
      )
    }

    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { 
          error: 'Invalid audio file format or corrupted file',
          errorDetails 
        },
        { status: 400 }
      )
    }

    // Handle network/connection errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return NextResponse.json(
        { 
          error: 'Network error connecting to OpenAI. Please try again.',
          errorDetails 
        },
        { status: 503 }
      )
    }

    // Handle timeout errors
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout. Please try with a shorter audio clip.',
          errorDetails 
        },
        { status: 408 }
      )
    }

    // Generic error response with full debugging info
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio. Please try again.',
        details: error.message,
        errorDetails,
        debugInfo: {
          hasAPIKey: !!process.env.OPENAI_API_KEY,
          modelUsed: 'whisper-1',
          audioFormat: audioFile?.type,
          audioSize: audioFile?.size
        }
      },
      { status: 500, headers }
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