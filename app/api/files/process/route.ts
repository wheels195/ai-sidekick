import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderateFileContent } from '@/lib/moderation'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enhanced file processing with content extraction
async function extractFileContent(file: any): Promise<string> {
  const { name, type, content } = file
  
  try {
    if (type.startsWith('image/')) {
      // For images, use OpenAI Vision to extract text/information
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text and relevant business information from this image. Focus on: prices, services, contact information, business details, client information, or any other business-relevant data. Return the extracted information in a structured format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: content
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
      
      return response.choices[0].message.content || ''
    } else if (type === 'application/pdf') {
      // For PDFs, use OpenAI's native PDF processing capabilities
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this PDF document and extract all relevant business information, strategies, tips, recommendations, and actionable insights. Focus on content that would be useful for a landscaping business owner. Return the extracted information in a structured, comprehensive format. Document name: ${name}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: content // Base64 PDF data
                  }
                }
              ]
            }
          ],
          max_tokens: 4000
        })
        
        return response.choices[0].message.content || `PDF document: ${name}. Unable to extract content.`
      } catch (error) {
        console.error('PDF processing error:', error)
        return `PDF Document: ${name}. Error processing PDF content: ${error.message}`
      }
    } else if (type.includes('text') || name.endsWith('.txt')) {
      // For text files, the content is likely base64 encoded
      try {
        const base64Content = content.split(',')[1]
        const textContent = atob(base64Content)
        return textContent
      } catch (error) {
        return `Text file: ${name}. Content: ${content}`
      }
    } else {
      return `File: ${name} (${type}). Content type not yet supported for extraction.`
    }
  } catch (error) {
    console.error('File content extraction error:', error)
    return `File: ${name}. Error extracting content: ${error.message}`
  }
}

// Intelligent content categorization
function categorizeContent(content: string, filename: string): {
  category: string
  dataType: string
  keywords: string[]
  locationTags: string[]
  serviceTags: string[]
  priorityScore: number
} {
  const lowerContent = content.toLowerCase()
  const lowerFilename = filename.toLowerCase()
  
  let category = 'general'
  let dataType = 'document'
  let priorityScore = 5
  
  // Detect content category
  if (lowerContent.includes('$') || lowerContent.includes('price') || lowerContent.includes('cost')) {
    category = 'pricing'
    dataType = 'price_list'
    priorityScore = 8
  } else if (lowerContent.includes('service') || lowerContent.includes('offering')) {
    category = 'services'
    dataType = 'service_menu'
    priorityScore = 7
  } else if (lowerContent.includes('client') || lowerContent.includes('customer')) {
    category = 'clients'
    dataType = 'client_data'
    priorityScore = 6
  } else if (lowerContent.includes('proposal') || lowerContent.includes('estimate')) {
    category = 'proposals'
    dataType = 'proposal_template'
    priorityScore = 7
  } else if (lowerContent.includes('competitor') || lowerContent.includes('competition')) {
    category = 'competitive_analysis'
    dataType = 'market_research'
    priorityScore = 6
  }
  
  // Extract keywords
  const keywords = []
  const keywordPatterns = [
    /\$\d+/g, // Prices
    /\b(lawn|landscape|garden|tree|plant|irrigation|hardscape|maintenance)\w*/gi,
    /\b(spring|summer|fall|winter|seasonal)\w*/gi,
    /\b(residential|commercial|HOA|property)\w*/gi
  ]
  
  keywordPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      keywords.push(...matches.map(m => m.toLowerCase()))
    }
  })
  
  // Extract location tags
  const locationTags = []
  const locationPatterns = [
    /\b(Texas|TX|Dallas|Houston|Austin|San Antonio|Fort Worth)\b/gi,
    /\b\d{5}\b/g // ZIP codes
  ]
  
  locationPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      locationTags.push(...matches.map(m => m.toLowerCase()))
    }
  })
  
  // Extract service tags
  const serviceTags = []
  const serviceWords = [
    'mowing', 'fertilization', 'aeration', 'seeding', 'pruning', 'trimming',
    'installation', 'design', 'irrigation', 'sprinkler', 'landscape', 'hardscape',
    'mulching', 'cleanup', 'maintenance', 'weed control', 'pest control'
  ]
  
  serviceWords.forEach(service => {
    if (lowerContent.includes(service)) {
      serviceTags.push(service)
    }
  })
  
  return {
    category,
    dataType,
    keywords: [...new Set(keywords)].slice(0, 15),
    locationTags: [...new Set(locationTags)].slice(0, 10),
    serviceTags: [...new Set(serviceTags)].slice(0, 10),
    priorityScore
  }
}

