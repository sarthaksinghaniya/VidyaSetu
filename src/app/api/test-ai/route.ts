import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
  try {
    // Test AI service initialization
    await aiService.initialize()
    
    // Test resume analysis
    const resumeText = `
John Doe
Email: john@example.com
Phone: +91 9876543210

Education:
- Bachelor of Technology in Computer Science
  IIT Delhi, 2020-2024
  CGPA: 8.5

Skills:
- Python, JavaScript, React
- Machine Learning, Data Analysis
- Problem Solving, Communication

Experience:
- Intern at Tech Corp (2023)
  Worked on web development projects
  Collaborated with team of 5 developers

Projects:
- E-commerce Website (React, Node.js)
- Machine Learning Model for Stock Prediction
- Mobile App for Task Management
    `

    const analysis = await aiService.analyzeResume(resumeText)
    
    return NextResponse.json({
      message: 'AI service test successful',
      analysis
    })

  } catch (error) {
    console.error('AI service test error:', error)
    return NextResponse.json(
      { error: 'AI service test failed', details: error.message },
      { status: 500 }
    )
  }
}