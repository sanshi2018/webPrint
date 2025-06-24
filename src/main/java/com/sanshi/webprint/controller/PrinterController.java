package com.sanshi.webprint.controller;

import com.sanshi.webprint.dto.ErrorResponseDto;
import com.sanshi.webprint.dto.PrinterDto;
import com.sanshi.webprint.dto.PrintRequestDto;
import com.sanshi.webprint.dto.UploadResponseDto;
import com.sanshi.webprint.service.PrinterService;
import com.sanshi.webprint.service.FileService;
import com.sanshi.webprint.service.PrintQueueService;
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

import java.util.List;

/**
 * Controller for printer operations
 */
@RestController
@RequestMapping("/api/print")
@Tag(name = "Printer Management", description = "APIs for managing printers")
public class PrinterController {
    
    private static final Logger logger = LoggerFactory.getLogger(PrinterController.class);
    
    @Autowired
    private PrinterService printerService;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private PrintQueueService printQueueService;
    
    /**
     * Get all available printers
     * @return List of available printers
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
     * @param file The file to upload and print
     * @param printerId Target printer ID
     * @param copies Number of copies (default: 1)
     * @param paperSize Paper size (default: A4)
     * @param duplex Duplex mode (default: simplex)
     * @param colorMode Color mode (default: grayscale)
     * @return Upload response with task ID
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
    ) {
        logger.info("Received file upload request: file={}, printer={}, copies={}", 
                   file.getOriginalFilename(), printerId, copies);
        
        try {
            // Validate file
            String validationError = fileService.validateFile(file);
            if (validationError != null) {
                logger.warn("File validation failed: {}", validationError);
                
                // Determine error code based on validation failure
                int errorCode;
                HttpStatus httpStatus;
                
                if (validationError.contains("format")) {
                    errorCode = 2001;
                    httpStatus = HttpStatus.BAD_REQUEST;
                } else if (validationError.contains("size")) {
                    errorCode = 2002;
                    httpStatus = HttpStatus.PAYLOAD_TOO_LARGE;
                } else {
                    errorCode = 2001;
                    httpStatus = HttpStatus.BAD_REQUEST;
                }
                
                ErrorResponseDto errorResponse = new ErrorResponseDto(errorCode, validationError);
                return ResponseEntity.status(httpStatus).body(errorResponse);
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
            
        } catch (Exception e) {
            logger.error("Error processing file upload", e);
            ErrorResponseDto errorResponse = new ErrorResponseDto(2003, "Failed to save file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 