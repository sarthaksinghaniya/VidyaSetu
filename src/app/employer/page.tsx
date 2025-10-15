'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface EmployerProfile {
  userId: string
  companyName: string
  gstin?: string
  pan?: string
  phone: string
  address: string
  state: string
  district: string
  sector: string
  description?: string
  website?: string
  companySize?: string
  isVerified: boolean
  verificationDocuments?: string[]
}

interface Internship {
  _id: string
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
  skills: string[]
  benefits?: string[]
  applicationDeadline: string
  startDate: string
  isActive: boolean
  isPmScheme: boolean
  applications: number
}

interface Application {
  _id: string
  studentId: {
    userId: string
    phone: string
    state: string
    district: string
  }
  internshipId: {
    title: string
  }
  status: string
  matchScore?: number
  appliedAt: string
  interviewDate?: string
  feedback?: string
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null)
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const [profileRes, internshipsRes, applicationsRes] = await Promise.all([
        fetch('/api/employer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/internships', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/employer/applications', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
      }

      if (internshipsRes.ok) {
        const internshipsData = await internshipsRes.json()
        setInternships(internshipsData.internships)
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const toggleInternshipStatus = async (internshipId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/internships/${internshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating internship status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === 'pending').length
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length
  const activeInternships = internships.filter(int => int.isActive).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your internships and applications.</p>
        </div>

        {!profile?.isVerified && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Account Verification Pending</p>
                  <p className="text-sm text-orange-600">Please complete verification to access all features.</p>
                </div>
                <Button size="sm" className="ml-auto">
                  Verify Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">
                {internships.length} total posted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Candidates</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Successfully hired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.isVerified ? 'Verified' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.companySize || 'Not specified'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="internships" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="internships">My Internships</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="profile">Company Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="internships" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Posted Internships</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post New Internship
              </Button>
            </div>

            <div className="grid gap-4">
              {internships.map((internship) => (
                <Card key={internship._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{internship.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {internship.location}, {internship.state}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={internship.isActive ? "default" : "secondary"}>
                          {internship.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {internship.isPmScheme && (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            PM Scheme
                          </Badge>
                        )}
                      </div>
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
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{internship.applications} applications</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{internship.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {internship.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleInternshipStatus(internship._id, !internship.isActive)}
                        >
                          {internship.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Candidate Applications</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Pending ({pendingApplications})
                </Button>
                <Button variant="outline" size="sm">
                  Accepted ({acceptedApplications})
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{application.internshipId.title}</CardTitle>
                        <CardDescription>
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">{application.studentId.district}, {application.studentId.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact</label>
                        <p className="text-gray-900">{application.studentId.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Match Score</label>
                        <p className="text-gray-900">{application.matchScore || 'N/A'}%</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                            >
                              Shortlist
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application._id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
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
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <p className="text-gray-900">{profile.companyName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sector</label>
                        <p className="text-gray-900">{profile.sector}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">GSTIN</label>
                        <p className="text-gray-900">{profile.gstin || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">PAN</label>
                        <p className="text-gray-900">{profile.pan || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Size</label>
                        <p className="text-gray-900">{profile.companySize || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Website</label>
                        <p className="text-gray-900">{profile.website || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{profile.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <p className="text-gray-900">{profile.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">District</label>
                        <p className="text-gray-900">{profile.district}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{profile.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">{profile.description || 'No description provided'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {profile.isVerified ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-600 font-medium">Pending Verification</span>
                        </>
                      )}
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