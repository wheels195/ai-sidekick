import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export interface UserPayload {
  userId: string
  email: string
  trade: string
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as UserPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getUser(request: NextRequest): Promise<UserPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    
    return await verifyToken(token)
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<UserPayload> {
  const user = await getUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}