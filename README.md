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

### ✅ 3.1 Print Task Scheduler
- [x] Background scheduled service using @Scheduled annotation
- [x] Concurrency control with AtomicBoolean to prevent parallel processing
- [x] FIFO task processing with status updates (PENDING → PROCESSING → PRINTING → COMPLETED/FAILED)
- [x] Automatic file cleanup after task completion
- [x] Robust error handling preventing scheduler crashes
- [x] Real-time queue monitoring and statistics

### ✅ 3.2 PDF File Printing Logic
- [x] PdfPrintService using Apache PDFBox for PDF processing
- [x] Complete print parameter mapping (copies, paper size, duplex, color mode)
- [x] PrinterJob integration with PrintRequestAttributeSet
- [x] Paper size support (A4, Letter, A3, Legal)
- [x] Status tracking throughout print process
- [x] Printer capability validation
- [x] Temporary file cleanup after printing

### ✅ 4.1 Print Task Status Query Interface
- [x] Alternative endpoint: `GET /api/print/status/{taskId}` as per PRD specification
- [x] Enhanced detailed endpoint: `GET /api/print/task/{taskId}/status`
- [x] Comprehensive task information including progress calculation
- [x] Standardized error responses for task not found (404)
- [x] Input validation with proper exception handling

### ✅ 4.2 Error Code Integration and Enhancement
- [x] Global exception handler using @ControllerAdvice
- [x] Complete error code mapping (1000, 2001-2003, 3001-3006, 4001, 5000)
- [x] Consistent HTTP status code mapping
- [x] Custom exceptions (PrintTaskException, TaskNotFoundException)
- [x] Detailed error logging for failed tasks
- [x] User-friendly error messages for frontend display

### ✅ 4.3 Code Optimization and Documentation
- [x] Comprehensive Javadoc documentation for all classes and methods
- [x] Code cleanup and removal of redundant code
- [x] Enhanced Swagger/OpenAPI documentation
- [x] Consistent coding standards and best practices
- [x] Improved error handling throughout the application

## 🏗️ Project Structure

