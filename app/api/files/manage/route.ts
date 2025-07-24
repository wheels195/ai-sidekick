import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FileInfo {
  id: string
  openaiFileId: string
  filename: string
  fileType: string
  fileSizeBytes: number
  contentCategory: string
  storageCostPerDay: number
  uploadDate: string
  lastAccessed: string
  accessCount: number
  isActive: boolean
}

// GET - List user's files
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active') !== 'false' // Default to true
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('openai_files')
      .select(`
        id,
        openai_file_id,
        original_filename,
        file_type,
        file_size_bytes,
        content_category,
        storage_cost_per_day,
        upload_date,
        last_accessed,
        access_count,
        is_active,
        business_context,
        total_storage_cost
      `)
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('content_category', category)
    }

    if (active) {
      query = query.eq('is_active', true)
    }

    const { data: files, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    // Format response
    const fileList: FileInfo[] = files?.map(f => ({
      id: f.id,
      openaiFileId: f.openai_file_id,
      filename: f.original_filename,
      fileType: f.file_type,
      fileSizeBytes: f.file_size_bytes,
      contentCategory: f.content_category,
      storageCostPerDay: f.storage_cost_per_day,
      uploadDate: f.upload_date,
      lastAccessed: f.last_accessed,
      accessCount: f.access_count,
      isActive: f.is_active
    })) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('openai_files')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', active)

    return NextResponse.json({
      files: fileList,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (totalCount || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('File list error:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const openaiFileId = searchParams.get('openaiFileId')

    if (!fileId && !openaiFileId) {
      return NextResponse.json({ error: 'File ID or OpenAI File ID required' }, { status: 400 })
    }

    // Get file record
    let query = supabase
      .from('openai_files')
      .select('*')
      .eq('user_id', user.id)

    if (fileId) {
      query = query.eq('id', fileId)
    } else {
      query = query.eq('openai_file_id', openaiFileId)
    }

    const { data: fileRecord, error: fetchError } = await query.single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from OpenAI Files API
    try {
      console.log(`🗑️ Deleting OpenAI file: ${fileRecord.openai_file_id}`)
      await openai.files.del(fileRecord.openai_file_id)
      console.log(`✅ OpenAI file deleted: ${fileRecord.openai_file_id}`)
    } catch (openaiError) {
      console.error('OpenAI file deletion error:', openaiError)
      // Continue with database deletion even if OpenAI deletion fails
    }

    // Mark as inactive in our database (soft delete)
    const { error: updateError } = await supabase
      .from('openai_files')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileRecord.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to delete file record' }, { status: 500 })
    }

    // Also update uploaded_files table for consistency
    await supabase
      .from('uploaded_files')
      .update({ analysis_status: 'deleted' })
      .eq('openai_file_id', fileRecord.openai_file_id)

    // Track the deletion
    await supabase.from('api_usage_tracking').insert({
      user_id: user.id,
      api_type: 'files',
      endpoint: '/api/files/manage',
      cost_usd: 0,
      cost_breakdown: {
        action: 'delete',
        freed_storage_cost: fileRecord.storage_cost_per_day,
        file_size_gb: fileRecord.file_size_bytes / (1024 * 1024 * 1024)
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully',
      freedStorageCost: fileRecord.storage_cost_per_day
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

// PUT - Update file metadata
export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { fileId, category, isActive } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Verify file ownership
    const { data: fileRecord, error: fetchError } = await supabase
      .from('openai_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update metadata
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (category !== undefined) {
      updates.content_category = category
    }

    if (isActive !== undefined) {
      updates.is_active = isActive
    }

    const { error: updateError } = await supabase
      .from('openai_files')
      .update(updates)
      .eq('id', fileId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'File updated successfully' })

  } catch (error) {
    console.error('File update error:', error)
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
  }
}

// POST - Retrieve file content or info from OpenAI
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createClient(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { fileId, action } = await request.json()

    if (!fileId || !action) {
      return NextResponse.json({ error: 'File ID and action required' }, { status: 400 })
    }

    // Get file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from('openai_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    let result: any = {}

    switch (action) {
      case 'info':
        // Get file info from OpenAI
        try {
          const openaiFileInfo = await openai.files.retrieve(fileRecord.openai_file_id)
          result = {
            openaiInfo: openaiFileInfo,
            localInfo: fileRecord
          }
        } catch (openaiError) {
          console.error('OpenAI file info error:', openaiError)
          result = {
            error: 'Failed to retrieve file info from OpenAI',
            localInfo: fileRecord
          }
        }
        break

      case 'content':
        // Note: OpenAI Files API doesn't directly return file content
        // This would typically be used with assistants or other APIs
        result = {
          message: 'File content access requires integration with OpenAI Assistants or Chat API',
          fileId: fileRecord.openai_file_id,
          filename: fileRecord.original_filename
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update access tracking
    await supabase
      .from('openai_files')
      .update({
        last_accessed: new Date().toISOString(),
        access_count: fileRecord.access_count + 1
      })
      .eq('id', fileId)

    return NextResponse.json(result)

  } catch (error) {
    console.error('File action error:', error)
    return NextResponse.json({ error: 'File action failed' }, { status: 500 })
  }
}