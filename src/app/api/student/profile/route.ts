import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, hashPassword } from '@/lib/auth'
import { aiService } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const student = await db.student.findFirst({
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
        skills: {
          include: {
            skill: true
          }
        },
        education: true,
        preferences: true,
        applications: {
          include: {
            internship: {
              include: {
                employer: {
                  include: {
                    user: true
                  }
                }
              }
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Get student profile error:', error)
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

    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const profileData = await request.json()
    const student = await db.student.findFirst({
      where: { userId: decoded.userId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Update user basic info
    if (profileData.name) {
      await db.user.update({
        where: { id: decoded.userId },
        data: { name: profileData.name }
      })
    }

    // Update student profile
    const updatedStudent = await db.student.update({
      where: { id: student.id },
      data: {
        aadhaar: profileData.aadhaar,
        phone: profileData.phone,
        address: profileData.address,
        state: profileData.state,
        district: profileData.district,
        language: profileData.language,
        bio: profileData.bio,
        experience: profileData.experience
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
        skills: {
          include: {
            skill: true
          }
        },
        education: true,
        preferences: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    })

  } catch (error) {
    console.error('Update student profile error:', error)
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

    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { action, data } = await request.json()

    if (action === 'analyzeResume') {
      if (!data.resumeText) {
        return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
      }

      try {
        const analysis = await aiService.analyzeResume(data.resumeText)
        
        // Update student profile with AI analysis
        const student = await db.student.findFirst({
          where: { userId: decoded.userId }
        })

        if (student) {
          // Update bio
          await db.student.update({
            where: { id: student.id },
            data: {
              bio: analysis.bio,
              experience: analysis.experience || 0
            }
          })

          // Add skills
          for (const skillName of analysis.skills) {
            let skill = await db.skill.findUnique({
              where: { name: skillName }
            })

            if (!skill) {
              skill = await db.skill.create({
                data: { name: skillName }
              })
            }

            await db.studentSkill.upsert({
              where: {
                studentId_skillId: {
                  studentId: student.id,
                  skillId: skill.id
                }
              },
              update: { level: 4 },
              create: {
                studentId: student.id,
                skillId: skill.id,
                level: 4
              }
            })
          }

          // Add education
          for (const edu of analysis.education) {
            await db.education.create({
              data: {
                studentId: student.id,
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startYear: edu.startYear,
                endYear: edu.endYear,
                grade: edu.grade
              }
            })
          }
        }

        return NextResponse.json({
          message: 'Resume analyzed successfully',
          analysis
        })

      } catch (error) {
        console.error('Resume analysis error:', error)
        return NextResponse.json(
          { error: 'Failed to analyze resume' },
          { status: 500 }
        )
      }
    }

    if (action === 'addEducation') {
      const student = await db.student.findFirst({
        where: { userId: decoded.userId }
      })

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
      }

      const education = await db.education.create({
        data: {
          studentId: student.id,
          ...data
        }
      })

      return NextResponse.json({
        message: 'Education added successfully',
        education
      })
    }

    if (action === 'addSkill') {
      const student = await db.student.findFirst({
        where: { userId: decoded.userId }
      })

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
      }

      let skill = await db.skill.findUnique({
        where: { name: data.skillName }
      })

      if (!skill) {
        skill = await db.skill.create({
          data: { name: data.skillName }
        })
      }

      const studentSkill = await db.studentSkill.create({
        data: {
          studentId: student.id,
          skillId: skill.id,
          level: data.level || 3
        }
      })

      return NextResponse.json({
        message: 'Skill added successfully',
        skill: studentSkill
      })
    }

    if (action === 'updatePreferences') {
      const student = await db.student.findFirst({
        where: { userId: decoded.userId }
      })

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
      }

      const preferences = await db.studentPreference.upsert({
        where: { studentId: student.id },
        update: {
          preferredSectors: data.preferredSectors ? JSON.stringify(data.preferredSectors) : null,
          preferredLocations: data.preferredLocations ? JSON.stringify(data.preferredLocations) : null,
          preferredTypes: data.preferredTypes ? JSON.stringify(data.preferredTypes) : null,
          minStipend: data.minStipend
        },
        create: {
          studentId: student.id,
          preferredSectors: data.preferredSectors ? JSON.stringify(data.preferredSectors) : null,
          preferredLocations: data.preferredLocations ? JSON.stringify(data.preferredLocations) : null,
          preferredTypes: data.preferredTypes ? JSON.stringify(data.preferredTypes) : null,
          minStipend: data.minStipend
        }
      })

      return NextResponse.json({
        message: 'Preferences updated successfully',
        preferences
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Student profile action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}