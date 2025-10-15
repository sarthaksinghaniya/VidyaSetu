import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Application, Employer, Student, Internship } from '@/models'
import { requireRole } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireRole(request, 'employer')
    if (user instanceof NextResponse) {
      return user
    }

    const { status, feedback, interviewDate } = await request.json()

    await connectDB()

    const employer = await Employer.findOne({ userId: user.userId })
    if (!employer) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      )
    }

    const application = await Application.findById(params.id)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify this application belongs to an internship from this employer
    const internship = await application.populate('internshipId')
    if (internship.internshipId.employerId.toString() !== employer._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to access this application' },
        { status: 403 }
      )
    }

    const oldStatus = application.status
    application.status = status
    if (feedback) application.feedback = feedback
    if (interviewDate) application.interviewDate = new Date(interviewDate)

    await application.save()

    // Get student details for notification
    const student = await Student.findById(application.studentId)
    if (student) {
      // Emit real-time notification via socket
      const { server } = await import('@/lib/socket')
      if (server && server.io) {
        server.io.emit('application_update', {
          applicationId: application._id,
          studentId: student.userId,
          employerId: employer.userId,
          status: application.status,
          message: `Your application for ${internship.internshipId.title} has been ${application.status}`
        })

        // If interview is scheduled, send additional notification
        if (interviewDate && status === 'shortlisted') {
          server.io.emit('interview_scheduled', {
            applicationId: application._id,
            studentId: student.userId,
            employerId: employer.userId,
            interviewDate: interviewDate,
            internshipTitle: internship.internshipId.title
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Application status updated successfully',
      application
    })

  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}