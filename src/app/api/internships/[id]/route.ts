import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Internship, Employer } from '@/models'
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

    const { isActive, ...updateData } = await request.json()

    await connectDB()

    const employer = await Employer.findOne({ userId: user.userId })
    if (!employer) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      )
    }

    const internship = await Internship.findById(params.id)
    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      )
    }

    // Verify this internship belongs to this employer
    if (internship.employerId.toString() !== employer._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this internship' },
        { status: 403 }
      )
    }

    // Update internship
    Object.assign(internship, updateData)
    if (isActive !== undefined) internship.isActive = isActive

    await internship.save()

    return NextResponse.json({
      message: 'Internship updated successfully',
      internship
    })

  } catch (error) {
    console.error('Internship update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const internship = await Internship.findById(params.id)
    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      )
    }

    // Verify this internship belongs to this employer
    if (internship.employerId.toString() !== employer._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this internship' },
        { status: 403 }
      )
    }

    await Internship.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: 'Internship deleted successfully'
    })

  } catch (error) {
    console.error('Internship deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}