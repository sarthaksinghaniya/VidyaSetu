'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StudentProfile {
  id: string
  userId: string
  phone?: string
  address?: string
  state?: string
  district?: string
  language?: string
  resumeUrl?: string
  bio?: string
  experience?: number
  user: {
    id: string
    email?: string
    mobileNumber: string
    name?: string
    isVerified: boolean
  }
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startYear: number
    endYear?: number
    grade?: string
  }>
  skills: Array<{
    id: string
    skill: {
      name: string
    }
    level: number
  }>
  preferences?: {
    id: string
    preferredSectors?: string
    preferredLocations?: string
    preferredTypes?: string
    minStipend?: number
  }
}

interface Internship {
  id: string
  title: string
  description: string
  type: string
  sector: string
  location: string
  state: string
  district?: string
  stipend?: number
  duration: number
  positions: number
  requirements?: string
  skills?: string
  responsibilities?: string
  benefits?: string
  deadline?: string
  employer: {
    id: string
    companyName: string
    user: {
      name: string
    }
  }
  internshipSkills?: Array<{
    skill: {
      name: string
    }
  }>
  score?: number
  reasons?: string[]
}

interface Application {
  id: string
  studentId: string
  internship: {
    id: string
    title: string
    employer: {
      companyName: string
      user: {
        name: string
      }
    }
  }
  status: string
  matchScore?: number
  appliedAt: string
  updatedAt: string
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [recommendations, setRecommendations] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const [profileRes, recommendationsRes, applicationsRes] = await Promise.all([
        fetch('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/applications', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.student)
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json()
        setRecommendations(recommendationsData.recommendations || [])
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyToInternship = async (internshipId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          internshipId,
          action: 'apply' 
        })
      })

      if (response.ok) {
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('Error applying to internship:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'shortlisted': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here are your internship opportunities.</p>
        </div>

        {!profile?.user.name && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Complete Your Profile</p>
                  <p className="text-sm text-orange-600">Please complete your profile to get better internship recommendations.</p>
                </div>
                <Button size="sm" className="ml-auto">
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.user.name && profile?.skills?.length ? '100%' : '65%'}
              </div>
              <Progress value={profile?.user.name && profile?.skills?.length ? 100 : 65} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {applications.filter(app => app.status === 'accepted').length} accepted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommended</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations.length}</div>
              <p className="text-xs text-muted-foreground">
                New opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommended</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.map((recommendation) => {
                const internship = recommendation.internship || recommendation
                return (
                  <Card key={internship.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{internship.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            {internship.location}, {internship.state}
                          </CardDescription>
                        </div>
                        {recommendation.score && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {Math.round(recommendation.score)}% Match
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{internship.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {internship.stipend ? `₹${internship.stipend}` : 'Unpaid'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{internship.duration} weeks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'No deadline'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">{internship.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {internship.internshipSkills?.map((skillObj, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skillObj.skill.name}
                            </Badge>
                          ))}
                          {internship.skills && JSON.parse(internship.skills).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {internship.employer.companyName}
                        </div>
                        <Button onClick={() => applyToInternship(internship.id)}>
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{application.internship.title}</CardTitle>
                        <CardDescription>
                          {application.internship.employer.companyName}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            {profile && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Language</label>
                        <p className="text-gray-900">{profile.language || 'English'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <p className="text-gray-900">{profile.state || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">District</label>
                        <p className="text-gray-900">{profile.district || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skillObj, index) => (
                        <Badge key={index} variant="secondary">
                          {skillObj.skill.name}
                        </Badge>
                      ))}
                      {profile.skills.length === 0 && (
                        <p className="text-sm text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Preferred Sectors</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.preferences.preferredSectors.map((sector, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Preferred Locations</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.preferences.preferredLocations.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}