import React from 'react'
import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay7Props {
  userEmail?: string;
  firstName: string
}

export default function TrialDay7Email({ 
  firstName = 'Business Owner',
  userEmail
}: TrialDay7Props) {
  return (
    <BrandLayout 
      title={`${firstName}, your trial ends today — here's my ask`}
      preview="Don't lose the momentum you've started — keep growing today."
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        It's Mike again.
      </Text>

      <Text style={messageStyle}>
        I built AI Sidekick because local landscaping businesses deserve the same firepower big companies use to win customers. In just minutes, you've seen how it can:
      </Text>

      <Section style={benefitsStyle}>
        <Text style={benefitTextStyle}>Write proposals that close faster</Text>
        <Text style={benefitTextStyle}>Generate ads that get attention</Text>
        <Text style={benefitTextStyle}>Provide insights that sharpen your strategy</Text>
      </Section>

      <Text style={messageStyle}>
        Today is your last day of free access. If AI Sidekick has sparked even one idea or saved you one hour, imagine what it can do over the next season.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Upgrade Today to Keep Growing
        </BrandButton>
      </Section>

      <Text style={signatureStyle}>
        See you on the inside,<br/>
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