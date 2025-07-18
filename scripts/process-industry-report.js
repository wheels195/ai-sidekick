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

// Function to chunk content by sections - enhanced for industry report
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
      // Save previous chunk if it exists and has sufficient content
      if (currentChunk.trim() && currentChunk.length > 50) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
      }
      
      // Start new section
      currentSection = trimmedLine.replace('## ', '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      currentChunk = trimmedLine + '\n'
    } else if (trimmedLine.startsWith('### ')) {
      // Sub-sections get included in current chunk but can also be section markers
      currentChunk += line + '\n'
      
      // If chunk is getting large, consider splitting at subsections
      if (currentChunk.length > 1000 && currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          index: chunkIndex++
        })
        
        // Start new chunk with the subsection
        const subsection = trimmedLine.replace('### ', '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
        currentSection = subsection
        currentChunk = trimmedLine + '\n'
      }
    } else if (trimmedLine) {
      currentChunk += line + '\n'
    }
  }
  
  // Add final chunk
  if (currentChunk.trim() && currentChunk.length > 50) {
    chunks.push({
      content: currentChunk.trim(),
      section: currentSection,
      index: chunkIndex
    })
  }
  
  return chunks
}

// Enhanced categorization for industry report data
function categorizeChunk(content, section) {
  const contentLower = content.toLowerCase()
  const sectionLower = section.toLowerCase()
  
  // Clean up section name - truncate to fit database constraints
  const cleanSection = section.length > 100 ? section.substring(0, 97) + '...' : section
  
  // Determine domain based on content and section
  let domain = 'operations'
  
  if (sectionLower.includes('pricing') || contentLower.includes('pricing') || contentLower.includes('price') || 
      contentLower.includes('cost') || contentLower.includes('margin') || contentLower.includes('$')) {
    domain = 'pricing'
  } else if (sectionLower.includes('insight') || sectionLower.includes('key') || contentLower.includes('industry') || 
            contentLower.includes('market') || contentLower.includes('revenue') || contentLower.includes('growth')) {
    domain = 'industry-data'
  } else if (sectionLower.includes('location') || sectionLower.includes('regional') || contentLower.includes('state') || 
            contentLower.includes('california') || contentLower.includes('texas') || contentLower.includes('florida')) {
    domain = 'regional-intelligence'
  } else if (sectionLower.includes('service') || contentLower.includes('maintenance') || contentLower.includes('design-build') || 
            contentLower.includes('lawn care') || contentLower.includes('landscaping services')) {
    domain = 'services'
  } else if (sectionLower.includes('seasonal') || contentLower.includes('spring') || contentLower.includes('summer') || 
            contentLower.includes('fall') || contentLower.includes('winter')) {
    domain = 'seasonal-planning'
  } else if (sectionLower.includes('implementation') || sectionLower.includes('actionable') || contentLower.includes('tactic') || 
            contentLower.includes('step') || contentLower.includes('recommend')) {
    domain = 'strategy'
  } else if (contentLower.includes('upsell') || contentLower.includes('opportunity') || contentLower.includes('bundle')) {
    domain = 'upselling'
  }
  
  // Determine content type
  let contentType = 'data'
  if (contentLower.includes('$') || contentLower.includes('price') || contentLower.includes('cost') || contentLower.includes('margin')) {
    contentType = 'pricing-data'
  } else if (contentLower.includes('step') || contentLower.includes('implement') || contentLower.includes('action') || contentLower.includes('tactic')) {
    contentType = 'strategy'
  } else if (contentLower.includes('industry') || contentLower.includes('market') || contentLower.includes('average') || contentLower.includes('benchmark')) {
    contentType = 'industry-benchmark'
  } else if (contentLower.includes('timeline') || contentLower.includes('when') || contentLower.includes('schedule')) {
    contentType = 'process'
  }
  
  // Determine business stage
  let businessStage = 'all'
  if (contentLower.includes('startup') || contentLower.includes('new business') || contentLower.includes('beginning')) {
    businessStage = 'startup'
  } else if (contentLower.includes('scaling') || contentLower.includes('grow') || contentLower.includes('expand') || contentLower.includes('hiring')) {
    businessStage = 'scaling'
  } else if (contentLower.includes('established') || contentLower.includes('mature') || contentLower.includes('large')) {
    businessStage = 'established'
  }
  
  // Determine region specificity
  let region = 'general'
  if (contentLower.includes('california') || contentLower.includes('arizona') || contentLower.includes('west')) {
    region = 'west'
  } else if (contentLower.includes('texas') || contentLower.includes('florida') || contentLower.includes('south') || contentLower.includes('sunbelt')) {
    region = 'south'
  } else if (contentLower.includes('new york') || contentLower.includes('michigan') || contentLower.includes('minnesota') || contentLower.includes('snowbelt')) {
    region = 'north'
  } else if (contentLower.includes('austin') || contentLower.includes('tampa') || contentLower.includes('phoenix') || contentLower.includes('raleigh')) {
    region = 'growth-markets'
  }
  
  // Determine seasonal context
  let season = 'year-round'
  if (contentLower.includes('spring') || contentLower.includes('fertilization') || contentLower.includes('planting')) {
    season = 'spring'
  } else if (contentLower.includes('summer') || contentLower.includes('irrigation') || contentLower.includes('pruning')) {
    season = 'summer'
  } else if (contentLower.includes('fall') || contentLower.includes('aeration') || contentLower.includes('leaf removal')) {
    season = 'fall'
  } else if (contentLower.includes('winter') || contentLower.includes('snow') || contentLower.includes('hardscape install')) {
    season = 'winter'
  }
  
  // Extract keywords
  const keywords = []
  const keywordPatterns = [
    /\b(pricing|price|cost|margin|profit|revenue|hourly|rate)\b/gi,
    /\b(maintenance|design-build|lawn care|irrigation|hardscaping)\b/gi,
    /\b(california|texas|florida|new york|arizona|drought|snow)\b/gi,
    /\b(seasonal|spring|summer|fall|winter|year-round)\b/gi,
    /\b(industry|market|growth|benchmark|average|trend)\b/gi,
    /\b(upsell|bundle|package|contract|subscription)\b/gi,
    /\b(crm|software|technology|drone|equipment)\b/gi,
    /\b(sustainability|native|organic|water conservation)\b/gi,
    /\b(commercial|residential|municipal|hoa|builder)\b/gi,
    /\b(hiring|labor|crew|training|employee)\b/gi
  ]
  
  keywordPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      keywords.push(...matches.map(m => m.toLowerCase()))
    }
  })
  
  // Priority score based on content value and actionability
  let priorityScore = 6 // Default for industry report content
  
  if (contentLower.includes('$') && (contentLower.includes('average') || contentLower.includes('typical') || contentLower.includes('range'))) {
    priorityScore = 9 // High value pricing data
  } else if (contentLower.includes('actionable') || contentLower.includes('implement') || contentLower.includes('tactic')) {
    priorityScore = 8 // Actionable strategies
  } else if (contentLower.includes('industry') && (contentLower.includes('benchmark') || contentLower.includes('average'))) {
    priorityScore = 8 // Industry benchmarks
  } else if (contentLower.includes('growth') || contentLower.includes('opportunity') || contentLower.includes('market')) {
    priorityScore = 7 // Market intelligence
  } else if (contentLower.includes('timeline') || contentLower.includes('recommendation') || contentLower.includes('step')) {
    priorityScore = 7 // Process guidance
  }
  
  return {
    domain,
    topic: cleanSection,
    contentType,
    businessStage,
    region,
    season,
    keywords: Array.from(new Set(keywords)), // Remove duplicates
    priorityScore
  }
}

