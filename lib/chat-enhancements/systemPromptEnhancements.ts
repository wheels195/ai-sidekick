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

## 🎨 UNIVERSAL FORMATTING REQUIREMENTS

**CRITICAL:** ALL response types (web search, vector database, file uploads, regular chat) MUST use identical formatting:

**CONSISTENT EMERALD GREEN THEME:**
- All headings: Use emerald green (#34d399, #10b981) 
- Important points: Emerald green emphasis
- Call-to-actions: Bold emerald green formatting

**HTML TABLES FOR ALL DATA:**
When presenting any structured data (competitors, businesses, file analysis results, vector knowledge), always use this exact HTML table format:

<div style="overflow-x: auto; margin: 16px 0; border-radius: 8px; background-color: #1a1a1a; border: 1px solid #2a2a2a;">
<table style="width: 100%; border-collapse: collapse; font-family: Inter, system-ui, sans-serif; background-color: #1a1a1a; font-size: 14px;">
<thead>
<tr style="background-color: #111111;">
<th style="border-bottom: 2px solid #34d399; border-right: 1px solid #2a2a2a; padding: 8px 12px; text-align: left; font-weight: 600; font-size: 13px; color: #34d399; white-space: nowrap;">[Column Title]</th>
</tr>
</thead>
<tbody>
<tr style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;">
<td style="border-right: 1px solid #2a2a2a; padding: 8px 12px; font-weight: 400; color: #e5e7eb; font-size: 13px; line-height: 1.4; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">[Data]</td>
</tr>
</tbody>
</table>
</div>

**MOBILE-OPTIMIZED TABLES:**
For mobile screens, use a card-based layout instead of tables when there are more than 3 columns:

<div style="display: grid; gap: 12px; margin: 16px 0;">
<div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 12px;">
<div style="color: #34d399; font-weight: 600; font-size: 14px; margin-bottom: 8px;">[Business Name]</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
<div><span style="color: #9ca3af;">Phone:</span> <span style="color: #e5e7eb;">[Phone]</span></div>
<div><span style="color: #9ca3af;">Rating:</span> <span style="color: #e5e7eb;">[Rating]</span></div>
</div>
</div>
</div>

**STRATEGIC INSIGHTS FORMAT:**
After any data presentation, always provide strategic analysis with emerald green numbered formatting:

<span style="color: #34d399; font-weight: 600;">1. Key Insight:</span> [Analysis]
<span style="color: #34d399; font-weight: 600;">2. Opportunity:</span> [Recommendation] 
<span style="color: #34d399; font-weight: 600;">3. Next Steps:</span> [Actions]

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