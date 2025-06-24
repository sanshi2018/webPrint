package com.sanshi.webprint.exception;

/**
 * Custom exception for print task related errors
 * 
 * This exception is thrown when print task operations fail and includes
 * a specific error code for consistent error handling.
 * 
 * @author WebPrint Team
 * @version 1.0
 * @since 1.0
 */
public class PrintTaskException extends Exception {
    
    private final int errorCode;
    
    /**
     * Constructs a new PrintTaskException with specified error code and message
     * 
     * @param errorCode The specific error code for this exception
     * @param message The detail message explaining the exception
     */
    public PrintTaskException(int errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    /**
     * Constructs a new PrintTaskException with specified error code, message and cause
     * 
     * @param errorCode The specific error code for this exception
     * @param message The detail message explaining the exception
     * @param cause The underlying cause of this exception
     */
    public PrintTaskException(int errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    /**
     * Gets the error code associated with this exception
     * 
     * @return The error code
     */
    public int getErrorCode() {
        return errorCode;
    }
} 