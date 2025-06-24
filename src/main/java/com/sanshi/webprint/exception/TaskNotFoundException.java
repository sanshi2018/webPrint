package com.sanshi.webprint.exception;

/**
 * Exception thrown when a requested print task cannot be found
 * 
 * This exception is used when querying for a task by ID that doesn't exist
 * in the system's queue or storage.
 * 
 * @author WebPrint Team
 * @version 1.0
 * @since 1.0
 */
public class TaskNotFoundException extends RuntimeException {
    
    /**
     * Constructs a new TaskNotFoundException with the specified task ID
     * 
     * @param taskId The ID of the task that was not found
     */
    public TaskNotFoundException(String taskId) {
        super("Task not found: " + taskId);
    }
    
    /**
     * Constructs a new TaskNotFoundException with the specified message
     * 
     * @param message The detail message explaining the exception
     */
    public TaskNotFoundException(String message, String taskId) {
        super(message + ": " + taskId);
    }
    
    /**
     * Constructs a new TaskNotFoundException with the specified message and cause
     * 
     * @param message The detail message explaining the exception
     * @param cause The underlying cause of this exception
     */
    public TaskNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
} 