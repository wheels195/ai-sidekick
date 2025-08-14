import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface KnowledgeChunk {
  id: string
  content: string
  domain: string
  topic: string
  region: string
  similarity: number
}

export interface SearchOptions {
  maxResults?: number
  similarityThreshold?: number
  domain?: string
  region?: string
  businessStage?: string
  season?: string
}

export async function searchKnowledge(
  request: NextRequest,
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeChunk[]> {
  const {
    maxResults = 3,
    similarityThreshold = 0.75,
    domain,
    region,
    businessStage,
    season
  } = options

  try {
    const { supabase } = createClient(request)
    
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    })
    
    const queryEmbedding = embedding.data[0].embedding
    
    // Build the SQL query with optional filters
    let sqlQuery = `
      SELECT 
        id,
        content,
        domain,
        topic,
        region,
        1 - (embedding <=> $1::vector) as similarity
      FROM landscaping_knowledge
      WHERE 1 - (embedding <=> $1::vector) > $2
    `
    
    const params = [queryEmbedding, similarityThreshold]
    let paramIndex = 3
    
    // Add optional filters
    if (domain) {
      sqlQuery += ` AND domain = $${paramIndex}`
      params.push(domain)
      paramIndex++
    }
    
    if (region) {
      sqlQuery += ` AND (region = $${paramIndex} OR region = 'general')`
      params.push(region)
      paramIndex++
    }
    
    if (businessStage) {
      sqlQuery += ` AND (business_stage = $${paramIndex} OR business_stage = 'all')`
      params.push(businessStage)
      paramIndex++
    }
    
    if (season) {
      sqlQuery += ` AND (season = $${paramIndex} OR season = 'year-round')`
      params.push(season)
      paramIndex++
    }
    
    sqlQuery += `
      ORDER BY embedding <=> $1::vector
      LIMIT $${paramIndex}
    `
    params.push(maxResults)
    
    // For now, use a simpler approach since RPC isn't available
    // Get all knowledge chunks and do client-side similarity ranking
    const { data, error } = await supabase
      .from('landscaping_knowledge')
      .select('id, content, domain, topic, region, embedding')
      .limit(50) // Get more chunks for better selection
    
    if (error) {
      console.error('Vector search error:', error)
      return []
    }
    
    if (!data || data.length === 0) {
      return []
    }
    
    // Calculate similarities client-side (simplified)
    const results = data
      .map(item => {
        // Simple similarity calculation based on content matching
        const queryWords = query.toLowerCase().split(/\s+/)
        const contentWords = item.content.toLowerCase().split(/\s+/)
        
        let matchCount = 0
        queryWords.forEach(word => {
          if (contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))) {
            matchCount++
          }
        })
        
        const similarity = matchCount / queryWords.length
        
        return {
          ...item,
          similarity
        }
      })
      .filter(item => item.similarity > similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
    
    return results
    
  } catch (error) {
    console.error('Knowledge search error:', error)
    return []
  }
}

// Search user-specific knowledge
export async function searchUserKnowledge(
  request: NextRequest,
  query: string,
  userId: string,
  maxResults: number = 2
): Promise<KnowledgeChunk[]> {
  try {
    const { supabase } = createClient(request)
    
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    })
    
    // Get user-specific knowledge with simple text matching for now
    const { data, error } = await supabase
      .from('user_knowledge')
      .select('id, content, content_category, data_type, original_filename')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(10)
    
    if (error || !data || data.length === 0) {
      return []
    }
    
    // Simple keyword matching for user files
    const queryWords = query.toLowerCase().split(/\s+/)
    const results = data
      .map(item => {
        const contentWords = item.content.toLowerCase().split(/\s+/)
        let matchCount = 0
        
        queryWords.forEach(word => {
          if (contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))) {
            matchCount++
          }
        })
        
        const similarity = matchCount / queryWords.length
        
        return {
          id: item.id,
          content: item.content,
          domain: item.content_category,
          topic: item.data_type,
          region: 'user_specific',
          similarity,
          filename: item.original_filename
        }
      })
      .filter(item => item.similarity > 0.65)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
    
    return results
  } catch (error) {
    console.error('User knowledge search error:', error)
    return []
  }
}

// Enhanced search that combines multiple strategies
export async function enhancedKnowledgeSearch(
  request: NextRequest,
  query: string,
  userProfile?: {
    location?: string
    business_stage?: string
    trade?: string
    id?: string
  }
): Promise<string> {
  const searchOptions: SearchOptions = {
    maxResults: 3,
    similarityThreshold: 0.75
  }
  
  // Add user context to search
  if (userProfile?.location?.toLowerCase().includes('texas')) {
    searchOptions.region = 'texas'
  }
  
  if (userProfile?.business_stage) {
    searchOptions.businessStage = userProfile.business_stage
  }
  
  // Determine current season for seasonal advice
  const currentMonth = new Date().getMonth()
  if (currentMonth >= 2 && currentMonth <= 4) {
    searchOptions.season = 'spring'
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    searchOptions.season = 'summer'
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    searchOptions.season = 'fall'
  } else {
    searchOptions.season = 'winter'
  }
  
  // Perform the search for global knowledge
  const globalResults = await searchKnowledge(request, query, searchOptions)
  
  // Search user-specific knowledge if user is authenticated
  let userResults: KnowledgeChunk[] = []
  if (userProfile?.id) {
    userResults = await searchUserKnowledge(request, query, userProfile.id, 2)
  }
  
  // Combine results
  let allResults = [...userResults, ...globalResults]
  
  // If no results with primary threshold (0.75), try fallback threshold (0.65)
  if (allResults.length === 0) {
    const fallbackResults = await searchKnowledge(request, query, userProfile, {
      maxResults: 3,
      similarityThreshold: 0.65,
      domain: userProfile?.domain,
      region: userProfile?.region,
      businessStage: userProfile?.business_stage
    })
    allResults = [...fallbackResults]
  }
  
  if (allResults.length === 0) {
    return ''
  }
  
  // Format results for injection into system prompt
  // Remove all user-visible provenance - no "from your files" or source mentions
  const knowledgeContext = allResults
    .slice(0, 3) // Cap chunks to avoid overwhelming context
    .map((chunk, index) => chunk.content)
    .join('\n\n---\n\n')
  
  return `RELEVANT BUSINESS CONTEXT:\n\n${knowledgeContext}\n\n---\n\nIntegrate this information naturally into your response without mentioning sources, files, or external references. Present insights as your own business expertise.`
}

// Simple keyword-based search as fallback
export async function keywordSearch(
  request: NextRequest,
  query: string,
  maxResults: number = 3
): Promise<KnowledgeChunk[]> {
  try {
    const { supabase } = createClient(request)
    
    // Extract keywords from query
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    
    const { data, error } = await supabase
      .from('landscaping_knowledge')
      .select('id, content, domain, topic, region')
      .or(keywords.map(keyword => `content.ilike.%${keyword}%`).join(','))
      .limit(maxResults)
    
    if (error) {
      console.error('Keyword search error:', error)
      return []
    }
    
    return data.map(item => ({
      ...item,
      similarity: 0.7 // Default similarity for keyword search
    }))
    
  } catch (error) {
    console.error('Keyword search error:', error)
    return []
  }
}