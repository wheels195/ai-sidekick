import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('key')
  
  if (authKey !== 'hazel-fix-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServiceClient()
  
  try {
    // Check all emails for Hazel
    const { data: emails, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_email', 'topguncleaner@gmail.com')
      .order('scheduled_for', { ascending: true })
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch emails', 
        details: error 
      }, { status: 500 })
    }
    
    // Check if email processor is running
    const { data: logs, error: logError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      hazel_emails: emails || [],
      hazel_email_count: emails?.length || 0,
      recent_sent_emails: logs || [],
      current_time: new Date().toISOString(),
      next_steps: {
        no_emails: 'Use /api/admin/simple-hazel-fix to create emails',
        has_scheduled: 'Check if email processor is running',
        all_sent: 'All emails have been sent'
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 })
  }
}