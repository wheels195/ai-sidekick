import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// File size limits
const MAX_FILE_SIZE = 512 * 1024 * 1024 // 512MB (OpenAI Files API limit)
const MAX_FILES_PER_USER = 50 // Reasonable limit per user

// Supported file types for OpenAI Files API
const SUPPORTED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Images (also supported)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

interface FileUploadResult {
  success: boolean
  fileId?: string
  openaiFileId?: string
  filename?: string
  storageCost?: number
  error?: string
}

// Moderate file content before upload
async function moderateContent(content: string, contentType: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const moderation = await openai.moderations.create({
      input: content.substring(0, 4000) // Limit content for moderation
    })

    const result = moderation.results[0]
    
    if (result.flagged) {
      // Log the moderation incident
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category)

      return {
        allowed: false,
        reason: `Content violates policy: ${flaggedCategories.join(', ')}`
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Moderation error:', error)
    // Allow upload if moderation fails (don't block legitimate users)
    return { allowed: true }
  }
}

// Extract text content for moderation (simplified version)
async function extractTextForModeration(file: Buffer, fileType: string, filename: string): Promise<string> {
  try {
    if (fileType.startsWith('text/')) {
      return file.toString('utf-8').substring(0, 4000)
    }
    
    if (fileType.startsWith('image/')) {
      // For images, we'll moderate the filename and any metadata
      return `Image file: ${filename}`
    }
    
    if (fileType === 'application/pdf') {
      // For PDFs, we'll do a basic moderation on filename
      // Full PDF content moderation would happen during processing
      return `PDF document: ${filename}`
    }
    
    return `Document: ${filename}`
  } catch (error) {
    console.error('Text extraction error:', error)
    return `File: ${filename}`
  }
}

// Calculate storage cost
function calculateStorageCost(fileSizeBytes: number): number {
  // OpenAI charges $0.10 per GB per day
  const gbSize = fileSizeBytes / (1024 * 1024 * 1024)
  return gbSize * 0.10
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as string || 'assistants'
    const category = formData.get('category') as string || 'general'
    const isPersistent = formData.get('persistent') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}` 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Check user's current file count
    const { count: currentFileCount } = await supabase
      .from('openai_files')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (currentFileCount && currentFileCount >= MAX_FILES_PER_USER) {
      return NextResponse.json({ 
        error: `File limit exceeded. Maximum ${MAX_FILES_PER_USER} files per user.` 
      }, { status: 400 })
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    // Extract content for moderation
    const textContent = await extractTextForModeration(fileBuffer, file.type, file.name)
    
    // Moderate content
    const moderationResult = await moderateContent(textContent, 'file_upload')
    
    if (!moderationResult.allowed) {
      // Log moderation incident
      await supabase.from('moderation_logs').insert({
        user_id: user.id,
        content: textContent,
        content_type: 'file_upload',
        content_hash: require('crypto').createHash('sha256').update(textContent).digest('hex'),
        moderation_result: { flagged: true, reason: moderationResult.reason },
        is_flagged: true,
        flagged_categories: moderationResult.reason?.split(': ')[1]?.split(', ') || [],
        action_taken: 'blocked',
        user_message: 'File upload blocked due to content policy violation'
      })

      return NextResponse.json({ 
        error: 'File upload blocked due to content policy violation' 
      }, { status: 400 })
    }

    // Log successful moderation
    await supabase.from('moderation_logs').insert({
      user_id: user.id,
      content: textContent,
      content_type: 'file_upload',
      content_hash: require('crypto').createHash('sha256').update(textContent).digest('hex'),
      moderation_result: { flagged: false },
      is_flagged: false,
      action_taken: 'allowed'
    })

    // Upload to OpenAI Files API
    console.log(`📤 Uploading file ${file.name} to OpenAI Files API...`)
    
    const openaiFile = await openai.files.create({
      file: new File([fileBuffer], file.name, { type: file.type }),
      purpose: purpose as any
    })

    console.log(`✅ File uploaded to OpenAI: ${openaiFile.id}`)

    // Calculate storage cost
    const dailyStorageCost = calculateStorageCost(file.size)
    
    // Get user profile for business context
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('business_name, location, services, trade')
      .eq('id', user.id)
      .single()

    // Store in our database
    const { data: fileRecord, error: dbError } = await supabase
      .from('openai_files')
      .insert({
        user_id: user.id,
        openai_file_id: openaiFile.id,
        original_filename: file.name,
        file_purpose: purpose,
        file_size_bytes: file.size,
        storage_cost_per_day: dailyStorageCost,
        file_type: file.type,
        content_category: category,
        business_context: userProfile || {}
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete the OpenAI file if database insert failed
      try {
        await openai.files.del(openaiFile.id)
      } catch (deleteError) {
        console.error('Failed to cleanup OpenAI file:', deleteError)
      }
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 })
    }

    // Also update the existing uploaded_files table for backward compatibility
    await supabase.from('uploaded_files').insert({
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_url: `openai://${openaiFile.id}`, // Special URL format for OpenAI files
      file_size: file.size,
      openai_file_id: openaiFile.id,
      openai_file_purpose: purpose,
      file_storage_cost: dailyStorageCost,
      is_persistent: isPersistent,
      analysis_status: 'uploaded'
    })

    // Track API usage and costs
    await supabase.from('api_usage_tracking').insert({
      user_id: user.id,
      api_type: 'files',
      endpoint: '/api/files/upload',
      files_uploaded: 1,
      storage_gb_days: dailyStorageCost / 0.10, // Convert back to GB-days
      cost_usd: dailyStorageCost,
      cost_breakdown: {
        storage_cost_per_day: dailyStorageCost,
        file_size_gb: file.size / (1024 * 1024 * 1024)
      },
      request_size_bytes: file.size
    })

    console.log(`💾 File record saved: ${fileRecord.id}`)

    const result: FileUploadResult = {
      success: true,
      fileId: fileRecord.id,
      openaiFileId: openaiFile.id,
      filename: file.name,
      storageContent: dailyStorageCost
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check upload limits and costs
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's current file usage
    const { data: files, count } = await supabase
      .from('openai_files')
      .select('file_size_bytes, storage_cost_per_day, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)

    const totalFiles = count || 0
    const totalSizeBytes = files?.reduce((sum, f) => sum + f.file_size_bytes, 0) || 0
    const dailyStorageCost = files?.reduce((sum, f) => sum + f.storage_cost_per_day, 0) || 0
    const monthlyStorageCost = dailyStorageCost * 30

    return NextResponse.json({
      usage: {
        fileCount: totalFiles,
        maxFiles: MAX_FILES_PER_USER,
        totalSizeBytes,
        totalSizeMB: Math.round(totalSizeBytes / (1024 * 1024)),
        dailyStorageCost: Math.round(dailyStorageCost * 10000) / 10000, // 4 decimal places
        monthlyStorageCost: Math.round(monthlyStorageCost * 100) / 100 // 2 decimal places
      },
      limits: {
        maxFileSize: MAX_FILE_SIZE,
        maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
        maxFiles: MAX_FILES_PER_USER,
        supportedTypes: SUPPORTED_FILE_TYPES
      }
    })

  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}