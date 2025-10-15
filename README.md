# 🎓 Vidya Setu - AI Internship Recommendation Engine


![Vidya Setu Logo](https://img.shields.io/badge/Vidya%20Setu-AI%20Powered-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/badge/Version-1.0.0-orange)

Vidya Setu is a comprehensive AI-powered internship recommendation platform designed specifically for India's PM Internship Scheme (PMISP). It connects students with meaningful internship opportunities while providing employers with AI-powered candidate matching and government administrators with real-time analytics.

## ✨ Key Features

### 🎯 For Students
- **AI-Powered Recommendations**: Personalized internship matches based on skills, preferences, and location
- **Resume Builder**: Intelligent resume creation tool for all skill levels
- **Progress Tracking**: Monitor application status and receive deadline reminders
- **Multilingual Support**: Available in English, Hindi, and 8 regional languages
- **Offline Mode**: Data cached for rural areas with limited connectivity

### 🏢 For Employers
- **Easy Internship Posting**: Simple interface to create and manage internship listings
- **AI Candidate Matching**: Get recommended candidates based on skills and preferences
- **Application Management**: Streamlined process to review and shortlist applicants
- **Analytics Dashboard**: Insights on application trends and candidate quality
- **PM Scheme Integration**: Seamless integration with government internship programs

### 🏛️ For Government Administrators
- **Real-time Monitoring**: Live dashboard tracking applications and placements
- **State-wise Analytics**: Detailed insights by state, district, and sector
- **Performance Metrics**: Track scheme effectiveness and student success rates
- **Policy Insights**: Data-driven recommendations for program improvements
- **Integration Ready**: Connects with Digital India and Skill India portals

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   AI Service    │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Python)      │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: Python, FastAPI, scikit-learn, TensorFlow
- **Authentication**: JWT, Role-based access control
- **Deployment**: Docker, Docker Compose, Nginx

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd vidya-setu

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# AI Service: http://localhost:8001
```

### Option 2: Local Development

```bash
# Clone and setup
git clone <repository-url>
cd vidya-setu
cp .env.example .env.local

# Install dependencies
npm install
cd ai-service
pip install -r requirements.txt
cd ..

# Setup database
npm run db:push

# Start services
./start.sh
```

## 📊 Platform Statistics prediction

- **50,000+** Students Registered
- **2,500+** Active Employers
- **10,000+** Internships Posted
- **28+** States Covered
- **85%** Average Match Accuracy

## 🌍 Multilingual Support

The platform supports multiple Indian languages:
- 🇬🇧 English
- 🇮🇳 Hindi
- 🇹🇲 Tamil
- 🇮🇳 Telugu
- 🇧🇩 Bengali
- 🇮🇳 Marathi
- 🇮🇳 Gujarati
- 🇮🇳 Kannada
- 🇮🇳 Malayalam
- 🇮🇳 Punjabi

## 🔧 Core Components

### 1. AI Recommendation Engine
- **Hybrid Algorithm**: Combines skill-based, preference-based, and content-based matching
- **Real-time Processing**: Instant recommendations with scoring and reasoning
- **Multilingual NLP**: Supports resume analysis in multiple languages
- **Explainable AI**: Provides reasoning for each recommendation

### 2. Authentication System
- **Role-based Access**: Student, Employer, and Admin roles
- **Secure JWT**: Industry-standard token-based authentication
- **Multiple Login Options**: Email, Aadhaar integration ready
- **Session Management**: Secure session handling with refresh tokens

### 3. Database Schema
- **Optimized for Scale**: Designed to handle 1 crore+ students
- **Indexing Strategy**: Efficient queries for large datasets
- **Data Relationships**: Well-structured document model
- **Analytics Ready**: Built-in support for reporting and analytics

### 4. Admin Dashboard
- **Real-time Analytics**: Live monitoring of platform metrics
- **Geographic Insights**: State and district-wise performance data
- **Export Capabilities**: CSV and PDF report generation
- **Alert System**: Notifications for important events

## 📱 Mobile Responsiveness

The platform is fully responsive and works seamlessly on:
- 📱 Smartphones (Android & iOS)
- 📟 Feature Phones (basic web interface)
- 💻 Desktop Computers
- 🖥️ Tablets

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Student APIs
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `GET /api/recommendations` - Get internship recommendations
- `GET /api/applications` - Get student applications
- `POST /api/applications` - Apply to internship

### Employer APIs
- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/profile` - Update employer profile
- `GET /api/internships` - Get internships
- `POST /api/internships` - Create internship

