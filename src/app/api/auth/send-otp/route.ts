import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber } = await request.json()

    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      )
    }

    // Validate mobile number format (basic validation for Indian numbers)
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      )
    }

    // Check if user exists with this mobile number
    let user = await db.user.findUnique({
      where: { mobileNumber }
    })

    // If user doesn't exist, create a new user with basic info
    if (!user) {
      const hashedPassword = await hashPassword('temp_password')
      user = await db.user.create({
        data: {
          mobileNumber,
          password: hashedPassword,
          role: 'STUDENT', // Default role, can be changed later
          isActive: true
        }
      })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

    // Update user with OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires
      }
    })

    // In a real implementation, you would send the OTP via SMS
    // For demo purposes, we'll just return success
    // TODO: Integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`OTP for ${mobileNumber}: ${otp}`) // For development only

    return NextResponse.json({
      message: 'OTP sent successfully',
      mobileNumber: mobileNumber.slice(0, 2) + '******' + mobileNumber.slice(-2)
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}