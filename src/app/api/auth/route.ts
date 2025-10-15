import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'EMPLOYER', 'ADMIN'])
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'register') {
      const validatedData = registerSchema.parse(data)
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return Response.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      // Create user
      const user = await db.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role as UserRole
        }
      })

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return Response.json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })

    } else if (action === 'login') {
      const validatedData = loginSchema.parse(data)

      // Find user
      const user = await db.user.findUnique({
        where: { email: validatedData.email }
      })

      if (!user) {
        return Response.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

      if (!isValidPassword) {
        return Response.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return Response.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })

    } else {
      return Response.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Auth error:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}