package com.sanshi.webprint.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Print request DTO for file upload and print parameters
 */
@Schema(description = "Print request parameters")
public class PrintRequestDto {
    
    @Schema(description = "Target printer ID", example = "HP LaserJet M1005", required = true)
    private String printerId;
    
    @Schema(description = "Number of copies", example = "1", defaultValue = "1")
    private Integer copies = 1;
    
    @Schema(description = "Paper size", example = "A4", defaultValue = "A4")
    private String paperSize = "A4";
    
    @Schema(description = "Duplex mode", example = "simplex", allowableValues = {"simplex", "duplex"}, defaultValue = "simplex")
    private String duplex = "simplex";
    
    @Schema(description = "Color mode", example = "grayscale", allowableValues = {"color", "grayscale"}, defaultValue = "grayscale")
    private String colorMode = "grayscale";
    
    public PrintRequestDto() {}
    
    public PrintRequestDto(String printerId, Integer copies, String paperSize, String duplex, String colorMode) {
        this.printerId = printerId;
        this.copies = copies != null ? copies : 1;
        this.paperSize = paperSize != null ? paperSize : "A4";
        this.duplex = duplex != null ? duplex : "simplex";
        this.colorMode = colorMode != null ? colorMode : "grayscale";
    }
    
    public String getPrinterId() {
        return printerId;
    }
    
    public void setPrinterId(String printerId) {
        this.printerId = printerId;
    }
    
    public Integer getCopies() {
        return copies;
    }
    
    public void setCopies(Integer copies) {
        this.copies = copies;
    }
    
    public String getPaperSize() {
        return paperSize;
    }
    
    public void setPaperSize(String paperSize) {
        this.paperSize = paperSize;
    }
    
    public String getDuplex() {
        return duplex;
    }
    
    public void setDuplex(String duplex) {
        this.duplex = duplex;
    }
    
    public String getColorMode() {
        return colorMode;
    }
    
    public void setColorMode(String colorMode) {
        this.colorMode = colorMode;
    }
} 