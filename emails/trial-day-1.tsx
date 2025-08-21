import React from 'react'
import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay1Props {
  firstName: string
  userEmail?: string
}

export default function TrialDay1Email({ 
  firstName = 'Business Owner',
  userEmail
}: TrialDay1Props) {
  return (
    <BrandLayout 
      title={`${firstName}, here's your first win with AI Sidekick`}
      preview="Draft proposals, ads, and revenue ideas in minutes — not hours."
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        It's Mike — founder of AI Sidekick.
      </Text>

      <Text style={messageStyle}>
        Most landscapers are buried in quotes, ads, and decisions about how to grow. 
        AI Sidekick helps you cut through the noise. In minutes you can:
      </Text>

      <Section style={benefitsStyle}>
        <Text style={benefitTextStyle}>Draft a client proposal in 30 seconds</Text>
        <Text style={benefitTextStyle}>Generate before-and-after photos for your next ad</Text>
        <Text style={benefitTextStyle}>Get competitor insights without paying a consultant</Text>
      </Section>

      <Text style={calloutStyle}>
        👉 <strong>Try this today:</strong> ask AI Sidekick "What's one upsell I can offer on my next landscaping job?"
      </Text>

      <Text style={messageStyle}>
        You'll have new revenue ideas instantly.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Get Your First Revenue Idea
        </BrandButton>
      </Section>

      <Text style={signatureStyle}>
        Talk soon,<br/>
        Mike Wheeler<br/>
        Founder & CEO, AI Sidekick
      </Text>
    </BrandLayout>
  )
}

// Styles
const greetingStyle = {
  fontSize: '20px',
  fontWeight: '400',
  color: '#ffffff',
  marginBottom: '20px',
  marginTop: '0',
}

const messageStyle = {
  fontSize: '16px',
  color: '#e5e7eb',
  marginBottom: '20px',
  lineHeight: '1.6',
}

const benefitsStyle = {
  margin: '25px 0',
  paddingLeft: '0',
}

const benefitTextStyle = {
  color: '#e5e7eb',
  fontSize: '16px',
  marginBottom: '8px',
  lineHeight: '1.6',
}

const calloutStyle = {
  fontSize: '16px',
  color: '#e5e7eb',
  marginBottom: '20px',
  lineHeight: '1.6',
  padding: '15px',
  backgroundColor: '#1f2937',
  borderRadius: '6px',
  borderLeft: '4px solid #10b981',
}

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const signatureStyle = {
  fontSize: '16px',
  color: '#e5e7eb',
  marginTop: '30px',
  lineHeight: '1.6',
}