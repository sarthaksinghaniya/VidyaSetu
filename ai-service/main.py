from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import json

app = FastAPI(title="Vidya Setu AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentProfile(BaseModel):
    userId: str
    skills: List[str]
    preferences: Dict[str, List[str]]
    state: str
    district: str
    education: List[Dict]
    language: str

class Internship(BaseModel):
    _id: str
    title: str
    description: str
    type: str
    sector: str
    location: str
    state: str
    district: Optional[str]
    stipend: Optional[float]
    duration: int
    skills: List[str]
    requirements: Optional[str]

class RecommendationRequest(BaseModel):
    student: StudentProfile
    internships: List[Internship]
    max_recommendations: int = 10

class RecommendationResponse(BaseModel):
    recommendations: List[Dict]
    algorithm_used: str
    confidence_scores: Dict[str, float]

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_sector: str
    language: str = "english"

class ResumeAnalysisResponse(BaseModel):
    extracted_skills: List[str]
    skill_gaps: List[str]
    recommendations: List[str]
    confidence_score: float

class SkillExtractor:
    def __init__(self):
        self.tech_skills = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
            'web_dev': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring'],
            'data_science': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'opencv', 'nltk'],
            'database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'git'],
            'mobile': ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'xamarin'],
            'design': ['figma', 'adobe creative suite', 'sketch', 'photoshop', 'illustrator', 'ui/ux'],
        }
        
        self.soft_skills = [
            'communication', 'teamwork', 'leadership', 'problem solving', 'time management',
            'critical thinking', 'creativity', 'adaptability', 'collaboration', 'project management',
            'analytical thinking', 'decision making', 'interpersonal skills', 'presentation skills',
            'negotiation', 'conflict resolution', 'emotional intelligence', 'networking'
        ]
        
        self.all_skills = []
        for category in self.tech_skills.values():
            self.all_skills.extend(category)
        self.all_skills.extend(self.soft_skills)

    def extract_skills(self, text: str) -> List[str]:
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.all_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))

