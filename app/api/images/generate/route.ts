import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderateDallePrompt } from '@/lib/moderation'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// DALL-E pricing (as of current rates)
const DALLE_PRICING = {
  'dall-e-3': {
    '1024x1024': { standard: 0.04, hd: 0.08 },
    '1024x1792': { standard: 0.08, hd: 0.12 },
    '1792x1024': { standard: 0.08, hd: 0.12 }
  },
  'dall-e-2': {
    '1024x1024': { standard: 0.02 },
    '512x512': { standard: 0.018 },
    '256x256': { standard: 0.016 }
  }
}

// User limits for generation
const USER_LIMITS = {
  daily_images: 20,
  monthly_images: 100,
  max_prompt_length: 1000
}

interface ImageGenerationRequest {
  prompt: string
  model?: 'dall-e-3' | 'dall-e-2'
  size?: '1024x1024' | '1024x1792' | '1792x1024' | '512x512' | '256x256'
  quality?: 'standard' | 'hd'
  style?: 'natural' | 'vivid'
  businessContext?: boolean // Whether to enhance with user business context
}

// Minimal prompt processing - only add technical hints when absolutely necessary
function processImagePrompt(prompt: string, userProfile: any): string {
  // Just return the user's prompt as-is
  // DALL-E 3 is smart enough to understand context without our interference
  return prompt
}

// Check user's generation limits
async function checkUserLimits(supabase: any, userId: string): Promise<{
  allowed: boolean
  reason?: string
  usage: {
    daily: number
    monthly: number
  }
}> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get daily usage
  const { count: dailyCount } = await supabase
    .from('generated_images')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  // Get monthly usage  
  const { count: monthlyCount } = await supabase
    .from('generated_images')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', thisMonth.toISOString())

  const dailyUsage = dailyCount || 0
  const monthlyUsage = monthlyCount || 0

  if (dailyUsage >= USER_LIMITS.daily_images) {
    return {
      allowed: false,
      reason: `Daily limit of ${USER_LIMITS.daily_images} images reached. Try again tomorrow.`,
      usage: { daily: dailyUsage, monthly: monthlyUsage }
    }
  }

  if (monthlyUsage >= USER_LIMITS.monthly_images) {
    return {
      allowed: false,
      reason: `Monthly limit of ${USER_LIMITS.monthly_images} images reached. Upgrade for more generations.`,
      usage: { daily: dailyUsage, monthly: monthlyUsage }
    }
  }

  return {
    allowed: true,
    usage: { daily: dailyUsage, monthly: monthlyUsage }
  }
}

