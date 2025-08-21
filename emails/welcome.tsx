import { Text, Heading, Section, Hr } from '@react-email/components'
import BrandLayout from './_components/BrandLayout'
import BrandButton from './_components/BrandButton'
import CheckmarkBullet from './_components/CheckmarkBullet'

interface WelcomeEmailProps {
  firstName: string
  businessName: string
  trade: string
  userEmail?: string
}

export default function WelcomeEmail({ 
  firstName = 'Business Owner', 
  businessName = 'Your Business', 
  trade = 'landscaping',
  userEmail
}: WelcomeEmailProps) {
  return (
    <BrandLayout 
      title={`Welcome to AI Sidekick, ${firstName}!`}
      preview="Your AI Sidekick is ready to help your business grow!"
      userEmail={userEmail}
    >
      <Heading style={greetingStyle}>
        Welcome aboard, {firstName}! 🎉
      </Heading>
      
      <Text style={messageStyle}>
        Your AI Sidekick is ready to help <strong style={highlightStyle}>{businessName}</strong> dominate 
        the local {trade} market. Let's get you growing!
      </Text>

      <Section style={featureBoxStyle}>
        <Heading style={featureTitleStyle}>🚀 Your Growth Arsenal Includes:</Heading>
        <Section>
          <CheckmarkBullet>Smart pricing & upsell strategies</CheckmarkBullet>
          <CheckmarkBullet>Local SEO & Google ranking tactics</CheckmarkBullet>
          <CheckmarkBullet>Customer acquisition playbooks</CheckmarkBullet>
          <CheckmarkBullet>AI-powered marketing content</CheckmarkBullet>
          <CheckmarkBullet>Competitive intelligence reports</CheckmarkBullet>
          <CheckmarkBullet>24/7 business strategy support</CheckmarkBullet>
        </Section>
      </Section>

      <Section style={buttonContainerStyle}>
        <BrandButton href={`${process.env.NEXT_PUBLIC_SITE_URL}/landscaping`}>
          Start Growing Now →
        </BrandButton>
      </Section>

      <Section style={proTipBoxStyle}>
        <Text style={proTipTextStyle}>
          💡 <strong>Pro Tip:</strong> Start by asking<br />
          <em>"How can I get 10 more {trade} clients this month?"</em>
        </Text>
      </Section>

      <Hr style={dividerStyle} />

      <Text style={helpTextStyle}>
        <strong>Need help?</strong> Just reply to this email — we're here to support your success!
      </Text>
    </BrandLayout>
  )
}

// Dark theme styles
const greetingStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#ffffff', // White heading
  marginBottom: '20px',
  marginTop: '0',
}

const messageStyle = {
  fontSize: '16px',
  color: '#e5e7eb', // Light gray text
  marginBottom: '25px',
  lineHeight: '1.7',
}

const highlightStyle = {
  color: '#10b981', // Emerald green highlight
}

const featureBoxStyle = {
  backgroundColor: '#1f2937', // Dark feature box
  border: '1px solid #374151', // Dark border
  borderRadius: '8px',
  padding: '25px',
  margin: '30px 0',
}

const featureTitleStyle = {
  color: '#10b981', // Emerald green
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '15px',
  marginTop: '0',
}

const featureListStyle = {
  margin: '0',
  padding: '0',
  listStyle: 'none',
}

const featureItemStyle = {
  color: '#e5e7eb', // Light text
  padding: '8px 0',
  paddingLeft: '25px',
  position: 'relative' as const,
  lineHeight: '1.5',
}

const checkmarkStyle = {
  color: '#10b981', // Emerald checkmarks
  position: 'absolute' as const,
  left: '0',
  fontWeight: 'bold',
}

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '35px 0',
}

const proTipBoxStyle = {
  backgroundColor: '#064e3b', // Dark emerald background
  border: '1px solid #10b981', // Emerald border
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const proTipTextStyle = {
  color: '#6ee7b7', // Light emerald text
  fontSize: '16px',
  margin: '0',
  fontWeight: '500',
  lineHeight: '1.5',
}

const dividerStyle = {
  height: '1px',
  backgroundColor: '#374151', // Dark divider
  border: 'none',
  margin: '30px 0',
}

const helpTextStyle = {
  color: '#9ca3af', // Muted text
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0',
}