import { Link } from '@react-email/components'

interface BrandButtonProps {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function BrandButton({ href, children, style = {} }: BrandButtonProps) {
  return (
    <Link
      href={href}
      style={{
        ...buttonStyle,
        ...style,
      }}
    >
      {children}
    </Link>
  )
}

const buttonStyle = {
  display: 'inline-block',
  padding: '16px 40px',
  backgroundColor: '#10b981', // Emerald green
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Gradient
  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.2s ease',
}