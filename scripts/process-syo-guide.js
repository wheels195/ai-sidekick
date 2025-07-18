require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = new OpenAI({ apiKey: openaiKey })

// Function to chunk content by sections
function chunkContentBySections(content) {
  const chunks = []
  const lines = content.split('\n')
  let currentChunk = ''
  let currentSection = ''
  let chunkIndex = 0
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Detect section headers (## headers)
    if (trimmedLine.startsWith('## ')) {
      // Save previous chunk if it exists
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
      }
      
      // Start new section
      currentSection = trimmedLine.replace('## ', '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      currentChunk = trimmedLine + '\n'
    } else if (trimmedLine) {
      currentChunk += line + '\n'
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      section: currentSection,
      index: chunkIndex
    })
  }
  
  return chunks
}

// Function to categorize content and extract metadata
function categorizeChunk(content, section) {
  const contentLower = content.toLowerCase()
  const sectionLower = section.toLowerCase()
  
  // Clean up section name - truncate to fit database constraints (VARCHAR(100) for topic)
  const cleanSection = section.length > 100 ? section.substring(0, 97) + '...' : section
  
  // Determine domain based on content and section
  let domain = 'operations'
  if (sectionLower.includes('pricing') || contentLower.includes('price') || contentLower.includes('cost') || contentLower.includes('margin')) {
    domain = 'pricing'
  } else if (sectionLower.includes('branding') || sectionLower.includes('perception') || contentLower.includes('brand') || contentLower.includes('marketing')) {
    domain = 'marketing'
  } else if (sectionLower.includes('retention') || sectionLower.includes('referral') || contentLower.includes('customer')) {
    domain = 'customer-retention'
  } else if (sectionLower.includes('seasonal') || contentLower.includes('spring') || contentLower.includes('fall') || contentLower.includes('winter')) {
    domain = 'seasonal-planning'
  } else if (sectionLower.includes('equipment') || contentLower.includes('equipment') || contentLower.includes('mower')) {
    domain = 'equipment'
  } else if (sectionLower.includes('hiring') || contentLower.includes('hiring') || contentLower.includes('crew') || contentLower.includes('employee')) {
    domain = 'hiring'
  } else if (sectionLower.includes('service') || contentLower.includes('upsell') || contentLower.includes('add-on')) {
    domain = 'services'
  }
  
  // Determine content type
  let contentType = 'strategy'
  if (contentLower.includes('$') || contentLower.includes('price') || contentLower.includes('cost')) {
    contentType = 'pricing-data'
  } else if (contentLower.includes('step') || contentLower.includes('implement') || contentLower.includes('process')) {
    contentType = 'process'
  } else if (contentLower.includes('tip') || contentLower.includes('tactic') || contentLower.includes('technique')) {
    contentType = 'tactic'
  }
  
  // Determine business stage
  let businessStage = 'all'
  if (contentLower.includes('new business') || contentLower.includes('start') || contentLower.includes('beginning')) {
    businessStage = 'startup'
  } else if (contentLower.includes('scaling') || contentLower.includes('grow') || contentLower.includes('expand')) {
    businessStage = 'scaling'
  }
  
  // Determine region specificity
  let region = 'general'
  if (contentLower.includes('northern') || contentLower.includes('ohio') || contentLower.includes('michigan') || contentLower.includes('pennsylvania')) {
    region = 'northern'
  } else if (contentLower.includes('southern') || contentLower.includes('texas') || contentLower.includes('florida')) {
    region = 'southern'
  }
  
  // Extract keywords
  const keywords = []
  const keywordPatterns = [
    /\b(pricing|price|cost|margin|profit)\b/gi,
    /\b(mowing|edging|trimming|aeration|overseeding|fertilization)\b/gi,
    /\b(crew|hiring|employee|team)\b/gi,
    /\b(seasonal|spring|summer|fall|winter)\b/gi,
    /\b(equipment|mower|trimmer|blower)\b/gi,
    /\b(upsell|add-on|service|bundle)\b/gi,
    /\b(customer|retention|referral|review)\b/gi,
    /\b(brand|marketing|logo|website)\b/gi
  ]
  
  keywordPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      keywords.push(...matches.map(m => m.toLowerCase()))
    }
  })
  
  // Priority score based on content quality and actionability
  let priorityScore = 5
  if (contentLower.includes('$') && (contentLower.includes('profit') || contentLower.includes('margin'))) {
    priorityScore = 9 // High value pricing data
  } else if (contentLower.includes('implement') || contentLower.includes('step')) {
    priorityScore = 8 // Actionable strategies
  } else if (contentLower.includes('tip') || contentLower.includes('tactic')) {
    priorityScore = 7 // Practical advice
  } else if (contentLower.includes('industry') || contentLower.includes('average')) {
    priorityScore = 8 // Industry benchmarks
  }
  
  return {
    domain,
    topic: cleanSection, // Use cleaned section name
    contentType,
    businessStage,
    region,
    keywords: Array.from(new Set(keywords)), // Remove duplicates
    priorityScore
  }
}

