import { encoding_for_model } from 'tiktoken'

export interface TokenCount {
  promptTokens: number
  completionTokens?: number
  totalTokens: number
}

/**
 * Count tokens for a given text using tiktoken
 * More accurate than character-based estimation
 */
export function countTokens(text: string, model: string = 'gpt-4o'): number {
  try {
    // Get the appropriate encoding for the model
    const encoding = encoding_for_model(model as any)
    const tokens = encoding.encode(text)
    const count = tokens.length
    encoding.free() // Free memory
    return count
  } catch (error) {
    console.error('Error counting tokens with tiktoken:', error)
    // Fallback to character estimation
    return Math.ceil(text.length / 4)
  }
}

/**
 * Count tokens for chat messages format
 * Accounts for message structure overhead
 */
export function countChatTokens(messages: any[], model: string = 'gpt-4o'): number {
  try {
    const encoding = encoding_for_model(model as any)
    let totalTokens = 0
    
    // Each message has overhead tokens for role and structure
    const tokensPerMessage = 3 // GPT-4 models use 3 tokens per message
    const tokensPerName = 1
    
    for (const message of messages) {
      totalTokens += tokensPerMessage
      
      // Count tokens for each property
      if (message.role) {
        totalTokens += encoding.encode(message.role).length
      }
      if (message.content) {
        totalTokens += encoding.encode(message.content).length
      }
      if (message.name) {
        totalTokens += encoding.encode(message.name).length + tokensPerName
      }
    }
    
    // Every reply is primed with assistant role
    totalTokens += 3
    
    encoding.free()
    return totalTokens
  } catch (error) {
    console.error('Error counting chat tokens:', error)
    // Fallback estimation
    const text = JSON.stringify(messages)
    return Math.ceil(text.length / 4)
  }
}

/**
 * Pre-check if user has enough tokens for a request
 */
export function checkTokenLimit(
  usedTokens: number,
  requestTokens: number,
  limitTokens: number = 250000
): { allowed: boolean; remaining: number; needed: number } {
  const remaining = limitTokens - usedTokens
  const allowed = requestTokens <= remaining
  
  return {
    allowed,
    remaining,
    needed: requestTokens
  }
}

/**
 * Calculate accurate cost for token usage
 * Costs per 1M tokens as of August 2024
 */
export function calculateTokenCost(
  tokens: number,
  model: string,
  type: 'input' | 'output'
): number {
  const costs = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 }
  }
  
  const modelCosts = costs[model] || costs['gpt-4o-mini']
  const costPer1M = type === 'input' ? modelCosts.input : modelCosts.output
  
  return (tokens / 1_000_000) * costPer1M
}