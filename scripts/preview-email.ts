import { render } from '@react-email/render'
import fs from 'fs'
import path from 'path'
import WelcomeEmail from '../emails/welcome'
import TrialDay1Email from '../emails/trial-day-1'
import TrialDay2Email from '../emails/trial-day-2'
import TrialDay3Email from '../emails/trial-day-3'
import TrialDay4Email from '../emails/trial-day-4'
import TrialDay5Email from '../emails/trial-day-5'
import TrialDay6Email from '../emails/trial-day-6'
import TrialDay7Email from '../emails/trial-day-7'

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

async function generatePreview(template: string, fileName: string) {
  const EmailComponent = emailComponents[template as keyof typeof emailComponents]
  
  if (!EmailComponent) {
    console.error(`Email template '${template}' not found`)
    return
  }

  try {
    const emailHtml = render(EmailComponent({ 
      firstName: 'John',
      businessName: 'Elite Landscaping',
      trade: 'landscaping'
    }))

    const previewsDir = path.join(process.cwd(), 'email-previews')
    if (!fs.existsSync(previewsDir)) {
      fs.mkdirSync(previewsDir, { recursive: true })
    }

    const filePath = path.join(previewsDir, `${fileName}.html`)
    fs.writeFileSync(filePath, emailHtml)
    
    console.log(`✅ Preview generated: ${filePath}`)
    return filePath
  } catch (error) {
    console.error(`❌ Error generating preview for ${template}:`, error)
  }
}

async function generateAllPreviews() {
  console.log('🎨 Generating email previews...\n')
  
  const templates = [
    { template: 'welcome', fileName: '0-welcome' },
    { template: 'trial-day-1', fileName: '1-trial-day-1' },
    { template: 'trial-day-2', fileName: '2-trial-day-2' },
    { template: 'trial-day-3', fileName: '3-trial-day-3' },
    { template: 'trial-day-4', fileName: '4-trial-day-4' },
    { template: 'trial-day-5', fileName: '5-trial-day-5' },
    { template: 'trial-day-6', fileName: '6-trial-day-6' },
    { template: 'trial-day-7', fileName: '7-trial-day-7' },
  ]

  for (const { template, fileName } of templates) {
    await generatePreview(template, fileName)
  }

  const previewsDir = path.join(process.cwd(), 'email-previews')
  console.log(`\n🚀 All previews generated in: ${previewsDir}`)
  console.log('\n📧 Open any .html file in your browser to see the email preview!')
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    await generateAllPreviews()
  } else if (args.length === 1) {
    const template = args[0]
    await generatePreview(template, template)
  } else {
    console.log(`
Usage: 
  npx tsx scripts/preview-email.ts                    # Generate all previews
  npx tsx scripts/preview-email.ts <template-name>    # Generate single preview

Available templates:
- welcome
- trial-day-1
- trial-day-2
- trial-day-3
- trial-day-4
- trial-day-5
- trial-day-6
- trial-day-7
`)
  }
}

if (require.main === module) {
  main()
}