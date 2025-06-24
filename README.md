# WebPrint - Network Printer Program Backend

This project implements the backend for a network printer program according to the PRD Phase 1 requirements. The backend provides REST APIs for managing network printers on Windows systems.

## 🎯 Phase 1 Implementation Status

### ✅ 1.1 Project Initialization and Basic Environment Setup
- [x] Spring Boot 3.5.3 with Maven configuration
- [x] Basic application.properties configuration (port 8080)
- [x] SLF4J + Logback logging integration
- [x] Springdoc OpenAPI (Swagger UI) integration
- [x] Basic package structure (Controller, Service, DTO)
- [x] Health check endpoint via Spring Boot Actuator
- [x] Proper error handling with standardized error codes

### ✅ 1.2 Retrieve Local Printer List
- [x] API Endpoint: `GET /api/print/printers`
- [x] PrinterController with getPrinters() method
- [x] PrinterService with printer discovery logic
- [x] Uses `java.awt.print.PrinterJob.lookupPrintServices()` for printer detection
- [x] Proper DTO encapsulation (PrinterDto)
- [x] Error handling with 500 status and error code 5000

## 🏗️ Project Structure

```
src/main/java/com/sanshi/webprint/
├── WebPrintApplication.java          # Main Spring Boot application
├── controller/
│   └── PrinterController.java        # REST API controller
├── service/
│   └── PrinterService.java          # Business logic for printer operations
└── dto/
    ├── PrinterDto.java               # Printer data transfer object
    └── ErrorResponseDto.java         # Standardized error response
```

## 🚀 Getting Started

### Prerequisites
- **Java**: OpenJDK 17 or Oracle JDK 17+
- **Operating System**: Windows 10/11 (64-bit)
- **Maven**: 3.6+ (or use included Maven wrapper)
- **Printer Drivers**: HP LaserJet M1005 or other target printers properly installed

### Installation & Running

1. **Clone and navigate to the project:**
   ```bash
   cd webPrint
   ```

2. **Build the project:**
   ```bash
   ./mvnw clean compile
   # or if Maven is installed globally:
   mvn clean compile
   ```

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   # or
   mvn spring-boot:run
   ```

4. **Verify the application is running:**
   - Health Check: http://localhost:8080/actuator/health
   - Swagger UI: http://localhost:8080/swagger-ui.html

## 📡 API Documentation

### Get Available Printers
- **Endpoint**: `GET /api/print/printers` 
- **Description**: Retrieve all printers installed on the Windows host
- **Response Format**:
  ```json
  [
    {
      "id": "HP LaserJet M1005",
      "name": "HP LaserJet M1005", 
      "status": "Ready"
    }
  ]
  ```
- **Error Response** (500):
  ```json
  {
    "code": 5000,
    "message": "Failed to retrieve printer list",
    "timestamp": "2024-01-01T12:00:00"
  }
  ```

### Health Check
- **Endpoint**: `GET /actuator/health`
- **Description**: Application health status
- **Response**: `{"status":"UP"}`

## 🔧 Configuration

Key configuration in `application.properties`:

```properties
# Server Configuration
server.port=8080

# Logging Configuration  
logging.level.com.sanshi.webprint=INFO
logging.file.name=logs/webprint.log

# API Documentation
springdoc.swagger-ui.path=/swagger-ui.html
```

## 🖨️ Printer Detection Logic

The application uses Java's built-in printing capabilities:
- `PrinterJob.lookupPrintServices()` to discover available print services
- Each printer is wrapped in a `PrinterDto` with id, name, and status
- Status is uniformly set to "Ready" for MVP (as per PRD requirements)
- Comprehensive error handling for printer discovery failures

## 🧪 Testing

### Manual Testing with curl:
```bash
# Get all printers
curl -X GET http://localhost:8080/api/print/printers

# Health check
curl -X GET http://localhost:8080/actuator/health
```

### Using Swagger UI:
1. Open http://localhost:8080/swagger-ui.html
2. Expand "Printer Management" section
3. Test the `/api/print/printers` endpoint

## 📋 Acceptance Criteria Verification

### 1.1 Project Setup:
- ✅ Project starts without errors
- ✅ Swagger UI accessible at http://localhost:8080/swagger-ui.html
- ✅ Log files generated in `logs/webprint.log`
- ✅ Health endpoint returns 200 OK

### 1.2 Printer List API:
- ✅ GET /api/print/printers returns JSON array
- ✅ Each printer has correct structure (id, name, status)
- ✅ Includes all Windows-installed printers (including HP LaserJet M1005)
- ✅ Returns 500 with error code 5000 on failures

## 🔒 Network Configuration

Ensure the following for proper operation:
- Windows Firewall allows traffic on port 8080
- Printer drivers are properly installed and accessible
- Local printing works before testing the API

## 📝 Logging

The application logs to both console and file:
- **Console**: Formatted for development
- **File**: `logs/webprint.log` with detailed information
- **Levels**: INFO for application flow, ERROR for exceptions

## 🚧 Future Enhancements (Phase 2+)

- File upload functionality  
- Advanced printer status detection
- Print job management
- Queue monitoring
- Enhanced error handling and retry mechanisms

## 🤝 Contributing

This project follows the PRD development plan with linear task progression. Each phase builds upon the previous one to ensure stable, testable functionality. 