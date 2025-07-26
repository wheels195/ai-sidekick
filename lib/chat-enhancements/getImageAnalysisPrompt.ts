export interface FileInfo {
  name?: string
  type?: string
  content?: string
}

export function getImageAnalysisPrompt(file: FileInfo, userMessage = ''): string {
  const message = userMessage.toLowerCase()
  const filename = file?.name?.toLowerCase() || ''

  // Before/after upgrade analysis
  if (message.includes('before') && message.includes('upgrade')) {
    return 'Suggest landscaping upgrades or design enhancements based on this yard photo that could raise the project value or customer spend. Focus on high-margin opportunities like hardscaping, irrigation systems, lighting, or premium plant selections.'
  }

  // Competitor intelligence gathering
  if (message.includes('competitor') || message.includes('sign')) {
    return 'Extract competitor name, services, phone number, pricing, or marketing elements from this image. Look for business signage, vehicle branding, pricing on flyers, service offerings, and any competitive intelligence that could inform business strategy.'
  }

  // Quote/estimate analysis
  if (message.includes('quote') || message.includes('estimate') || message.includes('pricing')) {
    return 'Extract all pricing details, service breakdowns, upsell opportunities, or discounts from this quote or flyer. Analyze pricing structure, identify missing services that could be added, and suggest competitive positioning strategies.'
  }

  // Filename-based detection for before photos
  if (filename.includes('before')) {
    return 'Suggest curb appeal improvements or project upgrades based on this photo. Focus on practical enhancements that increase property value and create upselling opportunities for the landscaping business.'
  }

  // Property assessment for potential clients
  if (message.includes('property') || message.includes('assessment') || message.includes('potential')) {
    return 'Analyze this property photo for landscaping business opportunities. Identify maintenance needs, improvement possibilities, estimated project scope, and potential revenue opportunities.'
  }

  // Design inspiration requests
  if (message.includes('design') || message.includes('makeover') || message.includes('transform')) {
    return 'Provide creative landscaping design suggestions based on this image. Focus on modern trends, seasonal considerations, and upgrades that justify premium pricing for landscaping services.'
  }

  // Marketing material analysis
  if (message.includes('marketing') || message.includes('flyer') || message.includes('ad')) {
    return 'Analyze this marketing material for landscaping business insights. Extract pricing strategies, service positioning, target customer messaging, and competitive advantages that could be applied or countered.'
  }

  // Default comprehensive analysis
  return 'Analyze this image for any business-relevant insights, service types, pricing cues, competitive branding, or sales opportunities. Focus on actionable intelligence that could help a landscaping business owner improve their operations, pricing, or market positioning.'
}