import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function authenticate(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    return payload
  } catch (error) {
    return null
  }
}

export function requireAuth(request: NextRequest) {
  const user = authenticate(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return user
}

export function requireRole(request: NextRequest, requiredRole: string) {
  const user = requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }
  
  if (user.role !== requiredRole) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return user
}

export function requireAnyRole(request: NextRequest, roles: string[]) {
  const user = requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }
  
  if (!roles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return user
}