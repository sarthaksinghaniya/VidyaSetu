'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface AnalyticsData {
  totalStudents: number
  totalEmployers: number
  totalInternships: number
  totalApplications: number
  acceptedApplications: number
  completedInternships: number
  applicationsByStatus: Array<{ _id: string; count: number }>
  internshipsBySector: Array<{ _id: string; count: number }>
  studentsByState: Array<{ _id: string; count: number }>
  recentApplications: Array<{
    _id: string
    studentId: { userId: string }
    internshipId: { title: string }
    status: string
    appliedAt: string
  }>
}

interface StateData {
  name: string
  students: number
  employers: number
  internships: number
  applications: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string>('all')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
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
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStateData = (): StateData[] => {
    if (!analytics) return []
    
    const stateMap = new Map<string, StateData>()
    
    analytics.studentsByState.forEach(state => {
      stateMap.set(state._id, {
        name: state._id,
        students: state.count,
        employers: 0,
        internships: 0,
        applications: 0
      })
    })

    return Array.from(stateMap.values()).sort((a, b) => b.students - a.students)
  }

  const getAcceptanceRate = () => {
    if (!analytics || analytics.totalApplications === 0) return 0
    return Math.round((analytics.acceptedApplications / analytics.totalApplications) * 100)
  }

  const getCompletionRate = () => {
    if (!analytics || analytics.acceptedApplications === 0) return 0
    return Math.round((analytics.completedInternships / analytics.acceptedApplications) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Error loading analytics data</p>
        </div>
      </div>
    )
  }

  const stateData = getStateData()
  const acceptanceRate = getAcceptanceRate()
  const completionRate = getCompletionRate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor PM Internship Scheme performance across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEmployers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Participating companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInternships.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Available opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalApplications.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {acceptanceRate}% acceptance rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="states">State-wise</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Application Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.applicationsByStatus.map((status) => (
                      <div key={status._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status._id).split(' ')[0]}`}></div>
                          <span className="capitalize">{status._id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{status.count.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">
                            ({Math.round((status.count / analytics.totalApplications) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Internships by Sector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.internshipsBySector.map((sector) => (
                      <div key={sector._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="capitalize">{sector._id}</span>
                          <span className="text-sm text-gray-500">{sector.count}</span>
                        </div>
                        <Progress 
                          value={(sector.count / analytics.totalInternships) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{acceptanceRate}%</div>
                    <p className="text-sm text-gray-600">Acceptance Rate</p>
                    <Progress value={acceptanceRate} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <Progress value={completionRate} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round((analytics.completedInternships / analytics.totalStudents) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Student Success Rate</p>
                    <Progress 
                      value={(analytics.completedInternships / analytics.totalStudents) * 100} 
                      className="mt-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <span>Total Applications</span>
                      <span className="font-bold">{analytics.totalApplications.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                      <span>Shortlisted</span>
                      <span className="font-bold">
                        {analytics.applicationsByStatus.find(s => s._id === 'shortlisted')?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span>Accepted</span>
                      <span className="font-bold">{analytics.acceptedApplications.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                      <span>Completed</span>
                      <span className="font-bold">{analytics.completedInternships.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.internshipsBySector.map((sector) => {
                      const sectorApplications = analytics.applicationsByStatus.reduce((sum, status) => sum + status.count, 0)
                      const avgApplications = sectorApplications / analytics.totalInternships
                      
                      return (
                        <div key={sector._id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium capitalize">{sector._id}</p>
                            <p className="text-sm text-gray-500">{sector.count} internships</p>
                          </div>
                          <Badge variant={avgApplications > 10 ? "default" : "secondary"}>
                            {avgApplications > 10 ? "High Demand" : "Moderate"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="states" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  State-wise Performance
                </CardTitle>
                <CardDescription>
                  Student participation and internship opportunities by state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stateData.slice(0, 10).map((state) => (
                    <div key={state.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{state.name}</h3>
                        <Badge variant="outline">
                          {state.students} students
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Employers</p>
                          <p className="font-medium">{state.employers}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Internships</p>
                          <p className="font-medium">{state.internships}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Applications</p>
                          <p className="font-medium">{state.applications}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Applications
                </CardTitle>
                <CardDescription>
                  Latest internship applications across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentApplications.map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{application.internshipId.title}</h4>
                        <p className="text-sm text-gray-500">
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}