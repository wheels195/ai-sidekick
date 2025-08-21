import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
  const supabase = createServiceClient()
  
  const userEmail = 'topguncleaner@gmail.com'
  const firstName = 'Hazel'
  const signupTime = '2025-08-20 20:34:36-04:00' // Yesterday at 8:34 PM EST
  
  console.log('🔧 Fixing email sequence for Hazel...')
  
  try {
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
    const { error } = await supabase
      .from('email_campaigns')
      .insert(emailsToSchedule)
    
    if (error) {
      console.error('❌ Failed to schedule emails:', error)
      return NextResponse.json({ error: 'Failed to schedule emails', details: error }, { status: 500 })
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