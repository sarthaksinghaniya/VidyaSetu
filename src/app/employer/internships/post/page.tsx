'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Plus,
  X,
  Save,
  Clock
} from 'lucide-react'

interface InternshipData {
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
  isPmScheme: boolean
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

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS',
  'SQL', 'Excel', 'Communication', 'Teamwork', 'Problem Solving',
  'Leadership', 'Time Management', 'Data Analysis', 'Machine Learning',
  'Digital Marketing', 'Content Writing', 'Graphic Design', 'Accounting'
]

const COMMON_BENEFITS = [
  'Certificate of Completion', 'Letter of Recommendation', 'Flexible Hours',
  'Remote Work Option', 'Learning Opportunities', 'Mentorship',
  'Performance Bonus', 'Travel Allowance', 'Health Insurance', 'Food Coupons'
]

export default function PostInternshipPage() {
  const [internship, setInternship] = useState<InternshipData>({
    title: '',
    description: '',
    type: '',
    sector: '',
    location: '',
    state: '',
    district: '',
    stipend: undefined,
    duration: 0,
    positions: 1,
    requirements: '',
    skills: [],
    benefits: [],
    applicationDeadline: '',
    startDate: '',
    isPmScheme: false
  })
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(internship)
      })

      if (response.ok) {
        alert('Internship posted successfully!')
        window.location.href = '/employer'
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to post internship')
      }
    } catch (error) {
      console.error('Error posting internship:', error)
      alert('Failed to post internship')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !internship.skills.includes(newSkill.trim())) {
      setInternship({
        ...internship,
        skills: [...internship.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setInternship({
      ...internship,
      skills: internship.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !internship.benefits?.includes(newBenefit.trim())) {
      setInternship({
        ...internship,
        benefits: [...(internship.benefits || []), newBenefit.trim()]
      })
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefitToRemove: string) => {
    setInternship({
      ...internship,
      benefits: internship.benefits?.filter(benefit => benefit !== benefitToRemove) || []
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post New Internship</h1>
          <p className="text-gray-600 mt-2">Create a new internship opportunity for students.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the internship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Internship Title</Label>
                <Input
                  id="title"
                  value={internship.title}
                  onChange={(e) => setInternship({...internship, title: e.target.value})}
                  placeholder="e.g., Software Development Intern"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={internship.description}
                  onChange={(e) => setInternship({...internship, description: e.target.value})}
                  placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Internship Type</Label>
                  <Select value={internship.type} onValueChange={(value) => setInternship({...internship, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERNSHIP_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={internship.sector} onValueChange={(value) => setInternship({...internship, sector: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector.charAt(0).toUpperCase() + sector.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Duration
              </CardTitle>
              <CardDescription>
                Where and for how long
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={internship.location}
                    onChange={(e) => setInternship({...internship, location: e.target.value})}
                    placeholder="e.g., Bangalore, Mumbai"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={internship.state} onValueChange={(value) => setInternship({...internship, state: value})}>
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
                  <Label htmlFor="district">District (Optional)</Label>
                  <Input
                    id="district"
                    value={internship.district}
                    onChange={(e) => setInternship({...internship, district: e.target.value})}
                    placeholder="Enter district"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={internship.duration}
                    onChange={(e) => setInternship({...internship, duration: parseInt(e.target.value)})}
                    placeholder="e.g., 12"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={internship.applicationDeadline}
                    onChange={(e) => setInternship({...internship, applicationDeadline: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={internship.startDate}
                    onChange={(e) => setInternship({...internship, startDate: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Compensation & Positions
              </CardTitle>
              <CardDescription>
                Stipend and number of positions available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stipend">Monthly Stipend (₹)</Label>
                  <Input
                    id="stipend"
                    type="number"
                    value={internship.stipend || ''}
                    onChange={(e) => setInternship({...internship, stipend: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    value={internship.positions}
                    onChange={(e) => setInternship({...internship, positions: parseInt(e.target.value)})}
                    placeholder="e.g., 5"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPmScheme"
                  checked={internship.isPmScheme}
                  onChange={(e) => setInternship({...internship, isPmScheme: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPmScheme">This internship is part of PM Internship Scheme</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements & Skills</CardTitle>
              <CardDescription>
                What skills and qualifications are required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={internship.requirements}
                  onChange={(e) => setInternship({...internship, requirements: e.target.value})}
                  placeholder="List the educational requirements, experience needed, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Common skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={internship.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          if (internship.skills.includes(skill)) {
                            removeSkill(skill)
                          } else {
                            setInternship({
                              ...internship,
                              skills: [...internship.skills, skill]
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
                  <p className="text-sm font-medium mb-1">Selected skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.skills.map((skill, index) => (
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
              <CardDescription>
                Additional benefits offered to interns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Common benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {COMMON_BENEFITS.map((benefit) => (
                    <Badge
                      key={benefit}
                      variant={internship.benefits?.includes(benefit) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        if (internship.benefits?.includes(benefit)) {
                          removeBenefit(benefit)
                        } else {
                          setInternship({
                            ...internship,
                            benefits: [...(internship.benefits || []), benefit]
                          })
                        }
                      }}
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Selected benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {internship.benefits?.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {benefit}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeBenefit(benefit)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="px-8">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Posting...' : 'Post Internship'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}