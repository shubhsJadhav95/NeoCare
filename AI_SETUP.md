# NeoCare AI Chatbot with Authentication Setup Guide

This guide explains how to set up and run the complete NeoCare system with authentication, service discovery, and AI chatbot functionality.

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Auth Service   │    │  AI Service     │    │     Ollama      │
│   (Port 5173)   │───▶│  (Port 8082)    │───▶│  (Port 8081)    │───▶│   (Port 11434)  │
│                 │    │  JWT + Eureka   │    │  JWT + Eureka   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │                        │
         │                        │                        │                        │
         ▼                        ▼                        ▼                        ▼
  User Interface           Authentication          AI Processing          AI Model
  (Login/Register)        (JWT Tokens)          (Secure API)        (MedExpert Model)
```

## 🔧 **Prerequisites**

1. **Java 17+** - Required for Spring Boot services
2. **Ollama** - Local AI model server
3. **Node.js 18+** - For the React frontend
4. **Maven** - For building Spring Boot applications
5. **PostgreSQL** - For user data storage

## 📦 **Installation Steps**

### **1. Database Setup**
```bash
# Install PostgreSQL and create databases
createdb NeoCare        # For auth service
createdb neocare_ai_service  # For AI service (optional)

# Set up database credentials in application.properties files
```

### **2. Install and Setup Ollama**
```bash
# Install Ollama
# Windows: choco install ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Pull the MedExpert model
ollama pull OussamaELALLAM/MedExpert

# Start Ollama service
ollama serve
```

### **3. Setup Service Discovery (Eureka Server)**
```bash
cd service-registry/service-registry
./mvnw spring-boot:run
# or: mvnw.cmd spring-boot:run (Windows)
```
**Port:** 8761
**URL:** http://localhost:8761

### **4. Setup Authentication Service**
```bash
cd auth-service/auth-service
./mvnw spring-boot:run
```
**Port:** 8082
**Features:** User registration, login, JWT token generation
**API:** http://localhost:8082/auth/login, /auth/register

### **5. Setup AI Service**
```bash
cd ai-services/ai-services
./mvnw spring-boot:run
```
**Port:** 8081
**Features:** Secure AI chat with authentication
**API:** http://localhost:8081/api/chat/message (requires JWT token)

### **6. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```
**Port:** 5173
**Features:** Login/register, authenticated chatbot access

## 🔐 **Authentication Flow**

1. **User Registration/Login** via Auth Service (Port 8082)
2. **JWT Token Generation** by Auth Service
3. **Token Storage** in browser localStorage
4. **Token Validation** by AI Service for chat access
5. **Secure Communication** between all services via JWT

## 🚀 **API Endpoints**

### **Auth Service (Port 8082)**
- **POST** `/auth/login` - User login (returns JWT token)
- **POST** `/auth/register` - User registration
- **GET** `/auth/test` - Health check

### **AI Service (Port 8081)**
- **POST** `/api/chat/message` - Send message (requires Bearer token)
- **GET** `/api/chat/health` - Health check
- **GET** `/eureka/**` - Service discovery endpoints

### **Frontend (Port 5173)**
- **GET** `/login` - Login page
- **GET** `/register` - Registration page
- **GET** `/user/chatbotdoctorassistant` - AI Chatbot (requires authentication)

## 🔑 **JWT Token Usage**

### **Frontend Integration**
```javascript
// Send JWT token with AI service requests
const token = localStorage.getItem('token');
const response = await axios.post('http://localhost:8081/api/chat/message', {
  message: userMessage
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### **Token Validation**
- **Auth Service** generates tokens on login
- **AI Service** validates tokens on chat requests
- **Frontend** handles token expiration and redirects to login

## 🛠️ **Configuration Files**

### **Service Discovery (Eureka)**
```properties
# service-registry/src/main/resources/application.properties
server.port=8761
eureka.instance.host=localhost
eureka.client.fetch-registry=false
eureka.client.register-with-eureka=false
```

### **Auth Service Configuration**
```properties
# auth-service/src/main/resources/application.properties
spring.application.name=auth-service
server.port=8082

