import { createServiceClient } from '@/lib/supabase/service'

interface TrialEmailSchedule {
  email: string
  firstName: string
  signupDate: string
}

// Schedule all 7 trial emails for a new user
export async function scheduleTrialEmailSequence({ email, firstName, signupDate }: TrialEmailSchedule) {
  const supabase = createServiceClient()
  
  try {
    // Calculate send dates for each trial email
    const baseDate = new Date(signupDate)
    
    const trialEmails = [
      { day: 1, hours: 24, type: 'trial-day-1' },
      { day: 2, hours: 48, type: 'trial-day-2' },
      { day: 3, hours: 72, type: 'trial-day-3' },
      { day: 4, hours: 96, type: 'trial-day-4' },
      { day: 5, hours: 120, type: 'trial-day-5' },
      { day: 6, hours: 144, type: 'trial-day-6' },
      { day: 7, hours: 168, type: 'trial-day-7' },
    ]
    
    // Insert scheduled emails into database
    const scheduledEmails = trialEmails.map(({ day, hours, type }) => {
      const sendDate = new Date(baseDate.getTime() + (hours * 60 * 60 * 1000))
      
      return {
        user_email: email,
        email_type: type,
        scheduled_for: sendDate.toISOString(),
        status: 'scheduled',
        user_data: JSON.stringify({ firstName })
      }
    })
    
    const { error } = await supabase
      .from('email_campaigns')
      .insert(scheduledEmails)
    
    if (error) {
      console.error('❌ Failed to schedule trial emails for:', email, error)
      return { success: false, error }
    }
    
    console.log(`✅ Scheduled 7 trial emails for ${firstName} (${email})`)
    return { success: true, scheduled: scheduledEmails.length }
    
  } catch (error) {
    console.error('❌ Error scheduling trial emails:', error)
    return { success: false, error }
  }
}