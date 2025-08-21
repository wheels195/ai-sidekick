import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/welcome'
import TrialDay1Email from '@/emails/trial-day-1'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template') || 'trial-day-1'
  
  try {
    let emailHtml = ''
    
    switch (template) {
      case 'welcome':
        emailHtml = await render(WelcomeEmail({ 
          firstName: 'John',
          businessName: 'Elite Landscaping',
          trade: 'landscaping',
          userEmail: 'john@example.com'
        }))
        break
      case 'trial-day-1':
        emailHtml = await render(TrialDay1Email({ 
          firstName: 'John',
          userEmail: 'john@example.com'
        }))
        break
      default:
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return new NextResponse(emailHtml, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 })
  }
}