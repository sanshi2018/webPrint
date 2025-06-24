package com.sanshi.webprint.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Upload response DTO for successful file upload and task creation
 */
@Schema(description = "Upload response")
public class UploadResponseDto {
    
    @Schema(description = "Success code", example = "1000")
    private int code;
    
    @Schema(description = "Task ID for tracking the print job", example = "550e8400-e29b-41d4-a716-446655440000")
    private String taskId;
    
    @Schema(description = "Success message", example = "File uploaded and print task created successfully")
    private String message;
    
    @Schema(description = "Task submission timestamp", example = "2024-01-01T12:00:00")
    private LocalDateTime timestamp;
    
    public UploadResponseDto() {
        this.timestamp = LocalDateTime.now();
    }
    
    public UploadResponseDto(int code, String taskId, String message) {
        this.code = code;
        this.taskId = taskId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    public int getCode() {
        return code;
    }
    
    public void setCode(int code) {
        this.code = code;
    }
    
    public String getTaskId() {
        return taskId;
    }
    
    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
} 