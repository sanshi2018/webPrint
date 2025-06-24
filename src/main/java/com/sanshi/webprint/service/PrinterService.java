package com.sanshi.webprint.service;

import com.sanshi.webprint.dto.PrinterDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import java.awt.print.PrinterJob;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for printer discovery and management operations
 * 
 * This service provides functionality to discover and manage printers available
 * on the system using the Java Print Service API. It handles printer enumeration,
 * status checking, and provides printer information for client applications.
 * 
 * <p>The service uses {@link java.awt.print.PrinterJob#lookupPrintServices()} to
 * discover available print services and wraps them in DTOs for consistent API responses.</p>
 * 
 * <p>Current implementation provides MVP functionality with basic printer status.
 * Future enhancements may include real-time status monitoring, capability detection,
 * and advanced printer management features.</p>
 * 
 * @author WebPrint Team
 * @version 1.0
 * @since 1.0
 * @see java.awt.print.PrinterJob
 * @see javax.print.PrintService
 */
@Service
public class PrinterService {
    
    private static final Logger logger = LoggerFactory.getLogger(PrinterService.class);
    
    /**
     * Retrieve all available printers from the system
     * 
     * This method discovers all print services available on the current system using
     * the Java Print Service API. Each discovered printer is wrapped in a PrinterDto
     * with standardized information for client consumption.
     * 
     * <p>The method performs the following operations:</p>
     * <ol>
     *   <li>Calls {@link java.awt.print.PrinterJob#lookupPrintServices()} to discover printers</li>
     *   <li>Filters out null or invalid print services</li>
     *   <li>Creates PrinterDto objects with id, name, and status information</li>
     *   <li>Returns the complete list of available printers</li>
     * </ol>
     * 
     * <p>Status is currently set to "Ready" for all printers (MVP implementation).
     * Future versions may include real-time status detection.</p>
     * 
     * @return List of PrinterDto objects representing available printers
     * @throws RuntimeException if unable to retrieve printer services from the system
     * @see PrinterDto
     * @see java.awt.print.PrinterJob#lookupPrintServices()
     */
    public List<PrinterDto> getAvailablePrinters() {
        logger.info("Retrieving available printers from system");
        
        try {
            // Use java.awt.print.PrinterJob.lookupPrintServices() to get print services
            PrintService[] printServices = PrinterJob.lookupPrintServices();
            
            List<PrinterDto> printers = new ArrayList<>();
            
            if (printServices == null || printServices.length == 0) {
                logger.warn("No printers found on the system");
                return printers;
            }
            
            for (PrintService printService : printServices) {
                if (printService != null) {
                    String printerName = printService.getName();
                    logger.debug("Found printer: {}", printerName);
                    
                    // Create PrinterDto with id=name, name=name, status="Ready" (MVP requirement)
                    PrinterDto printerDto = new PrinterDto(
                        printerName,
                        printerName,
                        "Ready"
                    );
                    
                    printers.add(printerDto);
                }
            }
            
            logger.info("Successfully retrieved {} printers", printers.size());
            return printers;
            
        } catch (Exception e) {
            logger.error("Failed to retrieve printer list", e);
            throw new RuntimeException("Failed to retrieve printer list: " + e.getMessage(), e);
        }
    }
} 