class RecommendationEngine:
    def __init__(self):
        self.skill_extractor = SkillExtractor()
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def calculate_skill_match(self, student_skills: List[str], internship_skills: List[str]) -> float:
        if not internship_skills:
            return 0.5
        
        student_set = set([skill.lower() for skill in student_skills])
        internship_set = set([skill.lower() for skill in internship_skills])
        
        if not student_set:
            return 0.3
        
        intersection = student_set.intersection(internship_set)
        union = student_set.union(internship_set)
        
        return len(intersection) / len(union) if union else 0
    
    def calculate_preference_match(self, student_preferences: Dict, internship: Dict) -> float:
        score = 0
        max_score = 0
        
        # Sector preference
        if 'preferredSectors' in student_preferences and student_preferences['preferredSectors']:
            max_score += 30
            if internship.get('sector', '').lower() in [s.lower() for s in student_preferences['preferredSectors']]:
                score += 30
        
        # Location preference
        if 'preferredLocations' in student_preferences and student_preferences['preferredLocations']:
            max_score += 25
            if internship.get('state', '').lower() in [loc.lower() for loc in student_preferences['preferredLocations']]:
                score += 25
        
        # Type preference
        if 'preferredTypes' in student_preferences and student_preferences['preferredTypes']:
            max_score += 20
            if internship.get('type', '').lower() in [t.lower() for t in student_preferences['preferredTypes']]:
                score += 20
        
        # Stipend preference
        if 'minStipend' in student_preferences and student_preferences['minStipend']:
            max_score += 15
            if internship.get('stipend') and internship['stipend'] >= student_preferences['minStipend']:
                score += 15
        
        return score / max_score if max_score > 0 else 0.5
    
    def calculate_content_similarity(self, student_profile: Dict, internship: Dict) -> float:
        student_text = ' '.join(student_profile.get('skills', []))
        student_text += ' ' + ' '.join(student_profile.get('preferences', {}).get('preferredSectors', []))
        
        internship_text = internship.get('title', '') + ' ' + internship.get('description', '')
        internship_text += ' ' + ' '.join(internship.get('skills', []))
        
        if not student_text.strip() or not internship_text.strip():
            return 0.5
        
        try:
            texts = [student_text, internship_text]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            return 0.5
    
    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        student = request.student
        internships = request.internships
        max_recs = request.max_recommendations
        
        recommendations = []
        
        for internship in internships:
            # Calculate different scores
            skill_score = self.calculate_skill_match(student.skills, internship.skills)
            preference_score = self.calculate_preference_match(student.preferences, internship.dict())
            content_score = self.calculate_content_similarity(student.dict(), internship.dict())
            
            # Weighted combination
            final_score = (
                skill_score * 0.4 +
                preference_score * 0.4 +
                content_score * 0.2
            )
            
            # Boost score for PM Scheme internships
            if hasattr(internship, 'isPmScheme') and internship.isPmScheme:
                final_score *= 1.1
            
            # Boost score for local opportunities
            if internship.state.lower() == student.state.lower():
                final_score *= 1.05
            
            recommendation = {
                'internship_id': internship._id,
                'title': internship.title,
                'company': getattr(internship, 'companyName', 'Unknown'),
                'match_score': round(final_score * 100, 2),
                'skill_match_score': round(skill_score * 100, 2),
                'preference_match_score': round(preference_score * 100, 2),
                'content_similarity_score': round(content_score * 100, 2),
                'common_skills': list(set(student.skills) & set(internship.skills)),
                'reasoning': self.generate_reasoning(skill_score, preference_score, content_score, student, internship)
            }
            
            recommendations.append(recommendation)
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Calculate confidence metrics
        avg_score = np.mean([rec['match_score'] for rec in recommendations])
        score_std = np.std([rec['match_score'] for rec in recommendations])
        
        return RecommendationResponse(
            recommendations=recommendations[:max_recs],
            algorithm_used="Hybrid (Skill + Preference + Content)",
            confidence_scores={
                'average_match_score': float(avg_score),
                'score_distribution': float(score_std),
                'recommendation_quality': 'high' if avg_score > 70 else 'medium' if avg_score > 50 else 'low'
            }
        )
    
    def generate_reasoning(self, skill_score: float, preference_score: float, content_score: float, 
                          student: StudentProfile, internship: Internship) -> List[str]:
        reasoning = []
        
        if skill_score > 0.7:
            reasoning.append("Strong skill match with your profile")
        elif skill_score > 0.5:
            reasoning.append("Good skill alignment")
        
        if preference_score > 0.7:
            reasoning.append("Matches your preferences perfectly")
        elif preference_score > 0.5:
            reasoning.append("Aligns with some of your preferences")
        
        if content_score > 0.6:
            reasoning.append("Content similarity suggests good fit")
        
        if internship.state.lower() == student.state.lower():
            reasoning.append("Local opportunity in your state")
        
        if not reasoning:
            reasoning.append("Potential opportunity based on profile analysis")
        
        return reasoning

recommendation_engine = RecommendationEngine()

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        return recommendation_engine.generate_recommendations(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resume-analysis", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    try:
        skill_extractor = SkillExtractor()
        
        # Extract skills from resume
        extracted_skills = skill_extractor.extract_skills(request.resume_text)
        
        # Identify skill gaps based on target sector
        target_sector_skills = skill_extractor.tech_skills.get(request.target_sector.lower(), [])
        skill_gaps = [skill for skill in target_sector_skills if skill not in extracted_skills]
        
        # Generate recommendations
        recommendations = []
        if len(extracted_skills) < 5:
            recommendations.append("Consider adding more technical skills to your resume")
        if not any(skill in extracted_skills for skill in target_sector_skills):
            recommendations.append(f"Focus on {request.target_sector} specific skills")
        recommendations.append("Highlight relevant projects and experiences")
        recommendations.append("Include quantifiable achievements")
        
        # Calculate confidence score
        confidence_score = min(len(extracted_skills) / 10, 1.0)
        
        return ResumeAnalysisResponse(
            extracted_skills=extracted_skills,
            skill_gaps=skill_gaps[:5],  # Top 5 skill gaps
            recommendations=recommendations,
            confidence_score=confidence_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Vidya Setu AI Service"}

@app.get("/")
async def root():
    return {
        "message": "Vidya Setu AI Recommendation Engine",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/recommendations",
            "resume-analysis": "/resume-analysis",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)