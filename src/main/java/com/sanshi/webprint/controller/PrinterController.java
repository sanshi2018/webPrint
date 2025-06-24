package com.sanshi.webprint.controller;

import com.sanshi.webprint.dto.ErrorResponseDto;
import com.sanshi.webprint.dto.PrinterDto;
import com.sanshi.webprint.dto.PrintRequestDto;
import com.sanshi.webprint.dto.UploadResponseDto;
import com.sanshi.webprint.service.PrinterService;
import com.sanshi.webprint.service.FileService;
import com.sanshi.webprint.service.PrintQueueService;
import com.sanshi.webprint.service.PrintTaskScheduler;
import com.sanshi.webprint.exception.TaskNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.util.List;

/**
 * REST Controller for printer and print task operations
 * 
 * This controller provides comprehensive APIs for managing printers and print tasks,
 * including printer discovery, file upload, task submission, and status monitoring.
 * All endpoints follow RESTful conventions and return standardized responses.
 * 
 * <p>Main functionality includes:</p>
 * <ul>
 *   <li>Retrieving available system printers</li>
 *   <li>Uploading files for printing with validation</li>
 *   <li>Creating and managing print tasks</li>
 *   <li>Monitoring print queue and task status</li>
 *   <li>Real-time progress tracking</li>
 * </ul>
 * 
 * <p>Error handling is centralized through {@link com.sanshi.webprint.exception.GlobalExceptionHandler}
 * ensuring consistent error codes and HTTP status responses.</p>
 * 
 * @author WebPrint Team
 * @version 1.0
 * @since 1.0
 * @see com.sanshi.webprint.service.PrinterService
 * @see com.sanshi.webprint.service.PrintQueueService
 * @see com.sanshi.webprint.service.FileService
 */
@RestController
@RequestMapping("/api/print")
@Tag(name = "Printer Management", description = "APIs for managing printers and print tasks")
public class PrinterController {
    
    private static final Logger logger = LoggerFactory.getLogger(PrinterController.class);
    
    @Autowired
    private PrinterService printerService;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private PrintQueueService printQueueService;
    
    @Autowired
    private PrintTaskScheduler printTaskScheduler;
    