// Chunk content for vector storage
function chunkContent(content: string, maxTokens: number = 600): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const proposedChunk = currentChunk + sentence + '. '
    
    // Rough token estimation: 1 token ≈ 4 characters
    if (proposedChunk.length > maxTokens * 4) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = sentence + '. '
    } else {
      currentChunk = proposedChunk
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.length > 0 ? chunks : [content]
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Get authenticated user
    const { data: authData, error: userError } = await supabase.auth.getUser()
    const user = authData?.user
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { files, uploadToPersistentStorage } = await request.json()
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }
    
    const processedFiles = []
    
    for (const file of files) {
      try {
        // Extract content from file
        const extractedContent = await extractFileContent(file)
        
        // Moderate file content for safety
        console.log('🛡️ Moderating file content...')
        const moderationResult = await moderateFileContent(extractedContent, user.id, request)
        
        if (!moderationResult.allowed) {
          console.log('🚫 File content blocked by moderation:', moderationResult.reason)
          processedFiles.push({
            name: file.name,
            success: false,
            error: moderationResult.userMessage || 'File content violates content policy',
            errorType: 'CONTENT_MODERATION_BLOCKED',
            categories: moderationResult.categories
          })
          continue // Skip processing this file
        }
        
        console.log('✅ File content passed moderation')
        
        // Categorize content
        const metadata = categorizeContent(extractedContent, file.name)
        
        // Chunk content for vector storage
        const chunks = chunkContent(extractedContent)
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          
          // Generate embedding
          const embedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunk,
            encoding_format: 'float',
          })
          
          // Store in user_knowledge table
          const { error: insertError } = await supabase
            .from('user_knowledge')
            .insert({
              user_id: user.id,
              content: chunk,
              embedding: embedding.data[0].embedding,
              original_filename: file.name,
              file_type: file.type,
              file_size: file.size,
              content_category: metadata.category,
              data_type: metadata.dataType,
              location_tags: metadata.locationTags,
              service_tags: metadata.serviceTags,
              keywords: metadata.keywords,
              priority_score: metadata.priorityScore
            })
          
          if (insertError) {
            console.error('Error storing file chunk:', insertError)
          }
        }
        
        processedFiles.push({
          filename: file.name,
          category: metadata.category,
          dataType: metadata.dataType,
          chunks: chunks.length,
          success: true
        })
        
      } catch (error) {
        console.error('Error processing file:', error)
        processedFiles.push({
          filename: file.name,
          error: error.message,
          success: false
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedFiles.length} files`,
      files: processedFiles
    })
    
  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process files', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user's uploaded files
export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Get authenticated user
    const { data: authData, error: userError } = await supabase.auth.getUser()
    const user = authData?.user
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('user_knowledge')
      .select('original_filename, content_category, data_type, upload_date, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('upload_date', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Group by filename
    const fileGroups = data.reduce((acc, item) => {
      const filename = item.original_filename
      if (!acc[filename]) {
        acc[filename] = {
          filename,
          category: item.content_category,
          dataType: item.data_type,
          uploadDate: item.upload_date,
          chunks: 0
        }
      }
      acc[filename].chunks++
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      files: Object.values(fileGroups)
    })
    
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve files', details: error.message },
      { status: 500 }
    )
  }
}