# Eureka Registration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true

# JWT Configuration
jwt.secret=mySecretKeyForJWTTokenGenerationAndValidation2024
jwt.expiration=86400000

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/NeoCare
```

### **AI Service Configuration**
```properties
# ai-services/src/main/resources/application.properties
spring.application.name=ai-services
server.port=8081

# Eureka Registration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true

# Ollama Configuration
spring.ai.ollama.chat.base-url=http://localhost:11434
spring.ai.ollama.chat.model=OussamaELALLAM/MedExpert

# JWT Validation (same secret as auth service)
jwt.secret=mySecretKeyForJWTTokenGenerationAndValidation2024
jwt.expiration=86400000
```

## 🧪 **Testing the Integration**

### **1. Check Service Registration**
```bash
# Visit Eureka dashboard
http://localhost:8761

# Should show:
# - AUTH-SERVICE (Port 8082)
# - AI-SERVICES (Port 8081)
```

### **2. Test Authentication**
```bash
# Register a new user
curl -X POST http://localhost:8082/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'

# Login to get JWT token
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **3. Test AI Chat with Authentication**
```bash
# Use the JWT token from login response
curl -X POST http://localhost:8081/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "What are the symptoms of flu?"}'
```

### **4. Test Frontend**
1. **Start frontend:** `npm run dev`
2. **Visit:** http://localhost:5173
3. **Register/Login** through the UI
4. **Access chatbot:** http://localhost:5173/user/chatbotdoctorassistant
5. **Chat messages** should work with authentication

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Eureka Registration Failed**
   - Ensure Eureka server is running on port 8761
   - Check service URLs in application.properties
   - Verify Java version compatibility

2. **JWT Token Validation Failed**
   - Ensure same JWT secret in both services
   - Check token expiration settings
   - Verify token format in requests

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure databases are created

4. **Frontend Authentication**
   - Check browser console for errors
   - Verify token storage in localStorage
   - Test API calls with proper Authorization headers

5. **Ollama Connection**
   - Ensure Ollama is running: `ollama serve`
   - Verify model installation: `ollama list`
   - Check Ollama service URL configuration

### **Service Health Checks**
```bash
# Eureka Server
curl http://localhost:8761

# Auth Service
curl http://localhost:8082/auth/test

# AI Service
curl http://localhost:8081/api/chat/health

# Ollama
ollama list
```

## 🎯 **Features Implemented**

✅ **Service Discovery** - Eureka server for service registration
✅ **User Authentication** - JWT-based login/registration
✅ **Secure AI Chat** - Token validation for AI service access
✅ **Multi-Role Support** - Patient, Doctor, Lab Assistant, Pharmacy roles
✅ **Frontend Integration** - Complete authentication flow in React
✅ **Error Handling** - Proper error responses and user feedback
✅ **CORS Configuration** - Cross-origin requests between services

## 🔐 **Security Features**

- **JWT Token Authentication** with expiration
- **Password Encryption** using BCrypt
- **Role-based Access Control** (RBAC)
- **Secure API Endpoints** with authentication requirements
- **CORS Protection** for cross-origin requests
- **Session Management** via stateless JWT tokens

## 🚀 **Next Steps**

1. **Enhanced User Management**
   - User profile management
   - Password reset functionality
   - Email verification

2. **Advanced AI Features**
   - Chat history persistence
   - User-specific AI training
   - Medical record integration

3. **Service Monitoring**
   - Health check endpoints
   - Metrics collection
   - Logging and tracing

4. **Scalability**
   - Load balancing
   - Database clustering
   - Service mesh implementation

## 📞 **Support**

If you encounter issues:
1. Check service logs for error messages
2. Verify all services are running on correct ports
3. Test individual services before full integration
4. Check browser developer tools for frontend errors
5. Review JWT token format and expiration

The complete system now supports authenticated AI chatbot access with proper service discovery and security! 🎉
