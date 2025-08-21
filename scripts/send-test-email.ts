import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeEmail from '../emails/welcome'
import TrialDay1Email from '../emails/trial-day-1'
import TrialDay2Email from '../emails/trial-day-2'
import TrialDay3Email from '../emails/trial-day-3'
import TrialDay4Email from '../emails/trial-day-4'
import TrialDay5Email from '../emails/trial-day-5'
import TrialDay6Email from '../emails/trial-day-6'
import TrialDay7Email from '../emails/trial-day-7'

const resend = new Resend(process.env.RESEND_API_KEY)

interface TestEmailOptions {
  template: string
  to: string
  firstName?: string
  businessName?: string
  trade?: string
}

const emailComponents = {
  'welcome': WelcomeEmail,
  'trial-day-1': TrialDay1Email,
  'trial-day-2': TrialDay2Email,
  'trial-day-3': TrialDay3Email,
  'trial-day-4': TrialDay4Email,
  'trial-day-5': TrialDay5Email,
  'trial-day-6': TrialDay6Email,
  'trial-day-7': TrialDay7Email,
}

const emailSubjects = {
  'welcome': 'Welcome to AI Sidekick!',
  'trial-day-1': 'Get 3 New Clients This Week',
  'trial-day-2': 'The $3,200 Pricing Mistake',
  'trial-day-3': 'Google Ranking Secrets',
  'trial-day-4': 'The "Competitor Steal" Strategy',
  'trial-day-5': 'The Referral Multiplier System',
  'trial-day-6': 'The Scale-Up Blueprint', 
  'trial-day-7': 'Final Notice: Trial Expires Today',
}

export async function sendTestEmail(options: TestEmailOptions) {
  const { template, to, firstName = 'John', businessName = 'Elite Landscaping', trade = 'landscaping' } = options
  
  const EmailComponent = emailComponents[template as keyof typeof emailComponents]
  
  if (!EmailComponent) {
    throw new Error(`Email template '${template}' not found`)
  }

  try {
    const emailHtml = render(EmailComponent({ 
      firstName, 
      businessName, 
      trade 
    }))

    const { data, error } = await resend.emails.send({
      from: 'AI Sidekick <support@ai-sidekick.io>',
      to: [to],
      subject: emailSubjects[template as keyof typeof emailSubjects],
      html: emailHtml
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error }
    }

    console.log(`✅ Test email '${template}' sent successfully to ${to}`)
    return { success: true, data }
  } catch (error) {
    console.error('Email rendering/sending failed:', error)
    return { success: false, error }
  }
}

// Command line interface for testing
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log(`
Usage: npx tsx scripts/send-test-email.ts <template> <email> [firstName] [businessName] [trade]

Available templates:
- welcome
- trial-day-1
- trial-day-2
- trial-day-3
- trial-day-4
- trial-day-5
- trial-day-6
- trial-day-7

Example: npx tsx scripts/send-test-email.ts welcome admin@ai-sidekick.io John "Elite Landscaping" landscaping
`)
    process.exit(1)
  }

  const [template, email, firstName, businessName, trade] = args
  
  const result = await sendTestEmail({
    template,
    to: email,
    firstName,
    businessName,
    trade
  })

  if (result.success) {
    console.log('✅ Email sent successfully!')
    process.exit(0)
  } else {
    console.error('❌ Email failed to send:', result.error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}