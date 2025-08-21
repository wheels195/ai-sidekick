import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay6Props {
  userEmail?: string;
  firstName: string
}

export default function TrialDay6Email({ 
  firstName = 'Business Owner',
  userEmail
}: TrialDay6Props) {
  return (
    <BrandLayout 
      title="How do you stack up against competitors?"
      preview="Discover pricing gaps and neighborhoods your rivals ignore."
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        Most landscapers don't really know what their competitors are charging, promoting, or neglecting. AI Sidekick helps you:
      </Text>

      <Section style={benefitsStyle}>
        <Text style={benefitTextStyle}>Spot gaps in local pricing & services</Text>
        <Text style={benefitTextStyle}>Identify neighborhoods competitors ignore</Text>
        <Text style={benefitTextStyle}>Position your business as the best choice</Text>
      </Section>

      <Text style={messageStyle}>
        It's like having an inside look at the local market — without hours of research.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Uncover Competitor Gaps Now
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