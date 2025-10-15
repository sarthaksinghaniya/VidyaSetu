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

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    // Get overall statistics
    const [
      totalStudents,
      totalEmployers,
      totalInternships,
      totalApplications,
      acceptedApplications,
      completedInternships
    ] = await Promise.all([
      db.student.count(),
      db.employer.count(),
      db.internship.count({ where: { isActive: true } }),
      db.application.count(),
      db.application.count({ where: { status: 'ACCEPTED' } }),
      db.application.count({ where: { status: 'COMPLETED' } })
    ])

    // Get state-wise statistics
    const stateStats = await db.user.groupBy({
      by: ['id'],
      _count: true,
      where: {
        role: 'STUDENT',
        student: {
          state: state || undefined
        }
      }
    })

    // Get sector-wise statistics
    const sectorStats = await db.internship.groupBy({
      by: ['sector'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    // Get application trends
    const applicationTrends = await db.application.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Get monthly statistics
    const monthlyStats = await db.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count
      FROM applications
      WHERE ${startDate ? `createdAt >= '${startDate}'` : '1=1'}
        AND ${endDate ? `createdAt <= '${endDate}'` : '1=1'}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month
    ` as Array<{ month: string; count: number }>

    // Get top performing states
    const topStates = await db.student.groupBy({
      by: ['state'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get top sectors
    const topSectors = await db.internship.groupBy({
      by: ['sector'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get recent activity
    const recentActivity = await Promise.all([
      db.user.findMany({
        where: {
          createdAt: dateFilter,
          role: 'STUDENT'
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
          role: true
        }
      }),
      db.internship.findMany({
        where: {
          createdAt: dateFilter,
          isActive: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
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
      }),
      db.application.findMany({
        where: {
          appliedAt: dateFilter
        },
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          internship: {
            select: {
              title: true
            }
          }
        }
      })
    ])

    // Calculate conversion rates
    const applicationRate = totalInternships > 0 ? (totalApplications / totalInternships) * 100 : 0
    const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0
    const completionRate = acceptedApplications > 0 ? (completedInternships / acceptedApplications) * 100 : 0

    return NextResponse.json({
      overview: {
        totalStudents,
        totalEmployers,
        totalInternships,
        totalApplications,
        acceptedApplications,
        completedInternships,
        applicationRate: Math.round(applicationRate * 100) / 100,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
      },
      demographics: {
        stateStats: topStates,
        sectorStats: topSectors
      },
      trends: {
        applicationTrends,
        monthlyStats
      },
      recentActivity: {
        newUsers: recentActivity[0],
        newInternships: recentActivity[1],
        newApplications: recentActivity[2]
      }
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}