async function processAndStoreGuide() {
  console.log('🚀 Processing SYO Lawn Care Guide...')
  
  try {
    // Clear any existing SYO guide data
    console.log('🧹 Clearing existing SYO guide data...')
    const { error: deleteError } = await supabase
      .from('landscaping_knowledge')
      .delete()
      .eq('source_document', 'syo-lawn-care-guide')
    
    if (deleteError) {
      console.warn('⚠️ Warning during cleanup:', deleteError)
    } else {
      console.log('✅ Existing data cleared')
    }
    
    // Read the guide file
    const guidePath = path.join(__dirname, '..', 'syo-lawn-care-guide.md')
    const content = fs.readFileSync(guidePath, 'utf8')
    
    console.log('📖 Guide content loaded, length:', content.length)
    
    // Chunk the content by sections
    const chunks = chunkContentBySections(content)
    console.log('✂️ Content chunked into', chunks.length, 'sections')
    
    let processedCount = 0
    
    for (const chunk of chunks) {
      try {
        // Categorize and extract metadata
        const metadata = categorizeChunk(chunk.content, chunk.section)
        
        console.log(`📊 Processing chunk ${chunk.index + 1}: ${metadata.domain} - ${metadata.topic}`)
        
        // Generate embedding
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk.content,
          encoding_format: 'float',
        })
        
        // Prepare data for insertion - embedding should be a vector string
        const embeddingVector = `[${embedding.data[0].embedding.join(',')}]`
        
        // Ensure section_reference fits in VARCHAR(50)
        const sectionRef = chunk.section.length > 50 ? chunk.section.substring(0, 47) + '...' : chunk.section
        
        const knowledgeData = {
          content: chunk.content,
          embedding: embeddingVector, // Store as vector format
          domain: metadata.domain,
          topic: metadata.topic,
          content_type: metadata.contentType,
          region: metadata.region,
          season: 'year-round', // Most content is applicable year-round
          business_stage: metadata.businessStage,
          source_document: 'syo-lawn-care-guide',
          section_reference: sectionRef,
          chunk_index: chunk.index,
          keywords: metadata.keywords,
          priority_score: metadata.priorityScore
        }
        
        // Insert into database
        const { error: insertError } = await supabase
          .from('landscaping_knowledge')
          .insert(knowledgeData)
        
        if (insertError) {
          console.error(`❌ Error inserting chunk ${chunk.index}:`, insertError)
        } else {
          processedCount++
          console.log(`✅ Successfully stored chunk ${chunk.index + 1}/${chunks.length}`)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (chunkError) {
        console.error(`❌ Error processing chunk ${chunk.index}:`, chunkError)
      }
    }
    
    console.log(`🎉 Processing complete! Successfully stored ${processedCount}/${chunks.length} chunks`)
    
    // Verify storage
    const { data: verifyData, error: verifyError } = await supabase
      .from('landscaping_knowledge')
      .select('id, domain, topic, priority_score')
      .eq('source_document', 'syo-lawn-care-guide')
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError)
    } else {
      console.log('🔍 Verification: Found', verifyData.length, 'stored chunks')
      
      // Show summary by domain
      const domainSummary = verifyData.reduce((acc, item) => {
        acc[item.domain] = (acc[item.domain] || 0) + 1
        return acc
      }, {})
      
      console.log('📈 Domain distribution:', domainSummary)
    }
    
  } catch (error) {
    console.error('❌ Processing failed:', error)
    process.exit(1)
  }
}

// Run the processing
processAndStoreGuide()