async function processIndustryReport() {
  console.log('🏭 Processing 2025 Landscape Industry Report...')
  
  try {
    // Clear any existing industry report data
    console.log('🧹 Clearing existing industry report data...')
    const { error: deleteError } = await supabase
      .from('landscaping_knowledge')
      .delete()
      .eq('source_document', '2025-landscape-industry-report')
    
    if (deleteError) {
      console.warn('⚠️ Warning during cleanup:', deleteError)
    } else {
      console.log('✅ Existing data cleared')
    }
    
    // Read the industry report file
    const reportPath = path.join(__dirname, '..', '2025-landscape-industry-report.md')
    const content = fs.readFileSync(reportPath, 'utf8')
    
    console.log('📊 Industry report content loaded, length:', content.length)
    
    // Chunk the content by sections
    const chunks = chunkContentBySections(content)
    console.log('✂️ Content chunked into', chunks.length, 'sections')
    
    let processedCount = 0
    
    for (const chunk of chunks) {
      try {
        // Categorize and extract metadata
        const metadata = categorizeChunk(chunk.content, chunk.section)
        
        console.log(`📊 Processing chunk ${chunk.index + 1}: ${metadata.domain} - ${metadata.topic} (${metadata.region})`)
        
        // Generate embedding
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk.content,
          encoding_format: 'float',
        })
        
        // Prepare data for insertion
        const embeddingVector = `[${embedding.data[0].embedding.join(',')}]`
        
        // Ensure section_reference fits in VARCHAR(50)
        const sectionRef = chunk.section.length > 50 ? chunk.section.substring(0, 47) + '...' : chunk.section
        
        const knowledgeData = {
          content: chunk.content,
          embedding: embeddingVector,
          domain: metadata.domain,
          topic: metadata.topic,
          content_type: metadata.contentType,
          region: metadata.region,
          season: metadata.season,
          business_stage: metadata.businessStage,
          source_document: '2025-landscape-industry-report',
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
          console.log(`✅ Successfully stored chunk ${chunk.index + 1}/${chunks.length} - Priority: ${metadata.priorityScore}`)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 150))
        
      } catch (chunkError) {
        console.error(`❌ Error processing chunk ${chunk.index}:`, chunkError)
      }
    }
    
    console.log(`🎉 Processing complete! Successfully stored ${processedCount}/${chunks.length} chunks`)
    
    // Verify storage and show detailed summary
    const { data: verifyData, error: verifyError } = await supabase
      .from('landscaping_knowledge')
      .select('id, domain, topic, region, season, priority_score, content_type')
      .eq('source_document', '2025-landscape-industry-report')
    
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
      
      // Show regional breakdown
      const regionSummary = verifyData.reduce((acc, item) => {
        acc[item.region] = (acc[item.region] || 0) + 1
        return acc
      }, {})
      
      console.log('🗺️ Regional distribution:', regionSummary)
      
      // Show priority distribution
      const prioritySummary = verifyData.reduce((acc, item) => {
        const priority = `Priority ${item.priority_score}`
        acc[priority] = (acc[priority] || 0) + 1
        return acc
      }, {})
      
      console.log('⭐ Priority distribution:', prioritySummary)
      
      // Show content types
      const contentTypeSummary = verifyData.reduce((acc, item) => {
        acc[item.content_type] = (acc[item.content_type] || 0) + 1
        return acc
      }, {})
      
      console.log('📝 Content type distribution:', contentTypeSummary)
    }
    
    console.log('🌟 2025 Landscape Industry Report successfully added to global vector database!')
    console.log('💡 This high-quality industry intelligence is now available to enhance all user conversations.')
    
  } catch (error) {
    console.error('❌ Processing failed:', error)
    process.exit(1)
  }
}

// Run the processing
processIndustryReport()