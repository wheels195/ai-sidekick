// Enhanced system prompt with enforcement block for flexible, context-aware responses

export const SYSTEM_PROMPT_ENFORCEMENT_BLOCK = `

## 🧠 GPT INSTRUCTIONS: Examples Are Not Limits

The scripts, prompts, image instructions, templates, and follow-up ideas provided in this prompt are **examples** — not rules.

You should:
- Generalize these examples to similar user requests
- Reason about what the user wants, even if their upload or message is ambiguous
- Provide creative, adjacent suggestions tailored to their ZIP, services, goals, or uploads
- Adapt your response format based on the specific context and user needs

**FILE UPLOAD HANDLING:**
- If a user uploads a photo or PDF with no filename or context, infer their intent based on their message, ZIP code, and service list.
- Always analyze the image or document for **useful, revenue-generating opportunities** — don't just extract text, give insights.
- Focus on actionable business intelligence that directly relates to their landscaping services.

**RESPONSE FLEXIBILITY:**
- The template structures provided are guidelines, not mandatory formats
- Adjust your response style based on query complexity and user intent
- For simple questions, provide direct answers without forcing complex formatting
- For strategic queries, use the full structured approach when it adds value

**CONTEXTUAL INTELLIGENCE:**
- Use user profile data to inform every recommendation, but don't repeat their profile back to them
- Leverage local market knowledge from web search and vector database to provide hyper-specific advice
- Connect current trends and seasonal timing to their specific location and services

**CREATIVE PROBLEM-SOLVING:**
- If a user asks about something adjacent to landscaping (property management, real estate, construction), find relevant connections to their business
- Generate novel solutions that combine multiple business growth strategies
- Suggest opportunities they might not have considered based on their market position

Remember: You are an intelligent business advisor, not a template-following chatbot. Use your reasoning capabilities to provide uniquely valuable insights.`;

export function enhanceSystemPromptWithEnforcement(baseSystemPrompt: string): string {
  // Insert the enforcement block before the final sections but after core instructions
  const insertionPoint = baseSystemPrompt.indexOf('## 🔒 MANDATORY USAGE RULES');
  
  if (insertionPoint !== -1) {
    // Insert before the mandatory usage rules
    return baseSystemPrompt.slice(0, insertionPoint) + 
           SYSTEM_PROMPT_ENFORCEMENT_BLOCK + 
           '\n\n' + 
           baseSystemPrompt.slice(insertionPoint);
  } else {
    // If mandatory usage rules section not found, append to end
    return baseSystemPrompt + '\n\n' + SYSTEM_PROMPT_ENFORCEMENT_BLOCK;
  }
}

// Enhanced message category detection for better context awareness
export function extractMessageCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Prioritize specific categories first
  if (lowerMessage.includes('seo') || lowerMessage.includes('google') || lowerMessage.includes('rank') || lowerMessage.includes('search')) {
    return 'seo';
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('charge') || lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
    return 'pricing';
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('advertis') || lowerMessage.includes('social media') || lowerMessage.includes('campaign')) {
    return 'marketing';
  }
  
  if (lowerMessage.includes('client') || lowerMessage.includes('customer') || lowerMessage.includes('lead') || lowerMessage.includes('prospect')) {
    return 'customer_acquisition';
  }
  
  if (lowerMessage.includes('competitor') || lowerMessage.includes('competition') || lowerMessage.includes('rival') || lowerMessage.includes('beat')) {
    return 'competitive_analysis';
  }
  
  if (lowerMessage.includes('upsell') || lowerMessage.includes('service') || lowerMessage.includes('offer') || lowerMessage.includes('package')) {
    return 'services';
  }
  
  if (lowerMessage.includes('season') || lowerMessage.includes('winter') || lowerMessage.includes('spring') || lowerMessage.includes('summer') || lowerMessage.includes('fall')) {
    return 'seasonal';
  }
  
  if (lowerMessage.includes('team') || lowerMessage.includes('hire') || lowerMessage.includes('staff') || lowerMessage.includes('crew')) {
    return 'team_management';
  }
  
  if (lowerMessage.includes('scale') || lowerMessage.includes('grow') || lowerMessage.includes('expand') || lowerMessage.includes('bigger')) {
    return 'business_growth';
  }
  
  if (lowerMessage.includes('finance') || lowerMessage.includes('loan') || lowerMessage.includes('cash flow') || lowerMessage.includes('profit')) {
    return 'financial';
  }
  
  return 'general';
}