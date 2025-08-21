import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay3Props {
  firstName: string
  userEmail?: string
}

export default function TrialDay3Email({ 
  firstName = 'Business Owner',
  userEmail
}: TrialDay3Props) {
  return (
    <BrandLayout 
      title="Want more leads? Start with better ads."
      preview="Stop running ads with stock photos — show real transformations."
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        Most landscapers run ads with stock photos. The problem? Customers scroll right past them.
      </Text>

      <Text style={messageStyle}>
        With AI Sidekick you can:
      </Text>

      <Section style={benefitsStyle}>
        <Text style={benefitTextStyle}>Generate custom before/after images</Text>
        <Text style={benefitTextStyle}>Draft the ad copy in seconds</Text>
        <Text style={benefitTextStyle}>Launch ads that stand out in your local market</Text>
      </Section>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Create a Before/After Ad Now
        </BrandButton>
      </Section>

      <Text style={messageStyle}>
        Make your next ad look like you've got a full marketing team — without hiring one.
      </Text>

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