package com.sanshi.webprint.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Printer DTO for API responses
 */
@Schema(description = "Printer information")
public class PrinterDto {
    
    @Schema(description = "Printer ID (usually the printer name)", example = "HP LaserJet M1005")
    private String id;
    
    @Schema(description = "Printer display name", example = "HP LaserJet M1005")
    private String name;
    
    @Schema(description = "Printer status", example = "Ready")
    private String status;
    
    public PrinterDto() {}
    
    public PrinterDto(String id, String name, String status) {
        this.id = id;
        this.name = name;
        this.status = status;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
} 