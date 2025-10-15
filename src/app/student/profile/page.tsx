'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  BookOpen, 
  MapPin, 
  Briefcase,
  Plus,
  X,
  Save
} from 'lucide-react'

interface StudentProfile {
  userId: string
  phone: string
  address: string
  state: string
  district: string
  language: string
  resumeUrl?: string
  profileComplete: boolean
  education: Array<{
    institution: string
    degree: string
    field: string
    startYear: number
    endYear?: number
    grade?: string
  }>
  skills: string[]
  preferences: {
    preferredSectors: string[]
    preferredLocations: string[]
    preferredTypes: string[]
    minStipend?: number
    maxDistance?: number
  }
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

const SECTORS = [
  'technology', 'healthcare', 'education', 'agriculture', 'manufacturing',
  'retail', 'finance', 'government', 'other'
]

const INTERNSHIP_TYPES = [
  'full_time', 'part_time', 'remote', 'hybrid'
]

const LANGUAGES = [
  'english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi',
  'gujarati', 'kannada', 'malayalam', 'punjabi'
]

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS',
  'SQL', 'Excel', 'Communication', 'Teamwork', 'Problem Solving',
  'Leadership', 'Time Management', 'Data Analysis', 'Machine Learning',
  'Digital Marketing', 'Content Writing', 'Graphic Design', 'Accounting'
]

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    grade: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && profile && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter(skill => skill !== skillToRemove)
      })
    }
  }

  const addEducation = () => {
    if (profile && newEducation.institution && newEducation.degree && newEducation.field) {
      setProfile({
        ...profile,
        education: [
          ...profile.education,
          {
            institution: newEducation.institution,
            degree: newEducation.degree,
            field: newEducation.field,
            startYear: parseInt(newEducation.startYear),
            endYear: newEducation.endYear ? parseInt(newEducation.endYear) : undefined,
            grade: newEducation.grade || undefined
          }
        ]
      })
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        grade: ''
      })
    }
  }

  const removeEducation = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        education: profile.education.filter((_, i) => i !== index)
      })
    }
  }

  const togglePreference = (type: keyof StudentProfile['preferences'], value: string) => {
    if (!profile) return

    const currentPreferences = profile.preferences[type] as string[]
    const updatedPreferences = currentPreferences.includes(value)
      ? currentPreferences.filter(item => item !== value)
      : [...currentPreferences, value]

    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [type]: updatedPreferences
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Error loading profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Help us find the perfect internships for you.</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic information about you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={profile.language} onValueChange={(value) => setProfile({...profile, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={profile.state} onValueChange={(value) => setProfile({...profile, state: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIANAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={profile.district}
                      onChange={(e) => setProfile({...profile, district: e.target.value})}
                      placeholder="Enter your district"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Education History
                </CardTitle>
                <CardDescription>
                  Add your educational qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                      placeholder="University/College name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      placeholder="B.Tech, B.Sc, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="field">Field of Study</Label>
                    <Input
                      id="field"
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                      placeholder="Computer Science, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="startYear">Start Year</Label>
                    <Input
                      id="startYear"
                      type="number"
                      value={newEducation.startYear}
                      onChange={(e) => setNewEducation({...newEducation, startYear: e.target.value})}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endYear">End Year (Optional)</Label>
                    <Input
                      id="endYear"
                      type="number"
                      value={newEducation.endYear}
                      onChange={(e) => setNewEducation({...newEducation, endYear: e.target.value})}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade/Percentage (Optional)</Label>
                    <Input
                      id="grade"
                      value={newEducation.grade}
                      onChange={(e) => setNewEducation({...newEducation, grade: e.target.value})}
                      placeholder="8.5 CGPA, 85%, etc."
                    />
                  </div>
                </div>
                <Button onClick={addEducation} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>

                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startYear} - {edu.endYear || 'Present'}
                          {edu.grade && ` • ${edu.grade}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription>
                  Add your technical and soft skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Common Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={profile.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (profile.skills.includes(skill)) {
                            removeSkill(skill)
                          } else {
                            setProfile({
                              ...profile,
                              skills: [...profile.skills, skill]
                            })
                          }
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Your Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Internship Preferences
                </CardTitle>
                <CardDescription>
                  Tell us what kind of internships you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Preferred Sectors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SECTORS.map((sector) => (
                      <Badge
                        key={sector}
                        variant={profile.preferences.preferredSectors.includes(sector) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePreference('preferredSectors', sector)}
                      >
                        {sector.charAt(0).toUpperCase() + sector.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Preferred Locations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INDIANAN_STATES.slice(0, 10).map((state) => (
                      <Badge
                        key={state}
                        variant={profile.preferences.preferredLocations.includes(state) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePreference('preferredLocations', state)}
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Preferred Internship Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERNSHIP_TYPES.map((type) => (
                      <Badge
                        key={type}
                        variant={profile.preferences.preferredTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePreference('preferredTypes', type)}
                      >
                        {type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStipend">Minimum Stipend (₹)</Label>
                    <Input
                      id="minStipend"
                      type="number"
                      value={profile.preferences.minStipend || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          minStipend: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={profile.preferences.maxDistance || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          maxDistance: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                      placeholder="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={saveProfile} disabled={saving} className="px-8">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}