import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiService } from '@/lib/ai'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    // Get student profile
    const student = await db.student.findFirst({
      where: { userId: decoded.userId },
      include: {
        user: true,
        skills: {
          include: {
            skill: true
          }
        },
        education: true,
        preferences: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Get available internships
    const internships = await db.internship.findMany({
      where: {
        isActive: true,
        deadline: {
          gte: new Date()
        }
      },
      include: {
        employer: {
          include: {
            user: true
          }
        },
        internshipSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    // Get existing recommendations to avoid duplicates
    const existingRecommendations = await db.aIRecommendation.findMany({
      where: { studentId: student.id },
      select: { internshipId: true }
    })

    const existingInternshipIds = existingRecommendations.map(r => r.internshipId)
    const newInternships = internships.filter(i => !existingInternshipIds.includes(i.id))

    if (newInternships.length === 0) {
      // Return existing recommendations if no new internships
      const recommendations = await db.aIRecommendation.findMany({
        where: { studentId: student.id },
        include: {
          internship: {
            include: {
              employer: {
                include: {
                  user: true
                }
              },
              internshipSkills: {
                include: {
                  skill: true
                }
              }
            }
          }
        },
        orderBy: { score: 'desc' },
        take: 10
      })

      return NextResponse.json({
        message: 'Existing recommendations retrieved',
        recommendations
      })
    }

    // Generate AI recommendations
    const studentProfile = {
      skills: student.skills.map(ss => ({ name: ss.skill.name, level: ss.level })),
      education: student.education,
      experience: student.experience,
      preferences: student.preferences,
      state: student.state,
      bio: student.bio
    }

    const aiRecommendations = await aiService.generateRecommendations(studentProfile, newInternships)

    // Save recommendations to database
    const savedRecommendations = []
    for (const rec of aiRecommendations) {
      const recommendation = await db.aIRecommendation.create({
        data: {
          studentId: student.id,
          internshipId: rec.internshipId,
          score: rec.score,
          reasons: JSON.stringify(rec.reasons)
        }
      })

      // Get full internship details for response
      const internship = await db.internship.findUnique({
        where: { id: rec.internshipId },
        include: {
          employer: {
            include: {
              user: true
            }
          },
          internshipSkills: {
            include: {
              skill: true
            }
          }
        }
      })

      savedRecommendations.push({
        ...recommendation,
        internship,
        reasons: rec.reasons
      })
    }

    return NextResponse.json({
      message: 'New recommendations generated',
      recommendations: savedRecommendations.sort((a, b) => b.score - a.score)
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const { internshipId, action } = await request.json()

    if (!internshipId || !action) {
      return NextResponse.json({ error: 'Internship ID and action are required' }, { status: 400 })
    }

    if (action === 'apply') {
      // Create application
      const application = await db.application.create({
        data: {
          studentId: decoded.userId,
          internshipId,
          status: 'PENDING'
        }
      })

      // Update recommendation score based on action
      await db.aIRecommendation.updateMany({
        where: {
          studentId: decoded.userId,
          internshipId
        },
        data: {
          score: {
            increment: 5 // Increase score for applied internships
          }
        }
      })

      return NextResponse.json({
        message: 'Application submitted successfully',
        application
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Recommendation action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}