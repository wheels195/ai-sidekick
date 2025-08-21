import React from 'react'
import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'
import CheckmarkBullet from './_components/CheckmarkBullet'

interface TrialDay2Props {
  firstName: string
}

export default function TrialDay2Email({ 
  firstName = 'Business Owner'
}: TrialDay2Props) {
  return (
    <BrandLayout 
      title="Landscapers are using AI Sidekick to win more jobs"
      preview="Real landscapers are landing more jobs and charging smarter."
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        Here's how other landscapers are putting AI Sidekick to work:
      </Text>

      <Section style={benefitsStyle}>
        <CheckmarkBullet>Ads → Before/after images that stop customers from scrolling</CheckmarkBullet>
        <CheckmarkBullet>Sales → Polished proposals that close jobs faster</CheckmarkBullet>
        <CheckmarkBullet>Pricing → Spotting competitor gaps and bidding smarter</CheckmarkBullet>
        <CheckmarkBullet>Growth → Upsells that boost revenue per visit</CheckmarkBullet>
      </Section>

      <Text style={messageStyle}>
        Your free trial has all of this unlocked.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          See How to Win More Jobs
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

const benefitsStyle = {
  margin: '25px 0',
  paddingLeft: '0',
}

const benefitTextStyle = {
  color: '#e5e7eb',
  fontSize: '16px',
  marginBottom: '12px',
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