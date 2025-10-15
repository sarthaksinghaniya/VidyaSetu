import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { aiService } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sector = searchParams.get('sector')
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
      deadline: {
        gte: new Date()
      }
    }

    if (sector) where.sector = sector
    if (state) where.state = state
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { employer: { companyName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [internships, total] = await Promise.all([
      db.internship.findMany({
        where,
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
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.internship.count({ where })
    ])

    return NextResponse.json({
      internships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get internships error:', error)
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

    // Check if user is employer
    if (decoded.role !== 'employer') {
      return NextResponse.json({ error: 'Only employers can post internships' }, { status: 403 })
    }

    const employer = await db.employer.findFirst({
      where: { userId: decoded.userId }
    })

    if (!employer) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 })
    }

    const internshipData = await request.json()

    // Generate AI-powered description if not provided
    let description = internshipData.description
    if (!description && internshipData.title) {
      try {
        description = await aiService.generateInternshipDescription({
          title: internshipData.title,
          company: employer.companyName,
          sector: internshipData.sector,
          location: internshipData.location,
          duration: internshipData.duration,
          stipend: internshipData.stipend,
          skills: internshipData.skills ? JSON.parse(internshipData.skills) : [],
          type: internshipData.type
        })
      } catch (error) {
        console.error('Failed to generate description:', error)
        description = `Exciting internship opportunity at ${employer.companyName}`
      }
    }

    // Create internship
    const internship = await db.internship.create({
      data: {
        employerId: employer.id,
        title: internshipData.title,
        description,
        type: internshipData.type,
        sector: internshipData.sector,
        location: internshipData.location,
        state: internshipData.state,
        district: internshipData.district,
        stipend: internshipData.stipend,
        duration: internshipData.duration,
        positions: internshipData.positions,
        requirements: internshipData.requirements,
        skills: internshipData.skills,
        responsibilities: internshipData.responsibilities,
        benefits: internshipData.benefits,
        deadline: internshipData.deadline ? new Date(internshipData.deadline) : null
      },
      include: {
        employer: {
          include: {
            user: true
          }
        }
      }
    })

    // Add skills if provided
    if (internshipData.skills) {
      const skills = JSON.parse(internshipData.skills)
      for (const skillName of skills) {
        let skill = await db.skill.findUnique({
          where: { name: skillName }
        })

        if (!skill) {
          skill = await db.skill.create({
            data: { name: skillName }
          })
        }

        await db.internshipSkill.create({
          data: {
            internshipId: internship.id,
            skillId: skill.id,
            importance: 3 // Default importance
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Internship created successfully',
      internship
    })

  } catch (error) {
    console.error('Create internship error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}