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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    let applications
    let total

    if (decoded.role === 'student') {
      // Student can see their own applications
      const where: any = { studentId: decoded.userId }
      if (status) where.status = status

      [applications, total] = await Promise.all([
        db.application.findMany({
          where,
          include: {
            internship: {
              include: {
                employer: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { appliedAt: 'desc' }
        }),
        db.application.count({ where })
      ])
    } else if (decoded.role === 'employer') {
      // Employer can see applications for their internships
      const employer = await db.employer.findFirst({
        where: { userId: decoded.userId }
      })

      if (!employer) {
        return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 })
      }

      const where: any = {
        internship: {
          employerId: employer.id
        }
      }
      if (status) where.status = status

      [applications, total] = await Promise.all([
        db.application.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    mobileNumber: true
                  }
                }
              }
            },
            internship: true
          },
          skip,
          take: limit,
          orderBy: { appliedAt: 'desc' }
        }),
        db.application.count({ where })
      ])
    } else if (decoded.role === 'admin') {
      // Admin can see all applications
      const where: any = {}
      if (status) where.status = status

      [applications, total] = await Promise.all([
        db.application.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    mobileNumber: true
                  }
                }
              }
            },
            internship: {
              include: {
                employer: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { appliedAt: 'desc' }
        }),
        db.application.count({ where })
      ])
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get applications error:', error)
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

    const { applicationId, status, feedback } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 })
    }

    // Get application
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        internship: {
          include: {
            employer: {
              include: {
                user: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check permissions
    if (decoded.role === 'employer') {
      // Employer can only update applications for their internships
      if (application.internship.employer.user.id !== decoded.userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update application status
    const updatedApplication = await db.application.update({
      where: { id: applicationId },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                mobileNumber: true
              }
            }
          }
        },
        internship: {
          include: {
            employer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Create notification for student
    if (status !== application.status) {
      await db.notification.create({
        data: {
          userId: application.student.userId,
          title: `Application ${status}`,
          message: `Your application for ${application.internship.title} has been ${status.toLowerCase()}.`,
          type: status === 'ACCEPTED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO'
        }
      })
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}