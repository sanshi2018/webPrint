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
 * Service for printer operations
 */
@Service
public class PrinterService {
    
    private static final Logger logger = LoggerFactory.getLogger(PrinterService.class);
    
    /**
     * Retrieve all available printers from the system
     * @return List of PrinterDto objects
     * @throws RuntimeException if unable to retrieve printer services
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