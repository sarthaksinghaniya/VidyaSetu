'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { GraduationCap, Building2, Shield, Smartphone } from 'lucide-react'

export default function LoginPage() {
  const [showOTP, setShowOTP] = useState(false)
  const [mobileLogin, setMobileLogin] = useState({
    mobileNumber: '',
    otp: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobileNumber: mobileLogin.mobileNumber
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowOTP(true)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobileNumber: mobileLogin.mobileNumber,
          otp: mobileLogin.otp
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        switch (data.user.role) {
          case 'student':
            router.push('/student')
            break
          case 'employer':
            router.push('/employer')
            break
          case 'admin':
            router.push('/admin')
            break
          default:
            router.push('/')
        }
      } else {
        setError(data.error || 'OTP verification failed')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setError('OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vidya Setu</h1>
          <p className="text-gray-600">AI Internship Recommendation Engine</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Login with Mobile Number
            </CardTitle>
            <CardDescription>
              Enter your mobile number to receive OTP and access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showOTP ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="mobile-number">Mobile Number</Label>
                  <Input
                    id="mobile-number"
                    type="tel"
                    value={mobileLogin.mobileNumber}
                    onChange={(e) => setMobileLogin({...mobileLogin, mobileNumber: e.target.value})}
                    placeholder="Enter your 10-digit mobile number"
                    maxLength={10}
                    pattern="[6-9]{1}[0-9]{9}"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number starting with 6-9</p>
                </div>

                <div>
                  <Label htmlFor="mobile-role">I am a</Label>
                  <select
                    id="mobile-role"
                    value={mobileLogin.role}
                    onChange={(e) => setMobileLogin({...mobileLogin, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Government Admin</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex justify-center py-4">
                    <InputOTP
                      maxLength={6}
                      value={mobileLogin.otp}
                      onChange={(value) => setMobileLogin({...mobileLogin, otp: value})}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-gray-500 text-center">Enter 6-digit OTP sent to your mobile</p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowOTP(false)
                      setError('')
                    }}
                  >
                    Change Number
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  )
}