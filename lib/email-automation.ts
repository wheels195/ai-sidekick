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

// Process scheduled emails that are ready to send
export async function processPendingTrialEmails() {
  const supabase = createServiceClient()
  
  try {
    const now = new Date().toISOString()
    
    // Get all scheduled emails that are ready to send
    const { data: scheduledEmails, error } = await supabase
      .from('email_campaigns')
      .select('id, user_email, email_type, user_data')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now) // Email is due
    
    if (error) {
      console.error('Error fetching scheduled emails:', error)
      return
    }

    console.log(`📧 Found ${scheduledEmails?.length || 0} emails ready to send`)

    for (const emailRecord of scheduledEmails || []) {
      await sendScheduledEmail(emailRecord)
    }
    
    console.log('✅ Scheduled email processing completed')
  } catch (error) {
    console.error('❌ Error processing scheduled emails:', error)
  }
}

// Send a specific scheduled email
async function sendScheduledEmail(emailRecord: any) {
  const supabase = createServiceClient()
  const { id, user_email, email_type, user_data } = emailRecord
  const userData = JSON.parse(user_data || '{}')
  const firstName = userData.firstName || 'there'
  
  try {
    // Mark as sending to prevent duplicates
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', id)
    
    // Determine which email function to call
    let result
    switch (email_type) {
      case 'trial-day-1':
        result = await sendTrialDay1Email(user_email, firstName)
        break
      case 'trial-day-2':
        result = await sendTrialDay2Email(user_email, firstName)
        break
      case 'trial-day-3':
        result = await sendTrialDay3Email(user_email, firstName)
        break
      case 'trial-day-4':
        result = await sendTrialDay4Email(user_email, firstName)
        break
      case 'trial-day-5':
        result = await sendTrialDay5Email(user_email, firstName)
        break
      case 'trial-day-6':
        result = await sendTrialDay6Email(user_email, firstName)
        break
      case 'trial-day-7':
        result = await sendTrialDay7Email(user_email, firstName)
        break
      default:
        console.error(`Unknown email type: ${email_type}`)
        return
    }
    
    if (result.success) {
      // Mark as sent
      await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id)
      
      console.log(`✅ ${email_type} sent to ${firstName} (${user_email})`)
    } else {
      // Mark as failed
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', id)
      
      console.error(`❌ Failed to send ${email_type} to ${user_email}:`, result.error)
    }
  } catch (error) {
    console.error(`❌ Error sending ${email_type} to ${user_email}:`, error)
    
    // Mark as failed
    await supabase
      .from('email_campaigns')
      .update({ status: 'failed' })
      .eq('id', id)
  }
}