import React from 'react'
import { 
  Html, 
  Head, 
  Body, 
  Container, 
  Section, 
  Text, 
  Link, 
  Heading 
} from '@react-email/components'

interface BrandLayoutProps {
  children: React.ReactNode
  title: string
  preview?: string
  userEmail?: string
}

export default function BrandLayout({ children, title, preview, userEmail }: BrandLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
        {preview && <meta name="description" content={preview} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>AI Sidekick</Heading>
            <Text style={taglineStyle}>Specialized AI for Local Trades</Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>© 2025 AI Sidekick. All rights reserved.</Text>
            <Section style={footerLinksStyle}>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/terms`} style={footerLinkStyle}>
                Terms
              </Link>
              <Text style={separatorStyle}>•</Text>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/privacy`} style={footerLinkStyle}>
                Privacy
              </Link>
              <Text style={separatorStyle}>•</Text>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/learn`} style={footerLinkStyle}>
                Learn
              </Link>
              <Text style={separatorStyle}>•</Text>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''}`} style={footerLinkStyle}>
                Unsubscribe
              </Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Dark theme styles matching app UI
const bodyStyle = {
  margin: '0',
  padding: '0',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  backgroundColor: '#0a0a0a', // Dark background matching app
  color: '#e5e7eb', // Light text
  lineHeight: '1.6',
}

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#111827', // Dark card background
  border: '1px solid #374151', // Dark border
  borderRadius: '12px',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
}

const headerStyle = {
  backgroundColor: '#059669', // Solid emerald background for better email client support
  padding: '24px 30px', // Reduced padding for less overpowering header
  textAlign: 'center' as const,
}

const logoStyle = {
  fontSize: '28px', // Reduced from 48px for industry standard
  fontWeight: '600', // Slightly lighter weight
  color: '#ffffff',
  margin: '0',
  fontFamily: '"Dancing Script", "Brush Script MT", cursive',
  fontStyle: 'italic',
  letterSpacing: '-1px', // Reduced letter spacing
}

const taglineStyle = {
  color: '#ffffff',
  fontSize: '13px',
  margin: '4px 0 0 0', // Reduced top margin
  opacity: '0.9',
}

const contentStyle = {
  padding: '40px 30px',
  backgroundColor: '#111827', // Dark content background
}

const footerStyle = {
  backgroundColor: '#1f2937', // Darker footer background
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #374151',
}

const footerTextStyle = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0 0 15px 0',
}

const footerLinksStyle = {
  textAlign: 'center' as const,
  margin: '0',
}

const footerLinkStyle = {
  color: '#10b981', // Emerald green links
  textDecoration: 'none',
  fontSize: '14px',
  margin: '0 8px',
}

const separatorStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 4px',
  display: 'inline',
}