export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function createFileContextConfirmation(hasFiles: boolean): ChatMessage | null {
  if (!hasFiles) {
    return null;
  }

  return {
    role: 'system',
    content: `✅ Your uploaded file was analyzed and included in the business response. Let me know if you want to dig deeper into pricing, competition, or design ideas based on what was found.`
  };
}

export function createFileAnalysisContext(fileContext: string): ChatMessage {
  return {
    role: 'system',
    content: `${fileContext}

IMPORTANT FILE ANALYSIS INSTRUCTIONS:
- Focus on landscaping business applications and insights
- Provide specific, actionable recommendations
- If analyzing images: Look for plant health, landscape design opportunities, maintenance needs
- If analyzing documents: Review for business improvement opportunities, pricing strategies, marketing effectiveness
- Always end with concrete next steps the business owner can implement immediately`
  };
}

// Enhanced file processing with better context awareness
export function enhanceFileContext(fileContext: string, userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  let enhancedInstructions = '';
  
  // Add context-specific instructions based on user intent
  if (message.includes('competitor') || message.includes('competition')) {
    enhancedInstructions = `
COMPETITIVE ANALYSIS FOCUS:
- Extract pricing strategies and service offerings
- Identify market positioning and messaging approaches  
- Note any weaknesses or gaps in their service lineup
- Suggest counter-strategies and differentiation opportunities`;
  } else if (message.includes('pricing') || message.includes('quote') || message.includes('estimate')) {
    enhancedInstructions = `
PRICING ANALYSIS FOCUS:
- Break down all cost components and pricing structure
- Identify potential upselling or add-on opportunities
- Compare pricing to market standards for the area
- Suggest optimization strategies for better margins`;
  } else if (message.includes('design') || message.includes('before') || message.includes('after')) {
    enhancedInstructions = `
DESIGN OPPORTUNITY FOCUS:
- Assess current landscaping condition and maintenance needs
- Identify high-impact improvements with good ROI
- Suggest premium upgrades that justify higher pricing
- Consider seasonal timing and implementation phases`;
  } else if (message.includes('marketing') || message.includes('flyer') || message.includes('ad')) {
    enhancedInstructions = `
MARKETING INTELLIGENCE FOCUS:
- Analyze messaging strategy and target audience positioning
- Extract successful copy and design elements
- Identify marketing channels and tactics being used
- Suggest improvements or alternative approaches`;
  }

  return `${fileContext}${enhancedInstructions}

IMPORTANT FILE ANALYSIS INSTRUCTIONS:
- Focus on landscaping business applications and insights
- Provide specific, actionable recommendations
- **FORMATTING REQUIREMENT:** Use the same emerald green theme and HTML table formatting as regular chat responses
- Present any structured data in HTML tables with emerald green headers (#34d399)
- Use emerald green numbered strategic insights format for analysis
- Always end with concrete next steps the business owner can implement immediately`;
}