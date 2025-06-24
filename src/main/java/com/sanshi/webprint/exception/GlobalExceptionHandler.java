package com.sanshi.webprint.exception;

import com.sanshi.webprint.dto.ErrorResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.awt.print.PrinterException;
import java.io.IOException;

/**
 * Global exception handler for consistent error response handling
 * 
 * This class provides centralized exception handling across the entire application,
 * ensuring that all errors return consistent error codes and HTTP status codes.
 * 
 * @author WebPrint Team
 * @version 1.0
 * @since 1.0
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * Handle file upload size exceeded exceptions
     * 
     * @param ex The MaxUploadSizeExceededException
     * @return ResponseEntity with error code 2002
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        logger.warn("File upload size exceeded: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(2002, "File size exceeds the maximum limit of 50MB.");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }
    
    /**
     * Handle printer-related exceptions
     * 
     * @param ex The PrinterException
     * @return ResponseEntity with appropriate printer error code
     */
    @ExceptionHandler(PrinterException.class)
    public ResponseEntity<ErrorResponseDto> handlePrinterException(PrinterException ex) {
        logger.error("Printer exception occurred: {}", ex.getMessage(), ex);
        
        String message = ex.getMessage().toLowerCase();
        ErrorResponseDto error;
        HttpStatus status;
        
        if (message.contains("not found") || message.contains("unavailable")) {
            error = new ErrorResponseDto(3001, "Printer not found or unavailable.");
            status = HttpStatus.NOT_FOUND;
        } else if (message.contains("offline")) {
            error = new ErrorResponseDto(3002, "Printer is offline and cannot execute print tasks.");
            status = HttpStatus.SERVICE_UNAVAILABLE;
        } else if (message.contains("paper") && (message.contains("out") || message.contains("jam"))) {
            error = new ErrorResponseDto(3004, "Printer reports paper-out or paper jam error.");
            status = HttpStatus.SERVICE_UNAVAILABLE;
        } else if (message.contains("ink") || message.contains("toner") || message.contains("supplies")) {
            error = new ErrorResponseDto(3005, "Printer has insufficient printing supplies.");
            status = HttpStatus.SERVICE_UNAVAILABLE;
        } else {
            error = new ErrorResponseDto(3003, "Print task submission failed: " + ex.getMessage());
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        return ResponseEntity.status(status).body(error);
    }
    
    /**
     * Handle IO exceptions during file operations
     * 
     * @param ex The IOException
     * @return ResponseEntity with error code 2003
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponseDto> handleIOException(IOException ex) {
        logger.error("IO exception occurred: {}", ex.getMessage(), ex);
        ErrorResponseDto error = new ErrorResponseDto(2003, "File operation failed: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Handle custom print task exceptions
     * 
     * @param ex The PrintTaskException
     * @return ResponseEntity with appropriate error code
     */
    @ExceptionHandler(PrintTaskException.class)
    public ResponseEntity<ErrorResponseDto> handlePrintTaskException(PrintTaskException ex) {
        logger.error("Print task exception: {}", ex.getMessage(), ex);
        
        ErrorResponseDto error = new ErrorResponseDto(ex.getErrorCode(), ex.getMessage());
        HttpStatus status = determineHttpStatus(ex.getErrorCode());
        
        return ResponseEntity.status(status).body(error);
    }
    
    /**
     * Handle task not found exceptions
     * 
     * @param ex The TaskNotFoundException
     * @return ResponseEntity with error code 4001
     */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleTaskNotFoundException(TaskNotFoundException ex) {
        logger.warn("Task not found: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(4001, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    /**
     * Handle invalid request parameter exceptions
     * 
     * @param ex The IllegalArgumentException
     * @return ResponseEntity with error code 4001
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("Invalid request parameters: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(4001, "Invalid request parameters: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    /**
     * Handle all other runtime exceptions
     * 
     * @param ex The RuntimeException
     * @return ResponseEntity with error code 5000
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDto> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        ErrorResponseDto error = new ErrorResponseDto(5000, "Internal server error occurred.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Handle all other generic exceptions
     * 
     * @param ex The Exception
     * @return ResponseEntity with error code 5000
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex) {
        logger.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
        ErrorResponseDto error = new ErrorResponseDto(5000, "An unexpected error occurred.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Determine HTTP status code based on error code
     * 
     * @param errorCode The custom error code
     * @return Appropriate HttpStatus
     */
    private HttpStatus determineHttpStatus(int errorCode) {
        switch (errorCode) {
            case 1000:
                return HttpStatus.OK;
            case 2001:
            case 3006:
            case 4001:
                return HttpStatus.BAD_REQUEST;
            case 2002:
                return HttpStatus.PAYLOAD_TOO_LARGE;
            case 3001:
                return HttpStatus.NOT_FOUND;
            case 3002:
            case 3004:
            case 3005:
                return HttpStatus.SERVICE_UNAVAILABLE;
            case 2003:
            case 3003:
            case 5000:
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
} 