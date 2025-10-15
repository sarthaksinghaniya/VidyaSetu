"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Building2, Shield, Users, MapPin, Star, ArrowRight, Smartphone } from "lucide-react"

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const userTypes = [
    {
      id: "student",
      title: "Student",
      description: "Find the perfect internship opportunity tailored to your skills and preferences",
      icon: GraduationCap,
      color: "bg-blue-500",
      features: ["AI-powered recommendations", "Resume builder", "Progress tracking", "Multilingual support"]
    },
    {
      id: "employer",
      title: "Employer",
      description: "Post internships and connect with talented students across India",
      icon: Building2,
      color: "bg-green-500",
      features: ["AI candidate matching", "Easy posting", "Application management", "Analytics dashboard"]
    },
    {
      id: "admin",
      title: "Government Admin",
      description: "Monitor and manage the PM Internship Scheme program",
      icon: Shield,
      color: "bg-purple-500",
      features: ["Real-time monitoring", "Analytics dashboard", "State-wise insights", "Scheme management"]
    }
  ]

  const stats = [
    { label: "Students Registered", value: "50,000+", icon: Users },
    { label: "Active Internships", value: "2,500+", icon: Building2 },
    { label: "Companies Partnered", value: "500+", icon: Star },
    { label: "States Covered", value: "28+", icon: MapPin }
  ]

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    // TODO: Navigate to appropriate registration/login page
    console.log(`Selected role: ${role}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vidya Setu</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Internship Recommendation Engine</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            PM Internship Scheme
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Empowering India's
            <span className="text-orange-500 block">Future Talent</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect students with meaningful internship opportunities under the PM Internship Scheme using AI-powered recommendations
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <stat.icon className="w-8 h-8 text-orange-500 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="px-4 md:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Join as
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Select your role to get started with Vidya Setu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userTypes.map((userType) => (
              <Card 
                key={userType.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRole === userType.id 
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                    : 'hover:scale-105'
                }`}
                onClick={() => handleRoleSelect(userType.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <userType.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{userType.title}</CardTitle>
                  <CardDescription>{userType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {userType.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={selectedRole === userType.id ? "default" : "outline"}
                    onClick={() => {
                      localStorage.setItem('selectedRole', userType.id)
                      window.location.href = '/login'
                    }}
                  >
                    Get Started with Mobile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-6 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Vidya Setu?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Built specifically for India's PM Internship Scheme
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI-Powered Matching",
                description: "Advanced algorithms match students with internships based on skills, location, and preferences",
                icon: Star
              },
              {
                title: "Multilingual Support",
                description: "Available in English, Hindi, Tamil, Bengali, Telugu and more regional languages",
                icon: Users
              },
              {
                title: "Mobile-First Authentication",
                description: "Secure OTP-based login using mobile number, no email required",
                icon: Smartphone
              },
              {
                title: "Real-time Analytics",
                description: "Comprehensive dashboards for government monitoring and employer insights",
                icon: Building2
              },
              {
                title: "Secure & Compliant",
                description: "Bank-level security with Aadhaar integration and data privacy protection",
                icon: Shield
              },
              {
                title: "Pan-India Coverage",
                description: "Available across all states and union territories with local insights",
                icon: GraduationCap
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Vidya Setu</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering India's youth through the PM Internship Scheme
          </p>
          <div className="text-sm text-gray-500">
            © 2025 Vidya Setu. Smart India Hackathon 2025 Project.
          </div>
        </div>
      </footer>
    </div>
  )
}