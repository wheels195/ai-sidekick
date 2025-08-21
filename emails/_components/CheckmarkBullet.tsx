import { Text } from '@react-email/components'

interface CheckmarkBulletProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function CheckmarkBullet({ children, style = {} }: CheckmarkBulletProps) {
  return (
    <Text style={{ ...bulletStyle, ...style }}>
      <span style={checkmarkStyle}>✓</span> {children}
    </Text>
  )
}

const bulletStyle = {
  color: '#e5e7eb',
  fontSize: '16px',
  marginBottom: '8px',
  lineHeight: '1.6',
  paddingLeft: '0px',
}

const checkmarkStyle = {
  display: 'inline-block',
  backgroundColor: '#10b981', // Green circle background
  color: '#ffffff',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  textAlign: 'center' as const,
  lineHeight: '18px',
  fontSize: '12px',
  fontWeight: 'bold',
  marginRight: '10px',
  verticalAlign: 'middle',
}