```
src/main/java/com/sanshi/webprint/
├── WebPrintApplication.java          # Main Spring Boot application
├── controller/
│   └── PrinterController.java        # REST API controller for printer and upload operations
├── service/
│   ├── PrinterService.java          # Business logic for printer operations
│   ├── FileService.java             # File upload, validation, and storage operations
│   ├── PrintQueueService.java       # Print task queue management
│   ├── PrintTaskScheduler.java      # Scheduled print task processing
│   └── PdfPrintService.java         # PDF printing using Apache PDFBox
├── entity/
│   └── PrintTask.java               # Print task entity with status tracking
├── exception/
│   ├── GlobalExceptionHandler.java  # Centralized exception handling
│   ├── PrintTaskException.java      # Custom print task exceptions
│   └── TaskNotFoundException.java   # Task not found exception
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

### Get Print Queue Status
- **Endpoint**: `GET /api/print/queue/status`
- **Description**: Get current print queue status and statistics
- **Response Format**:
  ```json
  {
    "timestamp": "2024-01-01T12:00:00",
    "queueSize": 3,
    "queueStats": "Queue Stats - Total: 5, Pending: 1, Processing: 1, Completed: 2, Failed: 1",
    "schedulerStatus": "Print Task Scheduler - Processing: YES, Queue: ...",
    "isProcessing": true
  }
  ```

### Get Print Task Status (Alternative Endpoint)
- **Endpoint**: `GET /api/print/status/{taskId}` 
- **Description**: Get the status of a specific print task (PRD 4.1 specification)
- **Response Format**:
  ```json
  {
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "message": null,
    "progress": 100,
    "fileType": "PDF",
    "printerId": "HP LaserJet M1005",
    "copies": 2,
    "paperSize": "A4",
    "duplex": "simplex",
    "colorMode": "grayscale",
    "submitTime": "2024-01-01T12:00:00"
  }
  ```

### Get Task Status by ID (Detailed)
- **Endpoint**: `GET /api/print/task/{taskId}/status`
- **Description**: Get detailed status of a specific print task
- **Response Format**: Same as above with comprehensive task information
- **Error Response** (404):
  ```json
  {
    "code": 4001,
    "message": "Task not found: [taskId]",
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

# Get print queue status
curl -X GET http://localhost:8080/api/print/queue/status

# Get task status by ID (PRD 4.1 alternative endpoint)
curl -X GET http://localhost:8080/api/print/status/550e8400-e29b-41d4-a716-446655440000

# Get detailed task status by ID
curl -X GET http://localhost:8080/api/print/task/550e8400-e29b-41d4-a716-446655440000/status

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

### 3.1 Print Task Scheduler:
- ✅ Background scheduler runs every 2 seconds checking for tasks
- ✅ Concurrency control prevents parallel task processing
- ✅ Status updates: PENDING → PROCESSING → PRINTING → COMPLETED/FAILED
- ✅ Automatic cleanup of completed/failed tasks and temporary files
- ✅ Robust error handling prevents scheduler crashes

### 3.2 PDF File Printing:
- ✅ Apache PDFBox integration for PDF processing
- ✅ Complete print parameter mapping (copies, paper size, duplex, color)
- ✅ Printer capability validation before printing
- ✅ Paper size support (A4, Letter, A3, Legal)
- ✅ Real-time status tracking during print process
- ✅ Temporary file cleanup after completion

## 📊 Error Code Reference

The application uses standardized error codes for consistent error handling:

| Error Code | HTTP Status | Meaning | Description |
|:--------:|:----------:|:------:|:-----------|
| **1000** | 200 OK | Success | Request processed successfully |
| **2001** | 400 Bad Request | Unsupported File Format | File is not PDF/DOC/DOCX |
| **2002** | 413 Payload Too Large | File Too Large | File exceeds 50MB limit |
| **2003** | 500 Internal Server Error | File Upload Failed | File operation error |
| **3001** | 404 Not Found | Printer Not Found | Printer unavailable |
| **3002** | 503 Service Unavailable | Printer Offline | Printer not responding |
| **3003** | 500 Internal Server Error | Print Task Failed | Printing operation failed |
| **3004** | 503 Service Unavailable | Paper/Jam Error | Paper issues detected |
| **3005** | 503 Service Unavailable | Supply Issues | Low ink/toner |
| **3006** | 400 Bad Request | Task Canceled | Print job canceled |
| **4001** | 400 Bad Request | Invalid Parameters | Missing/invalid request data |
| **5000** | 500 Internal Server Error | Internal Error | Unknown system error |

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

## 🔄 Print Task Lifecycle

The print task processing follows this workflow:

1. **File Upload**: User uploads file via `/api/print/upload`
2. **Task Creation**: System creates PrintTask with PENDING status
3. **Queue Entry**: Task enters FIFO queue managed by PrintQueueService
4. **Scheduler Processing**: PrintTaskScheduler picks up PENDING tasks every 2 seconds
5. **Status Updates**: 
   - PENDING → PROCESSING (when picked up by scheduler)
   - PROCESSING → PRINTING (when sent to printer)
   - PRINTING → COMPLETED (successful print) or FAILED (print error)
6. **Cleanup**: Temporary files deleted after COMPLETED/FAILED status
7. **Monitoring**: Real-time status available via `/api/print/task/{taskId}/status`

## 🖨️ Supported Print Features

### **Paper Sizes:**
- A4 (210 × 297 mm)
- Letter (8.5 × 11 inches)
- A3 (297 × 420 mm)
- Legal (8.5 × 14 inches)

### **Print Modes:**
- **Duplex**: Simplex (single-sided) or Duplex (double-sided)
- **Color**: Color or Monochrome/Grayscale
- **Copies**: 1-999 copies per job
- **Quality**: Normal print quality

### **File Types:**
- **PDF**: Full support with Apache PDFBox
- **Word Documents**: .doc/.docx (planned - not yet implemented)

## 🚧 Future Enhancements (Phase 4+)

- Word document printing implementation
- Advanced printer status detection (online/offline/paper jam)
- Print job retry mechanisms
- Print queue prioritization
- Email notifications for print completion
- Print history and analytics
- Multi-user print quotas

## 🤝 Contributing

This project follows the PRD development plan with linear task progression. Each phase builds upon the previous one to ensure stable, testable functionality. 