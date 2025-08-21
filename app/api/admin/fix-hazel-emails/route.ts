import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// One-time admin function - bypassing normal auth for emergency fix
export async function POST(request: NextRequest) {
  // Simple security check using URL parameter
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('key')
  
  if (authKey !== 'hazel-fix-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServiceClient()
  
  const userEmail = 'topguncleaner@gmail.com'
  const firstName = 'Hazel'
  const signupTime = '2025-08-20 20:34:36-04:00' // Yesterday at 8:34 PM EST
  
  console.log('🔧 Fixing email sequence for Hazel...')
  
  try {
    // First check if the table exists, create if needed
    const { error: tableCheckError } = await supabase
      .from('email_campaigns')
      .select('id')
      .limit(1)
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist, create it
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS email_campaigns (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT NOT NULL,
          email_type TEXT NOT NULL,
          scheduled_for TIMESTAMP WITH TIME ZONE,
          sent_at TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'scheduled',
          user_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS email_campaigns_user_email_idx ON email_campaigns(user_email);
        CREATE INDEX IF NOT EXISTS email_campaigns_email_type_idx ON email_campaigns(email_type);
        CREATE INDEX IF NOT EXISTS email_campaigns_sent_at_idx ON email_campaigns(sent_at);
        CREATE INDEX IF NOT EXISTS email_campaigns_scheduled_for_idx ON email_campaigns(scheduled_for);
        CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON email_campaigns(status);
        
        ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own email campaigns" ON email_campaigns
          FOR SELECT USING (user_email = auth.email());
        
        CREATE POLICY "Service role can manage all email campaigns" ON email_campaigns
          FOR ALL USING (auth.role() = 'service_role');
      `
      
      const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL })
      if (createError) {
        console.error('Failed to create email_campaigns table:', createError)
        return NextResponse.json({ error: 'Failed to create email table', details: createError }, { status: 500 })
      }
    }
    
    // Calculate signup date
    const signupDate = new Date(signupTime)
    const now = new Date()
    const hoursElapsed = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60)
    
    console.log(`📅 Signup: ${signupDate.toISOString()}`)
    console.log(`⏰ Hours elapsed: ${Math.floor(hoursElapsed)} hours`)
    
    // Calculate which emails to schedule (she should be on Day 1 or 2)
    const emailsToSchedule = []
    
    // If it's been 24+ hours, start with Day 2, otherwise start with Day 1
    const startDay = hoursElapsed >= 24 ? 2 : 1
    console.log(`🚀 Starting from Day ${startDay}`)
    
    const emailSchedule = [
      { day: 1, hours: 24, type: 'trial-day-1' },
      { day: 2, hours: 48, type: 'trial-day-2' },
      { day: 3, hours: 72, type: 'trial-day-3' },
      { day: 4, hours: 96, type: 'trial-day-4' },
      { day: 5, hours: 120, type: 'trial-day-5' },
      { day: 6, hours: 144, type: 'trial-day-6' },
      { day: 7, hours: 168, type: 'trial-day-7' },
    ]
    
    for (const email of emailSchedule) {
      if (email.day >= startDay) {
        const sendTime = new Date(signupDate.getTime() + (email.hours * 60 * 60 * 1000))
        
        // If the send time is in the past, schedule for immediate sending
        const scheduledFor = sendTime < now ? now : sendTime
        
        emailsToSchedule.push({
          user_email: userEmail,
          email_type: email.type,
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled',
          user_data: JSON.stringify({ firstName })
        })
        
        console.log(`📧 ${email.type}: ${scheduledFor < now ? 'READY TO SEND NOW' : scheduledFor.toLocaleString()}`)
      }
    }
    
    // Insert scheduled emails
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(emailsToSchedule)
      .select()
    
    if (error) {
      console.error('❌ Failed to schedule emails:', error)
      return NextResponse.json({ 
        error: 'Failed to schedule emails', 
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        } 
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully scheduled ${emailsToSchedule.length} emails for Hazel!`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${emailsToSchedule.length} emails for Hazel`,
      emails: emailsToSchedule.map(e => ({
        type: e.email_type,
        scheduledFor: e.scheduled_for,
        status: e.status
      }))
    })
    
  } catch (error) {
    console.error('❌ Error fixing Hazel emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}