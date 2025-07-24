import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ModerationResult {
  allowed: boolean
  flagged: boolean
  categories: string[]
  categoryScores: Record<string, number>
  reason?: string
  userMessage?: string
}

export interface ModerationLog {
  userId?: string
  sessionId?: string
  content: string
  contentType: 'message' | 'file_content' | 'dalle_prompt' | 'file_upload'
  result: ModerationResult
  actionTaken: 'blocked' | 'allowed' | 'modified' | 'logged'
  ipAddress?: string
  userAgent?: string
}

// Content type specific thresholds and messages
const MODERATION_CONFIG = {
  message: {
    threshold: 0.7,
    userMessage: "I can't help with that request. Please keep our conversation focused on business growth strategies."
  },
  file_content: {
    threshold: 0.8,
    userMessage: "The file content violates our content policy and cannot be processed."
  },
  dalle_prompt: {
    threshold: 0.6,
    userMessage: "I can't generate that image. Please try a different prompt focused on business or marketing materials."
  },
  file_upload: {
    threshold: 0.8,
    userMessage: "File upload blocked due to content policy violation."
  }
}

// Categories that should always be blocked regardless of score
const ALWAYS_BLOCK_CATEGORIES = [
  'hate',
  'hate/threatening',
  'harassment/threatening',
  'self-harm',
  'self-harm/intent',
  'self-harm/instructions',
  'sexual/minors',
  'violence'
]

// Business-appropriate content guidelines
const BUSINESS_CONTENT_GUIDELINES = [
  'Keep discussions focused on legitimate business practices',
  'Avoid requests for unethical business advice',
  'No content promoting illegal business activities',
  'Maintain professional and respectful communication'
]

/**
 * Moderate content using OpenAI's Moderation API
 */
export async function moderateContent(
  content: string,
  contentType: keyof typeof MODERATION_CONFIG,
  userId?: string,
  sessionId?: string,
  request?: NextRequest
): Promise<ModerationResult> {
  try {
    // Skip moderation for empty content
    if (!content.trim()) {
      return {
        allowed: true,
        flagged: false,
        categories: [],
        categoryScores: {}
      }
    }

    // Truncate very long content for moderation
    const moderationContent = content.length > 4000 
      ? content.substring(0, 4000) + '...[truncated]'
      : content

    // Call OpenAI Moderation API
    const moderation = await openai.moderations.create({
      input: moderationContent
    })

    const result = moderation.results[0]
    const config = MODERATION_CONFIG[contentType]

    // Check if content is flagged
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category, _]) => category)

    // Check category scores against thresholds
    const highScoreCategories = Object.entries(result.category_scores)
      .filter(([category, score]) => {
        // Always block certain categories regardless of threshold
        if (ALWAYS_BLOCK_CATEGORIES.includes(category)) {
          return score > 0.1 // Very low threshold for always-block categories
        }
        return score > config.threshold
      })
      .map(([category, _]) => category)

    const shouldBlock = result.flagged || 
                       flaggedCategories.length > 0 || 
                       highScoreCategories.length > 0 ||
                       flaggedCategories.some(cat => ALWAYS_BLOCK_CATEGORIES.includes(cat))

    const moderationResult: ModerationResult = {
      allowed: !shouldBlock,
      flagged: result.flagged,
      categories: [...new Set([...flaggedCategories, ...highScoreCategories])],
      categoryScores: result.category_scores,
      reason: shouldBlock ? `Content flagged for: ${[...flaggedCategories, ...highScoreCategories].join(', ')}` : undefined,
      userMessage: shouldBlock ? config.userMessage : undefined
    }

    // Log the moderation result
    await logModerationResult({
      userId,
      sessionId,
      content: moderationContent,
      contentType,
      result: moderationResult,
      actionTaken: shouldBlock ? 'blocked' : 'allowed',
      ipAddress: request?.ip,
      userAgent: request?.headers.get('user-agent') || undefined
    }, request)

    return moderationResult

  } catch (error) {
    console.error('Moderation API error:', error)
    
    // In case of moderation API failure, log the error but allow content
    // This prevents legitimate users from being blocked due to API issues
    const fallbackResult: ModerationResult = {
      allowed: true,
      flagged: false,
      categories: [],
      categoryScores: {},
      reason: 'Moderation API unavailable'
    }

    await logModerationResult({
      userId,
      sessionId,
      content: content.substring(0, 1000),
      contentType,
      result: fallbackResult,
      actionTaken: 'allowed',
      ipAddress: request?.ip,
      userAgent: request?.headers.get('user-agent') || undefined
    }, request)

    return fallbackResult
  }
}

/**
 * Log moderation results to database
 */
