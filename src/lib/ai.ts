import ZAI from 'z-ai-web-dev-sdk'

class AIService {
  private zai: any = null

  async initialize() {
    try {
      this.zai = await ZAI.create()
      console.log('AI Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AI Service:', error)
      throw error
    }
  }

  async generateRecommendations(studentProfile: any, availableInternships: any[]): Promise<any[]> {
    if (!this.zai) {
      await this.initialize()
    }

    try {
      // Prepare student data for AI analysis
      const studentData = {
        skills: studentProfile.skills || [],
        education: studentProfile.education || [],
        experience: studentProfile.experience || 0,
        preferences: studentProfile.preferences || {},
        location: studentProfile.state || '',
        bio: studentProfile.bio || ''
      }

      // Prepare internships data
      const internshipsData = availableInternships.map(internship => ({
        id: internship.id,
        title: internship.title,
        description: internship.description,
        sector: internship.sector,
        location: internship.location,
        state: internship.state,
        stipend: internship.stipend,
        duration: internship.duration,
        type: internship.type,
        skills: internship.skills ? JSON.parse(internship.skills) : [],
        requirements: internship.requirements
      }))

      // Create AI prompt for recommendation
      const prompt = `
You are an AI internship recommendation engine for the PM Internship Scheme in India. Your task is to analyze student profiles and internship opportunities to provide personalized recommendations.

STUDENT PROFILE:
- Skills: ${studentData.skills.map((s: any) => s.skill?.name || s).join(', ')}
- Education: ${studentData.education.map((e: any) => `${e.degree} in ${e.field} from ${e.institution}`).join(', ')}
- Experience: ${studentData.experience} years
- Location: ${studentData.location}
- Preferred Sectors: ${studentData.preferences.preferredSectors ? JSON.parse(studentData.preferences.preferredSectors).join(', ') : 'Any'}
- Preferred Locations: ${studentData.preferences.preferredLocations ? JSON.parse(studentData.preferences.preferredLocations).join(', ') : 'Any'}
- Preferred Types: ${studentData.preferences.preferredTypes ? JSON.parse(studentData.preferences.preferredTypes).join(', ') : 'Any'}
- Minimum Stipend: ${studentData.preferences.minStipend || 'Flexible'}
- Bio: ${studentData.bio}

AVAILABLE INTERNSHIPS:
${internshipsData.map((internship, index) => `
${index + 1}. ${internship.title}
   - Sector: ${internship.sector}
   - Location: ${internship.location}, ${internship.state}
   - Type: ${internship.type}
   - Duration: ${internship.duration} weeks
   - Stipend: ${internship.stipend || 'Unpaid'}
   - Skills Required: ${internship.skills.join(', ')}
   - Requirements: ${internship.requirements}
`).join('')}

Please analyze this student profile and provide a ranked list of the top 5 most suitable internships. For each recommendation, provide:
1. Internship ID
2. Match score (0-100)
3. Specific reasons for the recommendation (2-3 bullet points)

Focus on:
- Skills match and relevance
- Location preference alignment
- Sector interest alignment
- Experience level appropriateness
- Stipend expectations
- Career growth potential

Format your response as a JSON array with the following structure:
[
  {
    "internshipId": "id",
    "score": 85,
    "reasons": ["Reason 1", "Reason 2", "Reason 3"]
  }
]
`

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI internship recommendation system specializing in the Indian job market and PM Internship Scheme.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI service')
      }

      // Parse the JSON response
      try {
        const recommendations = JSON.parse(response)
        return recommendations.slice(0, 5) // Ensure we only return top 5
      } catch (parseError) {
        console.error('Failed to parse AI response:', response)
        // Fallback to simple scoring if JSON parsing fails
        return this.generateFallbackRecommendations(studentData, internshipsData)
      }

    } catch (error) {
      console.error('AI recommendation error:', error)
      throw error
    }
  }

  private generateFallbackRecommendations(studentData: any, internships: any[]): any[] {
    // Simple fallback scoring algorithm
    return internships
      .map(internship => {
        let score = 50 // Base score

        // Skills match
        const studentSkills = studentData.skills.map((s: any) => s.skill?.name || s.toLowerCase())
        const requiredSkills = internship.skills.map((s: string) => s.toLowerCase())
        const skillMatches = studentSkills.filter(skill => requiredSkills.includes(skill))
        score += skillMatches.length * 10

        // Location preference
        if (studentData.preferences.preferredLocations) {
          const preferredLocations = JSON.parse(studentData.preferences.preferredLocations)
          if (preferredLocations.includes(internship.state)) {
            score += 15
          }
        }

        // Sector preference
        if (studentData.preferences.preferredSectors) {
          const preferredSectors = JSON.parse(studentData.preferences.preferredSectors)
          if (preferredSectors.includes(internship.sector)) {
            score += 15
          }
        }

        // Type preference
        if (studentData.preferences.preferredTypes) {
          const preferredTypes = JSON.parse(studentData.preferences.preferredTypes)
          if (preferredTypes.includes(internship.type)) {
            score += 10
          }
        }

        // Stipend preference
        if (studentData.preferences.minStipend && internship.stipend) {
          if (internship.stipend >= studentData.preferences.minStipend) {
            score += 10
          }
        }

        return {
          internshipId: internship.id,
          score: Math.min(score, 100),
          reasons: [
            skillMatches.length > 0 ? `${skillMatches.length} skills match your profile` : 'Opportunity to learn new skills',
            `Located in ${internship.state}`,
            `${internship.sector} sector opportunity`
          ]
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  async analyzeResume(resumeText: string): Promise<any> {
    if (!this.zai) {
      await this.initialize()
    }

    try {
      const prompt = `
Analyze this resume and extract the following information in JSON format:
{
  "skills": ["skill1", "skill2", ...],
  "education": [
    {
      "institution": "name",
      "degree": "degree name",
      "field": "field of study",
      "startYear": 2020,
      "endYear": 2024
    }
  ],
  "experience": 2,
  "bio": "brief summary",
  "strengths": ["strength1", "strength2", ...],
  "suggestedRoles": ["role1", "role2", ...]
}

Resume text:
${resumeText}
`

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyzer specializing in the Indian job market.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI service')
      }

      return JSON.parse(response)

    } catch (error) {
      console.error('Resume analysis error:', error)
      throw error
    }
  }

  async generateInternshipDescription(internshipData: any): Promise<string> {
    if (!this.zai) {
      await this.initialize()
    }

    try {
      const prompt = `
Generate a compelling internship description for the following details:

Title: ${internshipData.title}
Company: ${internshipData.company}
Sector: ${internshipData.sector}
Location: ${internshipData.location}
Duration: ${internshipData.duration} weeks
Stipend: ${internshipData.stipend || 'Unpaid'}
Skills Required: ${internshipData.skills?.join(', ') || 'Not specified'}
Type: ${internshipData.type}

Please create a professional, engaging description that:
1. Clearly outlines the role and responsibilities
2. Highlights learning opportunities
3. Mentions required skills and qualifications
4. Includes information about the company culture
5. Encourages qualified candidates to apply

Keep the tone professional but approachable, suitable for Indian students.
`

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in internship descriptions for the Indian market.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      return completion.choices[0]?.message?.content || 'Description not available'

    } catch (error) {
      console.error('Description generation error:', error)
      throw error
    }
  }
}

export const aiService = new AIService()