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
}

export default function BrandLayout({ children, title, preview }: BrandLayoutProps) {
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
  backgroundColor: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', // Emerald gradient
  padding: '40px 30px',
  textAlign: 'center' as const,
  background: '#059669', // Fallback for email clients that don't support gradients
}

const logoStyle = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0',
  fontFamily: '"Dancing Script", "Brush Script MT", cursive',
  fontStyle: 'italic',
  letterSpacing: '-2px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
}

const taglineStyle = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '8px 0 0 0',
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