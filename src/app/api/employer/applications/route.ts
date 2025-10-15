import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Application, Employer, Student } from '@/models'
import { requireRole } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, 'employer')
    if (user instanceof NextResponse) {
      return user
    }

    await connectDB()

    const employer = await Employer.findOne({ userId: user.userId })
    if (!employer) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      )
    }

    const applications = await Application.find()
      .populate({
        path: 'internshipId',
        match: { employerId: employer._id }
      })
      .populate('studentId', 'userId phone state district')
      .sort({ appliedAt: -1 })

    // Filter out applications for internships not belonging to this employer
    const filteredApplications = applications.filter(app => app.internshipId)

    return NextResponse.json({
      applications: filteredApplications
    })

  } catch (error) {
    console.error('Employer applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}