async function logModerationResult(log: ModerationLog, request?: NextRequest): Promise<void> {
  try {
    if (!request) return

    const { supabase } = await createClient(request)
    
    // Create content hash for duplicate detection
    const contentHash = require('crypto')
      .createHash('sha256')
      .update(log.content)
      .digest('hex')

    await supabase.from('moderation_logs').insert({
      user_id: log.userId,
      session_id: log.sessionId,
      content: log.content,
      content_type: log.contentType,
      content_hash: contentHash,
      moderation_result: {
        flagged: log.result.flagged,
        categories: log.result.categories,
        category_scores: log.result.categoryScores,
        reason: log.result.reason
      },
      is_flagged: !log.result.allowed,
      flagged_categories: log.result.categories,
      action_taken: log.actionTaken,
      user_message: log.result.userMessage,
      ip_address: log.ipAddress,
      user_agent: log.userAgent
    })

    // Track API usage
    await supabase.from('api_usage_tracking').insert({
      user_id: log.userId,
      api_type: 'moderation',
      endpoint: '/moderation',
      tokens_used: Math.ceil(log.content.length / 4), // Rough token estimate
      cost_usd: (Math.ceil(log.content.length / 4) / 1000) * 0.002, // $0.002 per 1K tokens
      cost_breakdown: {
        content_type: log.contentType,
        action_taken: log.actionTaken,
        tokens_estimated: Math.ceil(log.content.length / 4)
      }
    })

  } catch (error) {
    console.error('Failed to log moderation result:', error)
    // Don't throw error as this shouldn't block the main request
  }
}

/**
 * Moderate user message before sending to chat API
 */
export async function moderateUserMessage(
  message: string,
  userId: string,
  sessionId?: string,
  request?: NextRequest
): Promise<ModerationResult> {
  return moderateContent(message, 'message', userId, sessionId, request)
}

/**
 * Moderate DALL-E prompt before image generation
 */
export async function moderateDallePrompt(
  prompt: string,
  userId: string,
  request?: NextRequest
): Promise<ModerationResult> {
  return moderateContent(prompt, 'dalle_prompt', userId, undefined, request)
}

/**
 * Moderate file content after extraction
 */
export async function moderateFileContent(
  content: string,
  userId: string,
  request?: NextRequest
): Promise<ModerationResult> {
  return moderateContent(content, 'file_content', userId, undefined, request)
}

/**
 * Enhanced moderation for business context
 * Adds additional checks for business-appropriate content
 */
export async function moderateBusinessContent(
  content: string,
  contentType: keyof typeof MODERATION_CONFIG,
  userId?: string,
  request?: NextRequest
): Promise<ModerationResult> {
  // First run standard moderation
  const standardResult = await moderateContent(content, contentType, userId, undefined, request)
  
  if (!standardResult.allowed) {
    return standardResult
  }

  // Additional business context checks
  const businessKeywords = [
    'illegal', 'fraud', 'scam', 'cheat', 'steal', 'bribe',
    'money laundering', 'tax evasion', 'insider trading',
    'pyramid scheme', 'ponzi scheme'
  ]

  const lowerContent = content.toLowerCase()
  const suspiciousKeywords = businessKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  )

  if (suspiciousKeywords.length > 0) {
    return {
      allowed: false,
      flagged: true,
      categories: ['business-policy'],
      categoryScores: { 'business-policy': 0.9 },
      reason: `Content may violate business ethics guidelines: ${suspiciousKeywords.join(', ')}`,
      userMessage: "I can only provide advice on legitimate business practices. Please rephrase your question to focus on ethical business growth strategies."
    }
  }

  return standardResult
}

/**
 * Get moderation statistics for admin dashboard
 */
export async function getModerationStats(
  request: NextRequest,
  timeframe: 'day' | 'week' | 'month' = 'week'
): Promise<{
  totalChecks: number
  flaggedContent: number
  flaggedRate: number
  topCategories: Array<{category: string, count: number}>
  contentTypes: Record<string, number>
}> {
  try {
    const { supabase } = await createClient(request)
    
    let dateFilter = new Date()
    switch (timeframe) {
      case 'day':
        dateFilter.setDate(dateFilter.getDate() - 1)
        break
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
    }

    const { data: logs } = await supabase
      .from('moderation_logs')
      .select('*')
      .gte('created_at', dateFilter.toISOString())

    if (!logs) {
      return {
        totalChecks: 0,
        flaggedContent: 0,
        flaggedRate: 0,
        topCategories: [],
        contentTypes: {}
      }
    }

    const totalChecks = logs.length
    const flaggedContent = logs.filter(log => log.is_flagged).length
    const flaggedRate = totalChecks > 0 ? (flaggedContent / totalChecks) * 100 : 0

    // Count categories
    const categoryCount: Record<string, number> = {}
    const contentTypeCount: Record<string, number> = {}

    logs.forEach(log => {
      // Count content types
      contentTypeCount[log.content_type] = (contentTypeCount[log.content_type] || 0) + 1

      // Count flagged categories
      if (log.is_flagged && log.flagged_categories) {
        log.flagged_categories.forEach((category: string) => {
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })
      }
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }))

    return {
      totalChecks,
      flaggedContent,
      flaggedRate: Math.round(flaggedRate * 100) / 100,
      topCategories,
      contentTypes: contentTypeCount
    }

  } catch (error) {
    console.error('Failed to get moderation stats:', error)
    return {
      totalChecks: 0,
      flaggedContent: 0,
      flaggedRate: 0,
      topCategories: [],
      contentTypes: {}
    }
  }
}