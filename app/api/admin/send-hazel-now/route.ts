import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  // Simple security check
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('key')
  
  if (authKey !== 'hazel-fix-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServiceClient()
  
  try {
    // Update Hazel's Day 1 email to be ready for immediate sending
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({ 
        scheduled_for: new Date(Date.now() - 60000).toISOString() // 1 minute ago
      })
      .eq('user_email', 'topguncleaner@gmail.com')
      .eq('email_type', 'trial-day-1')
      .eq('status', 'scheduled')
      .select()
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update email schedule', 
        details: error.message 
      }, { status: 500 })
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No Day 1 email found to update',
        message: 'Email may have already been sent or not exist'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Updated Hazel\'s Day 1 email to be ready for immediate sending',
      updated_email: data[0],
      next_step: 'Now call the email processor to send it'
    })
    
  } catch (error) {
    console.error('Error updating Hazel email:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 })
  }
}