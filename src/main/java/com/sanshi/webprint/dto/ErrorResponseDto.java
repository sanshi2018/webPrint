package com.sanshi.webprint.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Error response DTO for API error responses
 */
@Schema(description = "Error response")
public class ErrorResponseDto {
    
    @Schema(description = "Error code", example = "5000")
    private int code;
    
    @Schema(description = "Error message", example = "Failed to retrieve printer list")
    private String message;
    
    @Schema(description = "Timestamp of the error", example = "2024-01-01T12:00:00")
    private LocalDateTime timestamp;
    
    public ErrorResponseDto() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponseDto(int code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    public int getCode() {
        return code;
    }
    
    public void setCode(int code) {
        this.code = code;
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