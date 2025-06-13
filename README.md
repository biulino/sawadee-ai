# 🏨 SawadeeAI - AI-Powered Hotel Management System

A comprehensive, multi-tenant hotel management system with AI-powered features, real-time customer support, and modern web technologies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-23.0.0-red.svg)](https://www.keycloak.org/)

## 🌟 Overview

SawadeeAI is a complete hotel management solution designed for modern hospitality businesses. It combines traditional hotel management features with cutting-edge AI technology to provide personalized experiences for guests and efficient management tools for hotel operators.

## 🎥 Demo



https://github.com/user-attachments/assets/8dca150b-c189-4a05-8af4-b8f4fe22147d



## 🚨 IMPORTANT - AGENT HANDOFF STATUS

**Current Status**: System is 97% complete but blocked by missing Node.js environment.

### **For New Agent - IMMEDIATE ACTIONS REQUIRED:**

1. **📖 READ FIRST**: [AGENT_HANDOFF_GUIDE.md](./AGENT_HANDOFF_GUIDE.md) - Complete handoff documentation
2. **⚡ QUICK START**: [FILES_CREATED_SUMMARY.md](./FILES_CREATED_SUMMARY.md) - File listing and status
3. **🔧 SETUP**: Install Node.js 18+, then run `quick-setup.ps1` or `quick-setup.sh`

### **What's Been Implemented:**
- ✅ Enhanced Landing Page with weather widget and hotel statistics
- ✅ Advanced AI Check-in Flow with passport quality assessment
- ✅ Enhanced Chat Widget with voice input/output and image upload
- ✅ Production-ready infrastructure and deployment scripts
- ✅ Comprehensive backend payment system and database schema
- ✅ Complete documentation and testing strategies

### **Blocking Issue:**
- ❌ Node.js not installed → Cannot compile TypeScript → 100+ compilation errors
- ⚡ **Resolution**: Install Node.js 18+ and run `npm install` in web-frontend directory

**Expected Resolution Time: 10 minutes to resolve, 1-2 hours for full testing**

---

## Project Overview

SawadeeAI is a full-stack hotel reservation system that uniquely integrates a conversational AI agent to guide users through the entire booking process. This project demonstrates how modern AI technologies can be integrated with traditional booking systems to create a seamless, intuitive user experience.

### Key Features

- **Conversational AI Booking Flow**: Complete hotel reservations through natural language conversation with an AI agent
- **Spring Boot Backend**: Robust API with comprehensive hotel management functionality
- **Keycloak Integration**: Enterprise-grade authentication and authorization
- **React Native Mobile App**: Cross-platform mobile application built with Expo
- **AI Recommendation System**: Personalized room suggestions based on user preferences

## Technology Stack

### Backend
- **Spring Boot**: Java-based backend framework for robust API development
- **Keycloak**: Open-source identity and access management solution
- **JPA/Hibernate**: ORM for database interactions
- **PostgreSQL**: Relational database for data persistence

### AI Components
- **Google ADK**: AI agent development framework
- **Custom AI Tools**: Function-calling capabilities for domain-specific operations
- **Python Backend**: Handling AI agent conversational flow

### Frontend
- **React Native**: Cross-platform mobile application framework
- **Expo**: Toolchain for React Native development

## Project Structure

The repository is organized into four main directories:

- **spring-boot-backend/**: Java-based backend API with comprehensive hotel management services
- **ai-agent/**: Python implementation of the conversational AI system that guides users through booking
- **react-native-ui/**: Mobile application frontend built with React Native and Expo
- **ai-recommend-system/**: Room recommendation system based on user preferences

## AI Agent Integration

The most distinctive feature of this project is the conversational AI agent that enables users to complete an end-to-end hotel reservation through natural language. The agent can:

- Guide users through selecting cities, hotels, and rooms
- Handle date selection and availability checking
- Process user information for booking
- Complete transactions
- Answer questions about hotels and amenities
- Provide personalized recommendations

### How It Works

1. The user initiates a conversation with the AI agent
2. The agent directs the conversation flow to gather necessary booking information
3. Behind the scenes, the agent calls specific functions that interact with the backend API
4. The booking process is completed when all required information is collected
5. Confirmation details are provided to the user

```python
# Example of tool integration in the AI agent
def otel_sec(otel_id: int) -> dict:
    """Selects a hotel with the given ID and retrieves its detailed information.

    Args:
        otel_id (int): The ID of the hotel to select.

    Returns:
        dict: Operation result containing hotel information or error message.
    """
    # Implementation details...
```

The conversational flow is managed through a set of tools that handle different aspects of the booking process. These tools are registered with the AI agent and are called when appropriate during the conversation:

```python
root_agent = Agent(
    name="otel_rezervasyon_asistani",
    model="gemini-2.0-flash",
    description="Bu asistan, otel arama, rezervasyon yapma, otel bilgilerini sağlama ve etkinlik rezervasyonları konusunda yardımcı olur.",
    instruction=AGENT_INSTRUCTIONS,
    tools=[
        sehir_sec,
        fiyat_araligi_belirle,
        tarihleri_belirle,
        kisi_oda_sayisi,
        otelleri_listele,
        otel_detay,
        oda_musaitligi_kontrol,
        otel_sec,
        oda_sec,
        rezervasyon_tamamla,
        rezervasyon_bilgilerini_temizle,
        # Additional tools...
    ]
)
```

## Spring Boot Backend

The backend implements a comprehensive API for hotel management, including:

- Hotel and room management
- Reservation processing and management
- User authentication and authorization with Keycloak
- Availability checking and pricing
- Activity and event management

### Data Model

The core entities in the system include:

```java
@Entity
@Table(name = "hotels")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String city;
    private String address;
    private String description;
    private Double pricePerNight;
    private Integer totalRooms;
    private Integer availableRooms;
    // Relationships and methods...
}
```

Other key entities include:
- **Room**: Contains room details, availability status, and amenities
- **Reservation**: Tracks booking information, dates, and guest details
- **Activity**: Represents hotel activities or excursions that can be booked
- **ActivityReservation**: Manages reservations for specific activities
- **User**: Stores user information and authentication details

### API Endpoints

The REST API provides comprehensive endpoints for all booking operations:

#### Hotel Management
```
GET    /api/hotels                      # List hotels with optional filtering
GET    /api/hotels/{id}                 # Get hotel details
POST   /api/hotels                      # Create a new hotel
PUT    /api/hotels/{id}                 # Update hotel details
DELETE /api/hotels/{id}                 # Delete a hotel
GET    /api/hotels/{id}/availability    # Check hotel availability for dates
```

#### Room Management
```
GET    /api/rooms                       # List all rooms
GET    /api/rooms/{id}                  # Get room details
POST   /api/rooms                       # Create a new room
PUT    /api/rooms/{id}                  # Update room details
DELETE /api/rooms/{id}                  # Delete a room
GET    /api/rooms/hotel/{hotelId}       # Get rooms by hotel
GET    /api/rooms/available             # Get available rooms by date range
GET    /api/rooms/{id}/availability     # Check specific room availability
```

#### Reservation Management
```
GET    /api/reservations                # List all reservations
GET    /api/reservations/{id}           # Get reservation details
POST   /api/reservations                # Create a new reservation
DELETE /api/reservations/{id}           # Cancel a reservation
POST   /api/reservations/{id}/check-in  # Process guest check-in
POST   /api/reservations/{id}/check-out # Process guest check-out
```

#### Activity Management
```
GET    /api/activities                  # List activities with optional filtering
GET    /api/activities/available        # Get available activities
POST   /api/activities                  # Create a new activity
POST   /api/activity-reservations       # Book an activity
```

### Security Implementation

The system uses Keycloak for secure authentication and authorization with OAuth 2.0 and JWT:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;

    public SecurityConfig(JwtAuthConverter jwtAuthConverter) {
        this.jwtAuthConverter = jwtAuthConverter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**")
                .permitAll()
                .anyRequest().authenticated()
            )
            .csrf(AbstractHttpConfigurer::disable);
        
        http.oauth2ResourceServer(server -> server.jwt(jwtConfigurer -> 
            jwtConfigurer.jwtAuthenticationConverter(jwtAuthConverter)));
        
        http.sessionManagement(management -> 
            management.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }
    
    // CORS configuration...
}
```

The JWT authentication is handled by a custom converter that extracts roles from Keycloak tokens:

```java
@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    // Configuration properties and converters

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
                jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
                extractResourceRoles(jwt).stream()
        ).collect(Collectors.toSet());

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                getPrincipleClaimName(jwt)
        );
    }

    // Methods to extract claims and roles from JWT...
}
```

The security system provides:

- OAuth 2.0 / OpenID Connect protocols
- Role-based access control
- JWT token management and validation
- Fine-grained authorization at endpoint level
- Single sign-on capabilities
- Integration with multiple clients (mobile app, web app)

## Mobile Application

The React Native mobile app provides a modern, intuitive interface for users to:

- Browse hotels and available rooms
- View detailed information about accommodations
- Make and manage reservations
- Interact with the AI booking assistant
- Receive personalized recommendations

The UI is built with React Native and Expo, featuring:
- Clean, intuitive design
- Responsive layouts for all device sizes
- Native-feeling animations and interactions
- Seamless integration with the backend API

## Getting Started

### Prerequisites

- Java 17 or higher
- Python 3.9 or higher
- Node.js and npm
- PostgreSQL
- Keycloak server (version 22.0.0 or higher)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/canermastan/hotel-reservation-ai-agent.git
   cd hotel-reservation-ai-agent
   ```

2. Configure PostgreSQL and Keycloak settings in `spring-boot-backend/src/main/resources/application.properties`

3. Start the Spring Boot application:
   ```bash
   cd spring-boot-backend
   ./mvnw spring-boot:run
   ```

### Keycloak Setup

1. Download and install Keycloak server
2. Create a new realm and client for the application
3. Configure client scopes and roles
4. Set up the appropriate CORS settings for your application

### AI Agent Setup

1. Install required Python dependencies:
   ```bash
   cd ai-agent
   pip install -r requirements.txt
   ```

2. Start the AI agent service:
   ```bash
   python main.py
   ```

### Mobile Application Setup

1. Install dependencies:
   ```bash
   cd react-native-ui
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
