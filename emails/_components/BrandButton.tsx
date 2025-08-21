import React from 'react'
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
  padding: '14px 32px', // Slightly smaller for better proportions
  backgroundColor: '#10b981', // Emerald green
  color: '#ffffff !important', // Force white text for email clients
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '15px', // Slightly smaller
  borderRadius: '6px', // Less rounded for professional look
  textAlign: 'center' as const,
  background: '#10b981', // Solid color for better email client support
  border: 'none',
  cursor: 'pointer',
}