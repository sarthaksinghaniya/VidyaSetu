import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, otp } = await request.json()

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
        { status: 400 }
      )
    }

    // Find user by mobile number
    const user = await db.user.findUnique({
      where: { mobileNumber }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if OTP is valid and not expired
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      )
    }

    // Mark user as verified and clear OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpires: null,
        lastLogin: new Date()
      }
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email || user.mobileNumber,
      role: user.role.toLowerCase()
    })

    return NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}