# SawadeeAI - Modern Hotel Management System

🏨 **Next-Generation Hotel Management Platform**

A cutting-edge, AI-powered hotel management system built with modern technologies for the hospitality industry.

## 🚀 Features

- **AI-Powered Assistant**: Intelligent chatbot for guest services and support
- **Multi-Tenant Architecture**: Support for multiple hotels with isolated data
- **Real-Time Operations**: Live updates for bookings, check-ins, and room status
- **Mobile-First Design**: Responsive web interface and dedicated mobile app
- **Secure Authentication**: Keycloak-based OAuth2/OIDC authentication
- **Smart Recommendations**: AI-driven activity and service suggestions
- **Payment Integration**: Secure payment processing capabilities

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.x** - Modern Java framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Keycloak** - Authentication and authorization
- **Docker** - Containerization

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Material-UI** - Component library
- **React Query** - Data fetching and caching

### Mobile
- **React Native** with Expo
- **TypeScript** support
- **Native navigation**

### AI Components
- **Python Flask** - AI agent backend
- **OpenAI GPT** integration
- **Machine Learning** recommendation engine

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Java 17+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/biulino/sawadee-ai.git
   cd sawadee-ai
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8090
   - Keycloak Admin: http://localhost:8082

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  React Native   │    │   Admin Panel   │
│   Frontend      │    │   Mobile App    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           Spring Boot API Gateway      │
         │         (Authentication & Routing)     │
         └─────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌─────────┐              ┌─────────────┐              ┌─────────────┐
│ Hotel   │              │   AI Agent  │              │ Recommend   │
│ Service │              │   Service   │              │ Service     │
└─────────┘              └─────────────┘              └─────────────┘
    │                            │                            │
    └────────────────────────────┼────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │              PostgreSQL                │
         │           (Multi-Tenant DB)            │
         └─────────────────────────────────────────┘
```

## 🔧 Development

### Backend Development
```bash
cd spring-boot-backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd web-frontend
npm install
npm start
```

### Mobile Development
```bash
cd react-native-ui
npm install
npx expo start
```

## 🐳 Docker Deployment

### Development Environment
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Environment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Authentication

The system uses Keycloak for authentication with the following setup:
- **Realm**: hotel-realm
- **Client**: hotel-client
- **Supported flows**: Authorization Code, Direct Access
- **Roles**: admin, hotel-manager, guest, staff

## 📱 API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8090/swagger-ui.html
- OpenAPI Spec: http://localhost:8090/v3/api-docs

## 🧪 Testing

### Backend Tests
```bash
cd spring-boot-backend
./mvnw test
```

### Frontend Tests
```bash
cd web-frontend
npm test
```

### Integration Tests
```bash
./scripts/run-integration-tests.sh
```

## 🚀 Deployment

### Environment Variables
Create `.env` files for each environment:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sawadee_hotel
DB_USER=postgres
DB_PASSWORD=your_password

# Keycloak
KEYCLOAK_URL=http://localhost:8082
KEYCLOAK_REALM=hotel-realm
KEYCLOAK_CLIENT_ID=hotel-client
KEYCLOAK_CLIENT_SECRET=your_secret

# AI Services
OPENAI_API_KEY=your_openai_key
AI_AGENT_URL=http://localhost:5050
RECOMMENDATION_URL=http://localhost:5001
```

### Production Deployment
```bash
./scripts/deploy-production.sh
```

## 📊 Monitoring

- **Application Logs**: Centralized logging with ELK stack
- **Metrics**: Prometheus + Grafana
- **Health Checks**: Spring Boot Actuator endpoints
- **Error Tracking**: Sentry integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow conventional commits
- Write comprehensive tests
- Update documentation
- Ensure code quality with SonarQube

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the hospitality industry
- Powered by modern open-source technologies
- Designed for scalability and performance

## 📞 Support

- **Documentation**: [Wiki](https://github.com/biulino/sawadee-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/biulino/sawadee-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/biulino/sawadee-ai/discussions)

---

**SawadeeAI** - Transforming hotel management with AI-powered solutions 🌟
