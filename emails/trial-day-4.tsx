import React from 'react'
import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay4Props {
  userEmail?: string;
  firstName: string
}

export default function TrialDay4Email({ 
  firstName = 'Business Owner',
  userEmail
}: TrialDay4Props) {
  return (
    <BrandLayout 
      title="Don't guess. Ask AI Sidekick."
      preview="Pricing, promos, crew scheduling — get clear answers fast."
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        Running a landscaping business means constant questions:
      </Text>

      <Section style={questionsStyle}>
        <Text style={questionTextStyle}>Am I charging enough?</Text>
        <Text style={questionTextStyle}>Which services should I promote this season?</Text>
        <Text style={questionTextStyle}>What's the best way to keep my crew fully booked?</Text>
      </Section>

      <Text style={messageStyle}>
        Instead of guessing, type those into AI Sidekick and get answers in plain English — backed by data and proven strategies.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Find Out If You're Charging Enough
        </BrandButton>
      </Section>

      <Text style={signatureStyle}>
        — Team AI Sidekick
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

const questionsStyle = {
  margin: '25px 0',
  paddingLeft: '20px',
}

const questionTextStyle = {
  color: '#e5e7eb',
  fontSize: '16px',
  marginBottom: '8px',
  lineHeight: '1.6',
  fontStyle: 'italic',
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