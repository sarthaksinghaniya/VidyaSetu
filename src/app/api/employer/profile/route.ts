import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const employer = await db.employer.findFirst({
      where: { userId: decoded.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            name: true,
            isVerified: true
          }
        },
        internships: {
          include: {
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!employer) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 })
    }

    return NextResponse.json({ employer })

  } catch (error) {
    console.error('Get employer profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const profileData = await request.json()
    const employer = await db.employer.findFirst({
      where: { userId: decoded.userId }
    })

    if (!employer) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 })
    }

    // Update user basic info
    if (profileData.name) {
      await db.user.update({
        where: { id: decoded.userId },
        data: { name: profileData.name }
      })
    }

    // Update employer profile
    const updatedEmployer = await db.employer.update({
      where: { id: employer.id },
      data: {
        companyName: profileData.companyName,
        gstin: profileData.gstin,
        pan: profileData.pan,
        phone: profileData.phone,
        address: profileData.address,
        state: profileData.state,
        district: profileData.district,
        sector: profileData.sector,
        description: profileData.description,
        website: profileData.website
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            name: true,
            isVerified: true
          }
        },
        internships: {
          include: {
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      employer: updatedEmployer
    })

  } catch (error) {
    console.error('Update employer profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { action, data } = await request.json()

    if (action === 'createProfile') {
      // Check if profile already exists
      const existingProfile = await db.employer.findFirst({
        where: { userId: decoded.userId }
      })

      if (existingProfile) {
        return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
      }

      const employer = await db.employer.create({
        data: {
          userId: decoded.userId,
          ...data
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              mobileNumber: true,
              name: true,
              isVerified: true
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Profile created successfully',
        employer
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Employer profile action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}