    /**
     * Retrieve all available printers from the system
     * 
     * This endpoint discovers and returns all printers currently installed and available
     * on the Windows host system. It uses the Java Print Service API to enumerate
     * available print services.
     * 
     * <p>Each printer in the response includes:</p>
     * <ul>
     *   <li>id: Unique printer identifier (printer name)</li>
     *   <li>name: Human-readable printer name</li>
     *   <li>status: Current printer status (MVP: always "Ready")</li>
     * </ul>
     * 
     * @return ResponseEntity containing list of available printers or error response
     * @throws RuntimeException if printer discovery fails (handled by GlobalExceptionHandler)
     */
    @GetMapping("/printers")
    @Operation(
        summary = "Get available printers",
        description = "Retrieve a list of all available printers installed on the Windows host"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved printer list",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = PrinterDto.class))
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error - Failed to retrieve printer list",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        )
    })
    public ResponseEntity<?> getPrinters() {
        logger.info("Received request to get available printers");
        
        try {
            List<PrinterDto> printers = printerService.getAvailablePrinters();
            logger.info("Successfully returning {} printers", printers.size());
            return ResponseEntity.ok(printers);
            
        } catch (Exception e) {
            logger.error("Error retrieving printers", e);
            ErrorResponseDto errorResponse = new ErrorResponseDto(5000, "Failed to retrieve printer list");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Upload file and create print task
     * 
     * This endpoint handles file uploads and creates print tasks for processing.
     * Files are validated for format and size before being saved to temporary storage.
     * A new print task is created and added to the processing queue.
     * 
     * <p>Supported file formats:</p>
     * <ul>
     *   <li>PDF (.pdf) - Full support via Apache PDFBox</li>
     *   <li>Word Documents (.doc, .docx) - Planned support</li>
     * </ul>
     * 
     * <p>File validation includes:</p>
     * <ul>
     *   <li>Format validation (extension-based)</li>
     *   <li>Size validation (50MB maximum)</li>
     *   <li>Content validation (basic file integrity)</li>
     * </ul>
     * 
     * <p>Print parameters are validated and defaults are applied:</p>
     * <ul>
     *   <li>copies: 1-999 (default: 1)</li>
     *   <li>paperSize: A4, Letter, A3, Legal (default: A4)</li>
     *   <li>duplex: simplex, duplex (default: simplex)</li>
     *   <li>colorMode: color, grayscale (default: grayscale)</li>
     * </ul>
     * 
     * @param file The multipart file to upload and print (required)
     * @param printerId Target printer ID from available printers (required)
     * @param copies Number of copies to print (optional, default: 1)
     * @param paperSize Paper size for printing (optional, default: A4)
     * @param duplex Duplex printing mode (optional, default: simplex)
     * @param colorMode Color printing mode (optional, default: grayscale)
     * @return ResponseEntity with success response containing taskId or error response
     * @throws IllegalArgumentException if parameters are invalid (handled by GlobalExceptionHandler)
     * @throws IOException if file operations fail (handled by GlobalExceptionHandler)
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload file and create print task",
        description = "Upload a file (PDF, DOC, DOCX) and create a print task in the queue"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "File uploaded successfully and print task created",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UploadResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request - Invalid file format",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "413",
            description = "Payload too large - File size exceeds limit",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error - File saving failed",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        )
    })
    public ResponseEntity<?> uploadFileAndPrint(
        @Parameter(description = "File to upload (PDF, DOC, DOCX)", required = true)
        @RequestParam("file") MultipartFile file,
        @Parameter(description = "Target printer ID", required = true)
        @RequestParam("printerId") String printerId,
        @Parameter(description = "Number of copies", example = "1")
        @RequestParam(value = "copies", defaultValue = "1") Integer copies,
        @Parameter(description = "Paper size", example = "A4")
        @RequestParam(value = "paperSize", defaultValue = "A4") String paperSize,
        @Parameter(description = "Duplex mode", example = "simplex")
        @RequestParam(value = "duplex", defaultValue = "simplex") String duplex,
        @Parameter(description = "Color mode", example = "grayscale")
        @RequestParam(value = "colorMode", defaultValue = "grayscale") String colorMode
    ) throws IOException {
        logger.info("Received file upload request: file={}, printer={}, copies={}", 
                   file.getOriginalFilename(), printerId, copies);
        
        // Validate input parameters
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }
        if (printerId == null || printerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Printer ID cannot be null or empty");
        }
        if (copies != null && (copies < 1 || copies > 999)) {
            throw new IllegalArgumentException("Number of copies must be between 1 and 999");
        }
        
        // Validate file format and size
        String validationError = fileService.validateFile(file);
        if (validationError != null) {
            logger.warn("File validation failed: {}", validationError);
            if (validationError.contains("format")) {
                throw new IllegalArgumentException("Unsupported file format. Only PDF, DOC, and DOCX files are allowed.");
            } else if (validationError.contains("size")) {
                throw new MaxUploadSizeExceededException(file.getSize());
            } else {
                throw new IllegalArgumentException(validationError);
            }
        }
        
        // Save file to temporary directory
        String filePath = fileService.saveUploadedFile(file);
        logger.info("File saved to: {}", filePath);
        
        // Get file type
        String fileType = fileService.getFileType(file.getOriginalFilename());
        
        // Create and enqueue print task
        String taskId = printQueueService.createAndEnqueueTask(
            filePath, fileType, printerId, copies, paperSize, duplex, colorMode
        );
        
        logger.info("Print task created and enqueued: {}", taskId);
        logger.info("Current queue size: {}", printQueueService.getQueueSize());
        
        // Return success response
        UploadResponseDto response = new UploadResponseDto(
            1000, 
            taskId, 
            "File uploaded and print task created successfully"
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get print queue status and statistics
     * @return Queue status information
     */
    @GetMapping("/queue/status")
    @Operation(
        summary = "Get print queue status",
        description = "Retrieve current print queue status and statistics"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved queue status",
            content = @Content(mediaType = "application/json")
        )
    })
    public ResponseEntity<?> getQueueStatus() {
        logger.info("Received request for queue status");
        
        try {
            String queueStats = printQueueService.getQueueStats();
            String schedulerStatus = printTaskScheduler.getSchedulerStatus();
            
            // Create a simple status response
            java.util.Map<String, Object> status = new java.util.HashMap<>();
            status.put("timestamp", java.time.LocalDateTime.now());
            status.put("queueSize", printQueueService.getQueueSize());
            status.put("queueStats", queueStats);
            status.put("schedulerStatus", schedulerStatus);
            status.put("isProcessing", printTaskScheduler.isCurrentlyProcessing());
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            logger.error("Error retrieving queue status", e);
            ErrorResponseDto errorResponse = new ErrorResponseDto(5001, "Failed to retrieve queue status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get task status by ID (alternative endpoint as per PRD 4.1)
     * 
     * @param taskId The task ID to look up
     * @return Task status information
     */
    @GetMapping("/status/{taskId}")
    @Operation(
        summary = "Get print task status",
        description = "Retrieve the status of a specific print task by ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved task status",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        )
    })
    public ResponseEntity<?> getTaskStatusByPath(
        @Parameter(description = "Task ID", required = true)
        @org.springframework.web.bind.annotation.PathVariable String taskId
    ) {
        logger.info("Received request for task status (alternative endpoint): {}", taskId);
        return getTaskStatusInternal(taskId);
    }
    
    /**
     * Get task status by ID (detailed endpoint)
     * 
     * @param taskId The task ID to look up
     * @return Task status information
     */
    @GetMapping("/task/{taskId}/status")
    @Operation(
        summary = "Get detailed task status by ID",
        description = "Retrieve detailed status information of a specific print task"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved task status",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponseDto.class)
            )
        )
    })
    public ResponseEntity<?> getTaskStatus(
        @Parameter(description = "Task ID", required = true)
        @org.springframework.web.bind.annotation.PathVariable String taskId
    ) {
        logger.info("Received request for detailed task status: {}", taskId);
        return getTaskStatusInternal(taskId);
    }
    
    /**
     * Internal method to get task status (shared implementation)
     * 
     * @param taskId The task ID to look up
     * @return Task status information
     */
    private ResponseEntity<?> getTaskStatusInternal(String taskId) {
        if (taskId == null || taskId.trim().isEmpty()) {
            throw new IllegalArgumentException("Task ID cannot be null or empty");
        }
        
        com.sanshi.webprint.entity.PrintTask task = printQueueService.getTaskById(taskId);
        
        if (task == null) {
            throw new TaskNotFoundException(taskId);
        }
        
        // Create task status response
        java.util.Map<String, Object> taskStatus = new java.util.HashMap<>();
        taskStatus.put("taskId", task.getTaskId());
        taskStatus.put("status", task.getStatus());
        taskStatus.put("message", task.getErrorMessage());
        taskStatus.put("fileType", task.getFileType());
        taskStatus.put("printerId", task.getPrinterId());
        taskStatus.put("copies", task.getCopies());
        taskStatus.put("paperSize", task.getPaperSize());
        taskStatus.put("duplex", task.getDuplex());
        taskStatus.put("colorMode", task.getColorMode());
        taskStatus.put("submitTime", task.getSubmitTime());
        taskStatus.put("progress", calculateProgress(task.getStatus()));
        
        return ResponseEntity.ok(taskStatus);
    }
    
    /**
     * Calculate task progress based on status
     * 
     * @param status The current task status
     * @return Progress percentage (0-100)
     */
    private int calculateProgress(com.sanshi.webprint.entity.PrintTask.TaskStatus status) {
        switch (status) {
            case PENDING:
                return 0;
            case PROCESSING:
                return 25;
            case PRINTING:
                return 75;
            case COMPLETED:
                return 100;
            case FAILED:
                return -1; // Indicates failure
            default:
                return 0;
        }
    }
} 