// Calculate generation cost
function calculateCost(model: string, size: string, quality: string): number {
  const modelPricing = DALLE_PRICING[model as keyof typeof DALLE_PRICING]
  if (!modelPricing) return 0

  const sizePricing = modelPricing[size as keyof typeof modelPricing]
  if (!sizePricing) return 0

  if (typeof sizePricing === 'object') {
    return sizePricing[quality as keyof typeof sizePricing] || 0
  }
  
  return sizePricing
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ImageGenerationRequest = await request.json()
    const { 
      prompt, 
      model = 'dall-e-3', 
      size = '1024x1024', 
      quality = 'hd',  // Changed from 'standard' to 'hd' for better quality
      style = 'vivid',  // Changed from 'natural' to 'vivid' for more vibrant marketing images
      businessContext = false  // Deprecated - no longer forcing business context
    } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (prompt.length > USER_LIMITS.max_prompt_length) {
      return NextResponse.json({ 
        error: `Prompt too long. Maximum ${USER_LIMITS.max_prompt_length} characters.` 
      }, { status: 400 })
    }

    // Check user limits
    const limitCheck = await checkUserLimits(supabase, user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: limitCheck.reason,
        errorType: 'GENERATION_LIMIT_EXCEEDED',
        usage: limitCheck.usage
      }, { status: 429 })
    }

    // Get user profile for business context
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Process prompt minimally - just pass through what user asked for
    let finalPrompt = processImagePrompt(prompt, userProfile)
    console.log('🎨 Processing prompt:', { original: prompt, final: finalPrompt })

    // Moderate the prompt
    console.log('🛡️ Moderating DALL-E prompt...')
    const moderationResult = await moderateDallePrompt(finalPrompt, user.id, request)
    
    if (!moderationResult.allowed) {
      console.log('🚫 DALL-E prompt blocked by moderation:', moderationResult.reason)
      return NextResponse.json({
        error: moderationResult.userMessage || 'Image generation blocked due to content policy.',
        errorType: 'CONTENT_MODERATION_BLOCKED',
        categories: moderationResult.categories
      }, { status: 400 })
    }

    console.log('✅ DALL-E prompt passed moderation')

    // Calculate cost
    const generationCost = calculateCost(model, size, quality)
    
    console.log(`🎨 Generating image with DALL-E...`, {
      model,
      size,
      quality,
      style,
      cost: generationCost,
      originalPrompt: prompt,
      finalPrompt: finalPrompt
    })

    // Generate image with DALL-E
    const imageResponse = await openai.images.generate({
      model,
      prompt: finalPrompt,  // Use the minimally processed prompt
      n: 1,
      size: size as any,
      quality: model === 'dall-e-3' ? quality as any : undefined,
      style: model === 'dall-e-3' ? style as any : undefined
    })

    const generatedImage = imageResponse.data[0]
    
    if (!generatedImage.url) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    console.log('✅ Image generated successfully:', generatedImage.url)

    // Store in database
    const { data: imageRecord, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: prompt,
        image_url: generatedImage.url,
        revised_prompt: generatedImage.revised_prompt,
        model,
        size,
        quality,
        style,
        generation_cost: generationCost,
        business_context: userProfile || {},
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error saving image:', dbError)
      // Don't fail the request if database save fails - user still gets the image
    }

    // Track API usage and costs
    await supabase.from('api_usage_tracking').insert({
      user_id: user.id,
      api_type: 'dall-e',
      endpoint: '/api/images/generate',
      model_used: model,
      images_generated: 1,
      cost_usd: generationCost,
      cost_breakdown: {
        model,
        size,
        quality,
        style,
        business_context_used: businessContext,
        prompt_length: prompt.length
      }
    })

    console.log('💾 Image generation tracked and stored')

    return NextResponse.json({
      success: true,
      image: {
        id: imageRecord?.id,
        url: generatedImage.url,
        revisedPrompt: generatedImage.revised_prompt,
        originalPrompt: prompt,
        model,
        size,
        quality,
        style,
        cost: generationCost,
        expiresAt: imageRecord?.expires_at
      },
      usage: {
        daily: limitCheck.usage.daily + 1,
        monthly: limitCheck.usage.monthly + 1,
        dailyLimit: USER_LIMITS.daily_images,
        monthlyLimit: USER_LIMITS.monthly_images
      }
    })

  } catch (error) {
    console.error('Image generation error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('content_policy_violation')) {
        return NextResponse.json({
          error: 'Your prompt violates OpenAI\'s content policy. Please try a different prompt.',
          errorType: 'CONTENT_POLICY_VIOLATION'
        }, { status: 400 })
      }
      
      if (error.message.includes('rate_limit_exceeded')) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again in a moment.',
          errorType: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 })
      }
    }

    return NextResponse.json({ 
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Get user's generation history and usage
export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's generated images
    const { data: images, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        image_url,
        revised_prompt,
        model,
        size,
        quality,
        style,
        generation_cost,
        created_at,
        expires_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }

    // Get usage statistics
    const limitCheck = await checkUserLimits(supabase, user.id)

    // Get total cost
    const { data: costData } = await supabase
      .from('generated_images')
      .select('generation_cost')
      .eq('user_id', user.id)

    const totalCost = costData?.reduce((sum, img) => sum + img.generation_cost, 0) || 0

    return NextResponse.json({
      images: images || [],
      usage: limitCheck.usage,
      limits: {
        daily: USER_LIMITS.daily_images,
        monthly: USER_LIMITS.monthly_images,
        promptLength: USER_LIMITS.max_prompt_length
      },
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      pagination: {
        limit,
        offset,
        hasMore: (images?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Image history error:', error)
    return NextResponse.json({ error: 'Failed to fetch image history' }, { status: 500 })
  }
}