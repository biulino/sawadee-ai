# SawadeeAI Project Structure

## 📁 Directory Overview

```
sawadee-ai/
├── 📱 frontend/                  # React web application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── contexts/           # React contexts
│   │   ├── utils/              # Utility functions
│   │   └── types/              # TypeScript definitions
│   ├── public/                 # Static assets
│   ├── package.json
│   └── tailwind.config.js
│
├── 📱 mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── screens/            # Mobile screens
│   │   ├── components/         # Mobile components
│   │   ├── navigation/         # Navigation setup
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   ├── assets/                 # Mobile assets
│   ├── app.json               # Expo configuration
│   └── package.json
│
├── 🚀 backend/                   # Spring Boot backend
│   ├── src/main/java/com/sawadeeai/
│   │   ├── controllers/        # REST controllers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── entities/           # JPA entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── config/            # Configuration classes
│   │   └── security/          # Security configuration
│   ├── src/main/resources/
│   │   ├── application.yml    # Spring configuration
│   │   └── db/migration/      # Database migrations
│   ├── pom.xml               # Maven dependencies
│   └── Dockerfile
│
├── 🤖 ai-services/              # AI microservices
│   ├── chatbot/               # AI chatbot service
│   │   ├── app.py            # Flask application
│   │   ├── models/           # AI models
│   │   ├── handlers/         # Message handlers
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── recommendations/       # Recommendation engine
│       ├── app.py
│       ├── ml_models/
│       ├── data_processing/
│       ├── requirements.txt
│       └── Dockerfile
│
├── 🗄️ database/                 # Database scripts
│   ├── migrations/            # SQL migration files
│   ├── seeds/                # Sample data
│   └── schemas/              # Database schemas
│
├── 🐳 docker/                   # Docker configurations
│   ├── docker-compose.yml    # Development environment
│   ├── docker-compose.prod.yml # Production environment
│   ├── nginx/                # Nginx configuration
│   └── keycloak/             # Keycloak setup
│
├── 📜 scripts/                  # Automation scripts
│   ├── setup.sh             # Project setup
│   ├── deploy.sh            # Deployment script
│   ├── test.sh              # Test runner
│   └── backup.sh            # Database backup
│
├── 📋 docs/                     # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # System architecture
│   ├── deployment/           # Deployment guides
│   └── user-guide/           # User manuals
│
├── 🧪 tests/                    # Integration tests
│   ├── e2e/                  # End-to-end tests
│   ├── integration/          # Integration tests
│   └── performance/          # Performance tests
│
├── 📊 monitoring/               # Monitoring setup
│   ├── prometheus/           # Metrics collection
│   ├── grafana/             # Dashboards
│   └── logs/                # Log configurations
│
├── .gitignore               # Git ignore rules
├── .env.example            # Environment variables template
├── README.md               # Project documentation
├── LICENSE                 # Project license
└── CHANGELOG.md           # Version history
```

## 🔧 Technology Stack by Component

### Frontend (`frontend/`)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Router** for navigation
- **Material-UI** components
- **i18next** for internationalization

### Mobile (`mobile/`)
- **React Native** with Expo
- **TypeScript** support
- **React Navigation** v6
- **Expo modules** for native features
- **AsyncStorage** for local data

### Backend (`backend/`)
- **Spring Boot 3.x**
- **Spring Security** with JWT
- **Spring Data JPA**
- **PostgreSQL** database
- **Redis** for caching
- **Maven** build system

### AI Services (`ai-services/`)
- **Python Flask** microservices
- **OpenAI GPT** integration
- **scikit-learn** for ML
- **NumPy & Pandas** for data processing
- **Docker** containerization

### Infrastructure (`docker/`)
- **Docker Compose** orchestration
- **Nginx** reverse proxy
- **Keycloak** authentication
- **PostgreSQL** database
- **Redis** cache

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/biulino/sawadee-ai.git
   cd sawadee-ai
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**
   ```bash
   ./scripts/setup.sh
   docker-compose up -d
   ```

4. **Access applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Mobile (Expo): Scan QR code with Expo Go

## 📝 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Develop in respective directories
   - Write tests
   - Update documentation

2. **Testing**
   - Unit tests in each component
   - Integration tests in `tests/`
   - E2E tests for critical flows

3. **Deployment**
   - Staging: `./scripts/deploy.sh staging`
   - Production: `./scripts/deploy.sh production`

## 🔍 Component Details

### Frontend Architecture
- **Component-based** design
- **Custom hooks** for business logic
- **Context providers** for global state
- **Service layer** for API communication

### Backend Architecture
- **Layered architecture** (Controller → Service → Repository)
- **Multi-tenant** data isolation
- **RESTful APIs** with OpenAPI documentation
- **Event-driven** communication

### AI Services Architecture
- **Microservices** pattern
- **RESTful APIs** for communication
- **Model serving** with caching
- **Background processing** for heavy tasks

This structure promotes:
- 🔧 **Modularity**: Clear separation of concerns
- 🚀 **Scalability**: Independent component scaling
- 🧪 **Testability**: Isolated testing strategies
- 🔄 **Maintainability**: Easy to update and extend
