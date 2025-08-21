import { createServiceClient } from '@/lib/supabase/service'
import { 
  sendTrialDay1Email, 
  sendTrialDay2Email,
  sendTrialDay3Email,
  sendTrialDay4Email,
  sendTrialDay5Email,
  sendTrialDay6Email,
  sendTrialDay7Email
} from './email'

interface UserForEmail {
  email: string
  first_name: string
  business_name: string
  trade: string
  created_at: string
}

// Calculate days since user signup
function daysSinceSignup(createdAt: string): number {
  const signupDate = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - signupDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Check and send trial emails based on signup date
export async function processPendingTrialEmails() {
  const supabase = createServiceClient()
  
  try {
    // Get all users who are in their 7-day trial
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('email, first_name, business_name, trade, created_at')
      .eq('email_marketing_consent', true)
      .is('unsubscribed_at', null)
      .gte('created_at', new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()) // Last 8 days
    
    if (error) {
      console.error('Error fetching users for trial emails:', error)
      return
    }

    for (const user of users || []) {
      const days = daysSinceSignup(user.created_at)
      
      // Check if we need to send a trial email
      switch (days) {
        case 1:
          await sendTrialEmailIfNotSent(user, 1, sendTrialDay1Email)
          break
        case 2:
          await sendTrialEmailIfNotSent(user, 2, sendTrialDay2Email)
          break
        case 3:
          await sendTrialEmailIfNotSent(user, 3, sendTrialDay3Email)
          break
        case 4:
          await sendTrialEmailIfNotSent(user, 4, sendTrialDay4Email)
          break
        case 5:
          await sendTrialEmailIfNotSent(user, 5, sendTrialDay5Email)
          break
        case 6:
          await sendTrialEmailIfNotSent(user, 6, sendTrialDay6Email)
          break
        case 7:
          await sendTrialEmailIfNotSent(user, 7, sendTrialDay7Email)
          break
      }
    }
    
    console.log('✅ Trial email processing completed')
  } catch (error) {
    console.error('❌ Error processing trial emails:', error)
  }
}

// Check if email was already sent and send if not
async function sendTrialEmailIfNotSent(
  user: UserForEmail, 
  day: number, 
  sendFunction: (email: string, firstName: string) => Promise<any>
) {
  const supabase = createServiceClient()
  
  try {
    // Check if this specific trial email was already sent
    const { data: existingEmail, error: checkError } = await supabase
      .from('email_campaigns')
      .select('id')
      .eq('user_email', user.email)
      .eq('email_type', `trial-day-${day}`)
      .single()
    
    if (existingEmail) {
      console.log(`Trial Day ${day} already sent to ${user.email}`)
      return
    }
    
    // Send the email
    const result = await sendFunction(user.email, user.first_name)
    
    if (result.success) {
      // Log the sent email
      await supabase
        .from('email_campaigns')
        .insert({
          user_email: user.email,
          email_type: `trial-day-${day}`,
          sent_at: new Date().toISOString(),
          status: 'sent'
        })
      
      console.log(`✅ Trial Day ${day} sent to ${user.first_name} (${user.email})`)
    } else {
      console.error(`❌ Failed to send Trial Day ${day} to ${user.email}:`, result.error)
    }
  } catch (error) {
    console.error(`❌ Error sending Trial Day ${day} to ${user.email}:`, error)
  }
}