package com.sanshi.webprint.controller;

import com.sanshi.webprint.dto.ErrorResponseDto;
import com.sanshi.webprint.dto.PrinterDto;
import com.sanshi.webprint.service.PrinterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
} 