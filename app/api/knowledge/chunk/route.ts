import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Chunk content into semantic sections
function chunkContent(content: string, maxTokens: number = 800): Array<{
  text: string
  section: string
  index: number
}> {
  const chunks = []
  const lines = content.split('\n')
  
  let currentChunk = ''
  let currentSection = 'introduction'
  let chunkIndex = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect section headers
    if (line.startsWith('## ')) {
      // Save previous chunk if it exists
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
      }
      
      // Start new section
      currentSection = line.replace('## ', '').toLowerCase().replace(/[^a-z0-9]/g, '-')
      currentChunk = line + '\n'
    } else if (line.startsWith('### ')) {
      // Subsection - add to current chunk but check size
      const proposedChunk = currentChunk + line + '\n'
      
      // Rough token estimation: 1 token ≈ 4 characters
      if (proposedChunk.length > maxTokens * 4) {
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
        
        // Start new chunk with subsection
        currentChunk = line + '\n'
      } else {
        currentChunk = proposedChunk
      }
    } else {
      // Regular content
      const proposedChunk = currentChunk + line + '\n'
      
      // Check if chunk is getting too large
      if (proposedChunk.length > maxTokens * 4) {
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
        
        // Start new chunk
        currentChunk = line + '\n'
      } else {
        currentChunk = proposedChunk
      }
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      section: currentSection,
      index: chunkIndex++
    })
  }
  
  return chunks
}

// Extract domain, topic, and keywords from content
function extractMetadata(content: string): {
  domain: string
  topic: string
  keywords: string[]
  contentType: string
  region: string
  season: string
  businessStage: string
  priorityScore: number
} {
  const lowerContent = content.toLowerCase()
  
  // Determine domain
  let domain = 'general'
  if (lowerContent.includes('pric') || lowerContent.includes('cost') || lowerContent.includes('margin')) {
    domain = 'pricing'
  } else if (lowerContent.includes('seo') || lowerContent.includes('google') || lowerContent.includes('local search')) {
    domain = 'marketing'
  } else if (lowerContent.includes('upsell') || lowerContent.includes('service')) {
    domain = 'sales'
  } else if (lowerContent.includes('crew') || lowerContent.includes('scaling') || lowerContent.includes('operations')) {
    domain = 'operations'
  } else if (lowerContent.includes('customer') || lowerContent.includes('retention') || lowerContent.includes('review')) {
    domain = 'customer-experience'
  }
  
  // Determine topic from first few words
  const firstSentence = content.split('.')[0].toLowerCase()
  const topic = firstSentence.slice(0, 50).replace(/[^a-z0-9]/g, '-')
  
  // Extract keywords
  const keywords = []
  const keywordPatterns = [
    /profit margin/gi, /texas/gi, /pricing/gi, /upselling/gi, /google/gi, /seo/gi,
    /customers/gi, /landscaping/gi, /business/gi, /marketing/gi, /crew/gi, /seasonal/gi
  ]
  
  keywordPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      keywords.push(...matches.map(m => m.toLowerCase()))
    }
  })
  
  // Determine content type
  let contentType = 'strategy'
  if (lowerContent.includes('$') || lowerContent.includes('percent') || lowerContent.includes('average')) {
    contentType = 'data'
  } else if (lowerContent.includes('say') || lowerContent.includes('script') || lowerContent.includes('"')) {
    contentType = 'script'
  } else if (lowerContent.includes('step') || lowerContent.includes('process')) {
    contentType = 'process'
  }
  
  // Determine region
  let region = 'general'
  if (lowerContent.includes('texas') || lowerContent.includes('dallas') || lowerContent.includes('houston')) {
    region = 'texas'
  }
  
  // Determine season
  let season = 'year-round'
  if (lowerContent.includes('spring') || lowerContent.includes('march') || lowerContent.includes('april')) {
    season = 'spring'
  } else if (lowerContent.includes('summer') || lowerContent.includes('june') || lowerContent.includes('july')) {
    season = 'summer'
  } else if (lowerContent.includes('fall') || lowerContent.includes('autumn') || lowerContent.includes('september')) {
    season = 'fall'
  } else if (lowerContent.includes('winter') || lowerContent.includes('december') || lowerContent.includes('january')) {
    season = 'winter'
  }
  
  // Determine business stage
  let businessStage = 'all'
  if (lowerContent.includes('new business') || lowerContent.includes('startup') || lowerContent.includes('beginning')) {
    businessStage = 'startup'
  } else if (lowerContent.includes('scaling') || lowerContent.includes('growth') || lowerContent.includes('multi-crew')) {
    businessStage = 'scaling'
  } else if (lowerContent.includes('established') || lowerContent.includes('experienced')) {
    businessStage = 'established'
  }
  
  // Calculate priority score based on content quality
  let priorityScore = 5
  if (lowerContent.includes('texas') || lowerContent.includes('specific')) priorityScore += 2
  if (lowerContent.includes('$') || lowerContent.includes('%')) priorityScore += 1
  if (lowerContent.includes('proven') || lowerContent.includes('successful')) priorityScore += 1
  if (content.length > 400) priorityScore += 1
  
  return {
    domain,
    topic,
    keywords: [...new Set(keywords)].slice(0, 10), // Unique keywords, max 10
    contentType,
    region,
    season,
    businessStage,
    priorityScore: Math.min(priorityScore, 10)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Read the research documents
    const docsPath = path.join(process.cwd(), 'docs')
    const files = [
      'landscaping_playbook_gpt_deep research.md',
      'Claude Landscaping Deep Research_AI Sidekick.md'
    ]
    
    let processedCount = 0
    const results = []
    
    for (const filename of files) {
      const filePath = path.join(docsPath, filename)
      
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`)
        continue
      }
      
      const content = fs.readFileSync(filePath, 'utf8')
      const chunks = chunkContent(content)
      
      console.log(`Processing ${filename}: ${chunks.length} chunks`)
      
      for (const chunk of chunks) {
        const metadata = extractMetadata(chunk.text)
        
        // Generate embedding using OpenAI
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk.text,
          encoding_format: 'float',
        })
        
        // Store in Supabase
        const { error } = await supabase
          .from('landscaping_knowledge')
          .insert({
            content: chunk.text,
            embedding: embedding.data[0].embedding,
            domain: metadata.domain,
            topic: metadata.topic,
            content_type: metadata.contentType,
            region: metadata.region,
            season: metadata.season,
            business_stage: metadata.businessStage,
            source_document: filename,
            section_reference: chunk.section,
            chunk_index: chunk.index,
            keywords: metadata.keywords,
            priority_score: metadata.priorityScore
          })
        
        if (error) {
          console.error('Insert error:', error)
          results.push({ filename, chunk: chunk.index, error: error.message })
        } else {
          processedCount++
          results.push({ filename, chunk: chunk.index, success: true })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} knowledge chunks`,
      results
    })
    
  } catch (error) {
    console.error('Chunking error:', error)
    return NextResponse.json(
      { error: 'Failed to process knowledge chunks', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check current knowledge base
export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    const { data, error } = await supabase
      .from('landscaping_knowledge')
      .select('domain, topic, region, business_stage, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: data.length,
      knowledge: data
    })
    
  } catch (error) {
    console.error('Get knowledge error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve knowledge', details: error.message },
      { status: 500 }
    )
  }
}