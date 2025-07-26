// Chat Enhancement Utilities for AI Sidekick
// Modular functions to improve chat API functionality

export { 
  getImageAnalysisPrompt,
  type FileInfo 
} from './getImageAnalysisPrompt';

export {
  getCachedPlacesResult,
  cachePlacesResult,
  performCachedGooglePlacesSearch
} from './googlePlacesCache';

export {
  SYSTEM_PROMPT_ENFORCEMENT_BLOCK,
  enhanceSystemPromptWithEnforcement,
  extractMessageCategory
} from './systemPromptEnhancements';

export {
  createFileContextConfirmation,
  createFileAnalysisContext,
  enhanceFileContext,
  type ChatMessage
} from './fileContextSystem';

// Utility functions for better code organization
export function detectHighValueQuery(userMessage: string, userProfile: any): boolean {
  const message = userMessage.toLowerCase();
  
  // Complex business strategy queries
  if (message.includes('strategy') || message.includes('plan') || message.includes('approach')) {
    return true;
  }
  
  // Multi-step implementation requests
  if (message.includes('how to') && (message.includes('step') || message.includes('process') || message.includes('implement'))) {
    return true;
  }
  
  // Revenue optimization and pricing analysis
  if ((message.includes('revenue') || message.includes('profit') || message.includes('money')) && 
      (message.includes('increase') || message.includes('optimize') || message.includes('improve'))) {
    return true;
  }
  
  // Complex competitive analysis
  if (message.includes('competitor') && (message.includes('analysis') || message.includes('beat') || message.includes('advantage'))) {
    return true;
  }
  
  // Business scaling and growth planning
  if ((message.includes('scale') || message.includes('grow') || message.includes('expand')) && 
      (message.includes('business') || message.includes('team') || message.includes('operation'))) {
    return true;
  }
  
  // Complex client acquisition strategies
  if (message.includes('client') && message.match(/\d+/)) { // Contains numbers (e.g., "10 clients")
    return true;
  }
  
  // Marketing campaigns and multi-channel strategies
  if (message.includes('campaign') || (message.includes('marketing') && message.includes('channel'))) {
    return true;
  }
  
  // Long-form content requests
  if (message.length > 100) { // Detailed, complex queries
    return true;
  }
  
  return false;
}

export function detectQuestionIntent(userMessage: string, userProfile: any): string {
  const message = userMessage.toLowerCase();
  
  // Client acquisition intent
  if (message.includes('client') || message.includes('customer') || message.includes('lead')) {
    return `${userMessage} client acquisition lead generation ${userProfile?.target_customers || 'residential'}`;
  }
  
  // Pricing and revenue intent
  if (message.includes('pric') || message.includes('money') || message.includes('revenue') || message.includes('profit')) {
    return `${userMessage} pricing strategies revenue optimization ${userProfile?.services?.join(' ') || 'landscaping services'}`;
  }
  
  // Marketing and SEO intent
  if (message.includes('market') || message.includes('seo') || message.includes('advertis') || message.includes('online')) {
    return `${userMessage} marketing SEO digital advertising ${userProfile?.zip_code || 'local market'}`;
  }
  
  // Seasonal and operations intent
  if (message.includes('season') || message.includes('winter') || message.includes('spring') || message.includes('summer') || message.includes('fall')) {
    return `${userMessage} seasonal business planning operations ${userProfile?.services?.join(' ') || 'landscaping'}`;
  }
  
  // Competition intent
  if (message.includes('compet') || message.includes('beat') || message.includes('against')) {
    return `${userMessage} competitive strategy market positioning ${userProfile?.location || 'local market'}`;
  }
  
  // Team and scaling intent
  if (message.includes('team') || message.includes('grow') || message.includes('scale') || message.includes('hire')) {
    return `${userMessage} team management business growth scaling operations`;
  }
  
  // Default: enhance with user context
  return `${userMessage} ${userProfile?.trade || 'landscaping'} ${userProfile?.services?.join(' ') || ''} business advice`;
}