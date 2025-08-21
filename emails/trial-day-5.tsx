import { Text, Heading, Section } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'

interface TrialDay5Props {
  firstName: string
}

export default function TrialDay5Email({ 
  firstName = 'Business Owner'
}: TrialDay5Props) {
  return (
    <BrandLayout 
      title="Your trial ends in 2 days — don't lose momentum"
      preview="Keep proposals, ads, and competitor insights working for you."
    >
      <Heading style={greetingStyle}>
        Hi {firstName},
      </Heading>
      
      <Text style={messageStyle}>
        Your 7-day free trial ends in 2 days.
      </Text>

      <Text style={messageStyle}>
        If you don't upgrade, you'll lose access to:
      </Text>

      <Section style={lossListStyle}>
        <Text style={lossItemStyle}>❌ Instant proposals & pricing help</Text>
        <Text style={lossItemStyle}>❌ Before/after ad generation</Text>
        <Text style={lossItemStyle}>❌ Competitor insights</Text>
        <Text style={lossItemStyle}>❌ Ongoing business strategy guidance</Text>
      </Section>

      <Text style={messageStyle}>
        Don't cut yourself off right when the growth starts.
      </Text>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Keep Your Growth Tools Running
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

const lossListStyle = {
  margin: '25px 0',
  paddingLeft: '0',
}

const lossItemStyle = {
  color: '#fca5a5', // Light red for loss items
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