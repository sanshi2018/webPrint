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

### ✅ 2.1 File Upload Interface Implementation
- [x] API Endpoint: `POST /api/print/upload`
- [x] MultipartFile handling with print parameters
- [x] File storage in `temp/print_files` directory with UUID naming
- [x] File format validation (.pdf, .doc, .docx)
- [x] File size validation (50MB maximum)  
- [x] Error handling with specific error codes (2001, 2002, 2003)
- [x] FileService for comprehensive file operations

### ✅ 2.2 Print Task Queue Design and Enqueue
- [x] PrintTask entity with complete task data structure
- [x] ConcurrentLinkedQueue for thread-safe FIFO queue
- [x] PrintQueueService for queue management
- [x] Task enqueue logic after successful file upload
- [x] Success response with error code 1000 and taskId
- [x] Comprehensive queue statistics and monitoring

## 🏗️ Project Structure

```
src/main/java/com/sanshi/webprint/
├── WebPrintApplication.java          # Main Spring Boot application
├── controller/
│   └── PrinterController.java        # REST API controller for printer and upload operations
├── service/
│   ├── PrinterService.java          # Business logic for printer operations
│   ├── FileService.java             # File upload, validation, and storage operations
│   └── PrintQueueService.java       # Print task queue management
├── entity/
│   └── PrintTask.java               # Print task entity with status tracking
└── dto/
    ├── PrinterDto.java               # Printer data transfer object
    ├── PrintRequestDto.java          # Print request parameters
    ├── UploadResponseDto.java        # Upload success response
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

### Upload File and Create Print Task
- **Endpoint**: `POST /api/print/upload`
- **Description**: Upload a file and create a print task in the queue
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): File to upload (.pdf, .doc, .docx, max 50MB)
  - `printerId` (required): Target printer ID
  - `copies` (optional): Number of copies (default: 1)
  - `paperSize` (optional): Paper size (default: A4)
  - `duplex` (optional): Duplex mode - simplex/duplex (default: simplex)
  - `colorMode` (optional): Color mode - color/grayscale (default: grayscale)
- **Success Response** (200):
  ```json
  {
    "code": 1000,
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "File uploaded and print task created successfully",
    "timestamp": "2024-01-01T12:00:00"
  }
  ```
- **Error Responses**:
  - **400 Bad Request** (Invalid file format):
    ```json
    {
      "code": 2001,
      "message": "Unsupported file format. Only PDF, DOC, and DOCX files are allowed.",
      "timestamp": "2024-01-01T12:00:00"
    }
    ```
  - **413 Payload Too Large** (File size exceeded):
    ```json
    {
      "code": 2002,
      "message": "File size exceeds the maximum limit of 50MB.",
      "timestamp": "2024-01-01T12:00:00"
    }
    ```
  - **500 Internal Server Error** (File saving failed):
    ```json
    {
      "code": 2003,
      "message": "Failed to save file: [error details]",
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

# File Upload Configuration
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true
```

## 🖨️ Printer Detection Logic

The application uses Java's built-in printing capabilities:
- `PrinterJob.lookupPrintServices()` to discover available print services
- Each printer is wrapped in a `PrinterDto` with id, name, and status
- Status is uniformly set to "Ready" for MVP (as per PRD requirements)
- Comprehensive error handling for printer discovery failures

## 📁 File Processing Logic

The file upload and processing system includes:
- **File Validation**: Format validation (.pdf, .doc, .docx) and size limits (50MB)
- **Secure Storage**: Files saved to `temp/print_files` with UUID-based unique naming
- **Type Detection**: Automatic file type classification (PDF/WORD)
- **Error Handling**: Specific error codes for different validation failures
- **Thread Safety**: All file operations are thread-safe for concurrent access

## 📋 Print Task Queue Management

The print queue system provides:
- **FIFO Processing**: Tasks are processed in submission order using `ConcurrentLinkedQueue`
- **Task Tracking**: Each task has a unique UUID for tracking and status updates
- **Status Management**: Complete task lifecycle from PENDING to COMPLETED/FAILED
- **Thread Safety**: Concurrent access support for multi-user environments
- **Queue Statistics**: Real-time monitoring of queue size and task status distribution
- **Task Persistence**: In-memory storage with fast lookup by task ID

## 🧪 Testing

### Manual Testing with curl:
```bash
# Get all printers
curl -X GET http://localhost:8080/api/print/printers

# Upload a PDF file and create print task
curl -X POST http://localhost:8080/api/print/upload \
  -F "file=@/path/to/document.pdf" \
  -F "printerId=HP LaserJet M1005" \
  -F "copies=1" \
  -F "paperSize=A4" \
  -F "duplex=simplex" \
  -F "colorMode=grayscale"

# Health check
curl -X GET http://localhost:8080/actuator/health
```

### Using Swagger UI:
1. Open http://localhost:8080/swagger-ui.html
2. Expand "Printer Management" section
3. Test the `/api/print/printers` endpoint to get available printers
4. Test the `/api/print/upload` endpoint:
   - Select a PDF, DOC, or DOCX file
   - Choose a printer ID from the previous step
   - Adjust print parameters as needed
   - Submit to create a print task

### Using Postman:
1. **GET** `http://localhost:8080/api/print/printers` - Get printer list
2. **POST** `http://localhost:8080/api/print/upload`:
   - Set Content-Type to `multipart/form-data`
   - Add form fields:
     - `file`: Select your PDF/DOC/DOCX file
     - `printerId`: Use printer ID from step 1
     - `copies`: Number of copies (optional)
     - `paperSize`: A4, Letter, etc. (optional)
     - `duplex`: simplex or duplex (optional)
     - `colorMode`: color or grayscale (optional)

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

### 2.1 File Upload Interface:
- ✅ POST /api/print/upload accepts multipart file uploads
- ✅ Validates file formats (.pdf, .doc, .docx only)
- ✅ Validates file size (50MB maximum)
- ✅ Saves files to temp/print_files directory with UUID naming
- ✅ Returns error code 2001 for invalid file formats
- ✅ Returns error code 2002 for files exceeding size limit
- ✅ Returns error code 2003 for file saving failures

### 2.2 Print Task Queue:
- ✅ Creates PrintTask objects with complete task information
- ✅ Enqueues tasks in FIFO order using ConcurrentLinkedQueue
- ✅ Returns success code 1000 with taskId on successful upload
- ✅ Logs task creation and queue status changes
- ✅ Maintains task order and thread-safe queue operations

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