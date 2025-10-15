# Vidya Setu - AI Internship Recommendation Engine
## Smart India Hackathon 2025 Project

### 📋 Project Overview

Vidya Setu is a comprehensive AI-powered internship recommendation platform designed specifically for India's PM Internship Scheme (PMISP). It connects students with meaningful internship opportunities while providing employers with AI-powered candidate matching and government administrators with real-time analytics.

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   AI Service    │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Python)      │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   (Optional)    │
                    │   Port: 6379    │
                    └─────────────────┘
```

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 7.0+
- Docker & Docker Compose (optional)

#### Option 1: Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd vidya-setu
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="mongodb://localhost:27017/vidya-setu"
MONGODB_URI="mongodb://localhost:27017/vidya-setu"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# Application
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

3. **Install dependencies**
```bash
# Frontend/Backend dependencies
npm install

# AI Service dependencies
cd ai-service
pip install -r requirements.txt
cd ..
```

4. **Set up database**
```bash
# Start MongoDB (if not using Docker)
mongod

# Initialize database
npm run db:push
```

5. **Start the development servers**
```bash
# Terminal 1: Main application
npm run dev

# Terminal 2: AI service
cd ai-service
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

6. **Access the application**
- Frontend: http://localhost:3000
- AI Service API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

#### Option 2: Docker Deployment

1. **Clone and navigate to the project**
```bash
git clone <repository-url>
cd vidya-setu
```

2. **Build and start all services**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- AI Service: http://localhost:8001
- MongoDB: localhost:27017

### 📁 Project Structure

```
vidya-setu/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── student/           # Student dashboard
│   │   ├── employer/          # Employer dashboard
│   │   ├── admin/             # Admin dashboard
│   │   └── login/             # Authentication
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── models/                # MongoDB models
│   └── hooks/                 # Custom React hooks
├── ai-service/                # Python AI service
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # AI service container
├── prisma/                   # Database schema
├── public/                   # Static assets
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Main application container
├── nginx.conf               # Nginx configuration
└── README.md               # This file
```

### 🔧 Configuration

#### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | MongoDB connection string | - | Yes |
| `MONGODB_URI` | MongoDB URI for models | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret | - | Yes |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` | Yes |
| `NODE_ENV` | Environment | `development` | No |

#### Database Schema

The application uses MongoDB with the following main collections:

- **users**: User authentication data
- **students**: Student profiles and preferences
- **employers**: Company profiles and information
- **internships**: Internship postings
- **applications**: Student applications to internships
- **analytics**: Performance metrics and statistics

### 🌐 API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Student APIs
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `GET /api/recommendations` - Get internship recommendations
- `GET /api/applications` - Get student applications
- `POST /api/applications` - Apply to internship

#### Employer APIs
- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/profile` - Update employer profile
- `GET /api/internships` - Get internships
- `POST /api/internships` - Create internship
- `PUT /api/internships/:id` - Update internship

#### Admin APIs
- `GET /api/admin/analytics` - Get platform analytics

#### AI Service APIs
- `POST /ai/recommendations` - Generate recommendations
- `POST /ai/resume-analysis` - Analyze resume
- `GET /ai/health` - Health check

### 🤖 AI Recommendation Engine

The AI service uses a hybrid approach combining:

1. **Skill-based Matching**: Compares student skills with internship requirements
2. **Preference-based Filtering**: Matches student preferences (location, sector, type)
3. **Content-based Similarity**: Uses TF-IDF vectorization for semantic matching
4. **Collaborative Filtering**: Considers similar users' choices (future enhancement)

#### Features:
- Multilingual support for Indian languages
- Real-time recommendation scoring
- Explainable AI with reasoning for each match
- Resume analysis and skill extraction
- Performance optimization with caching

### 🌍 Multilingual Support

The platform supports multiple Indian languages:
- English (default)
- Hindi
- Tamil
- Telugu
- Bengali
- Marathi
- Gujarati
- Kannada
- Malayalam
- Punjabi

Language detection and translation can be enabled through environment variables.

### 📊 Analytics Dashboard

The admin dashboard provides:
- Real-time monitoring of applications and placements
- State-wise performance metrics
- Sector-wise internship distribution
- Student success rates
- Application funnel analysis
- Export capabilities for reporting

### 🔒 Security Features

- JWT-based authentication
- Role-based access control (Student/Employer/Admin)
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS configuration
- Security headers (XSS, CSRF, etc.)
- Data encryption for sensitive information

### 🚀 Deployment

#### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="mongodb://prod-db:27017/vidya-setu"
export JWT_SECRET="your-production-jwt-secret"
```

2. **Build and Deploy**
```bash
# Build the application
npm run build

# Start with PM2 (recommended)
pm2 start ecosystem.config.js

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

#### Cloud Deployment Options

**AWS Deployment:**
```bash
# Using ECS
ecs-cli compose --project-name vidya-setu up

# Using EKS
kubectl apply -f k8s/
```

**Google Cloud Platform:**
```bash
# Using Cloud Run
gcloud run deploy vidya-setu --image gcr.io/PROJECT-ID/vidya-setu

# Using GKE
gcloud container clusters create vidya-setu-cluster
kubectl apply -f gke/
```

**Azure Deployment:**
```bash
# Using Azure Container Instances
az container create --resource-group vidya-setu-rg --name vidya-setu --image vidya-setu:latest

# Using AKS
az aks create --resource-group vidya-setu-rg --name vidya-setu-cluster
kubectl apply -f aks/
```

### 📈 Monitoring and Logging

#### Application Monitoring
- Health check endpoints: `/health` and `/ai/health`
- Performance metrics collection
- Error tracking and alerting
- User activity monitoring

#### Database Monitoring
- MongoDB performance metrics
- Query optimization
- Index usage analysis
- Connection pool monitoring

#### AI Service Monitoring
- Recommendation accuracy metrics
- Response time tracking
- Error rate monitoring
- Resource usage optimization

### 🧪 Testing

#### Running Tests
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

#### Test Coverage
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for user flows
- Performance testing for AI service
- Security testing for authentication

### 📚 Documentation

- API Documentation: Available at `/api/docs` (Swagger UI)
- Component Documentation: JSDoc comments in source code
- Deployment Guides: See `/docs/deployment/`
- API Reference: See `/docs/api/`

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments

- Smart India Hackathon 2025
- PM Internship Scheme (PMISP)
- Digital India Initiative
- All contributors and team members

### 📞 Support

For support and queries:
- Email: support@vidya-setu.gov.in
- Documentation: [Project Wiki](wiki-link)
- Issues: [GitHub Issues](issues-link)

---

**Built with ❤️ for India's Future Talent**