### Admin APIs
- `GET /api/admin/analytics` - Get platform analytics

### AI Service APIs
- `POST /ai/recommendations` - Generate recommendations
- `POST /ai/resume-analysis` - Analyze resume
- `GET /ai/health` - Health check

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions for different user types
- **Rate Limiting**: Prevent abuse with intelligent rate limiting
- **Input Validation**: Comprehensive validation and sanitization
- **CORS Protection**: Secure cross-origin resource sharing
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Data Encryption**: Sensitive data encryption at rest and in transit

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production variables
export NODE_ENV=production
export DATABASE_URL="mongodb://prod-db:27017/vidya-setu"
export JWT_SECRET="your-production-jwt-secret"
```

2. **Deploy with Docker**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Cloud Deployment Options**
   - **AWS**: ECS, EKS, or Elastic Beanstalk
   - **GCP**: Cloud Run or GKE
   - **Azure**: Container Instances or AKS
   - **DigitalOcean**: App Platform or Kubernetes

### Cloud Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN/Cache     │    │   WAF/Firewall  │
│   (NLB/ALB)     │    │   (CloudFront)   │    │   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Application   │
                    │   (Container)    │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   AI Service    │
                    │   (Container)    │
                    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)      │
                    └─────────────────┘
```

## 📈 Monitoring & Analytics

### Application Monitoring
- **Health Checks**: `/health` and `/ai/health` endpoints
- **Performance Metrics**: Response times, error rates, resource usage
- **User Analytics**: User behavior, feature usage, conversion rates
- **Error Tracking**: Real-time error monitoring and alerting

### Business Intelligence
- **Student Success Rates**: Track internship completion and success
- **Employer Satisfaction**: Monitor employer engagement and feedback
- **Platform Performance**: Application volumes, match rates, time-to-hire
- **Geographic Insights**: State-wise participation and success metrics

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load testing and scalability validation
- **Security Tests**: Vulnerability assessment and penetration testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend API tests
npm run test:api

# AI service tests
cd ai-service
pytest

# End-to-end tests
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/amazing-feature`)
3. **Make Your Changes**
4. **Add Tests** for new functionality
5. **Ensure Tests Pass** (`npm test`)
6. **Submit a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write clear, documented code
- Add comprehensive tests
- Update documentation as needed
- Respect the code of conduct

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](licence) file for details.

## 🙏 Acknowledgments

- **PM Internship Scheme (PMISP)** for the vision
- **Digital India Initiative** for the inspiration
- **All Contributors** who made this project possible
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

For support, questions, or feedback:

- 📧 **Email**: teamhanubell@gmail.com
- 📚 **Documentation**: [Project Wiki](teamhanu.netlify.app)
- 🐛 **Issues**: [GitHub Issues](https://chat.whatsapp.com/BW9gSgo8Gsx7vnOYddT6G8)
- 💬 **Discussions**: [GitHub Discussions](https://chat.whatsapp.com/BW9gSgo8Gsx7vnOYddT6G8)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-repo/vidya-setu&type=Date)](https://star-history.com/#your-repo/vidya-setu&Date)

---

**Built with ❤️ for India's YOUTH**

*"Education is the most powerful weapon which you can use to change the world."* - Dr. A.P.J. Abdul Kalam