package com.sanshi.webprint.service;

import com.sanshi.webprint.entity.PrintTask;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.printing.PDFPageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.print.*;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.print.attribute.PrintRequestAttributeSet;
import javax.print.attribute.standard.*;
import java.awt.print.PageFormat;
import java.awt.print.Paper;
import java.awt.print.PrinterException;
import java.awt.print.PrinterJob;
import java.io.File;
import java.io.IOException;

/**
 * Service for PDF printing operations using Apache PDFBox
 */
@Service
public class PdfPrintService {
    
    private static final Logger logger = LoggerFactory.getLogger(PdfPrintService.class);
    
    /**
     * Print a PDF file with specified parameters
     * @param task The print task containing file path and print parameters
     * @throws IOException if PDF file cannot be read
     * @throws PrinterException if printing fails
     */
    public void printPdf(PrintTask task) throws IOException, PrinterException {
        logger.info("Starting PDF print job for task: {}", task.getTaskId());
        
        File pdfFile = new File(task.getFilePath());
        if (!pdfFile.exists()) {
            throw new IOException("PDF file not found: " + task.getFilePath());
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            // Find the target printer
            PrintService printService = findPrintService(task.getPrinterName());
            if (printService == null) {
                throw new PrinterException("Printer not found: " + task.getPrinterName());
            }
            
            // Create printer job
            PrinterJob printerJob = PrinterJob.getPrinterJob();
            printerJob.setPrintService(printService);
            
            // Set up page format and paper size
            PageFormat pageFormat = setupPageFormat(task.getPaperSize());
            
            // Create print attributes
            PrintRequestAttributeSet attributes = createPrintAttributes(task);
            
            // Set up the document for printing
            PDFPageable pageable = new PDFPageable(document);
            printerJob.setPageable(pageable);
            
            logger.info("Submitting print job to printer: {} (copies: {}, paper: {}, duplex: {}, color: {})",
                    task.getPrinterName(), task.getCopies(), task.getPaperSize(),
                    task.getDuplex(), task.getColorMode());
            
            // Execute the print job
            printerJob.print(attributes);
            
            logger.info("PDF print job completed successfully for task: {}", task.getTaskId());
            
        } catch (Exception e) {
            logger.error("Failed to print PDF for task: {}", task.getTaskId(), e);
            throw e;
        }
    }
    
    /**
     * Find print service by name
     * @param printerName The name of the printer
     * @return PrintService or null if not found
     */
    private PrintService findPrintService(String printerName) {
        PrintService[] printServices = PrinterJob.lookupPrintServices();
        for (PrintService service : printServices) {
            if (service.getName().equals(printerName)) {
                logger.debug("Found print service: {}", printerName);
                return service;
            }
        }
        logger.warn("Print service not found: {}", printerName);
        return null;
    }
    
    /**
     * Set up page format with paper size
     * @param paperSize The paper size (A4, Letter, etc.)
     * @return Configured PageFormat
     */
    private PageFormat setupPageFormat(String paperSize) {
        PageFormat pageFormat = new PageFormat();
        Paper paper = new Paper();
        
        // Set paper dimensions based on paper size
        switch (paperSize.toUpperCase()) {
            case "A4":
                // A4: 210 × 297 mm = 595 × 842 points
                paper.setSize(595, 842);
                paper.setImageableArea(36, 36, 523, 770); // 0.5 inch margins
                break;
            case "LETTER":
                // Letter: 8.5 × 11 inches = 612 × 792 points
                paper.setSize(612, 792);
                paper.setImageableArea(36, 36, 540, 720); // 0.5 inch margins
                break;
            case "A3":
                // A3: 297 × 420 mm = 842 × 1191 points
                paper.setSize(842, 1191);
                paper.setImageableArea(36, 36, 770, 1119); // 0.5 inch margins
                break;
            default:
                logger.warn("Unknown paper size: {}, using A4 as default", paperSize);
                paper.setSize(595, 842);
                paper.setImageableArea(36, 36, 523, 770);
                break;
        }
        
        pageFormat.setPaper(paper);
        logger.debug("Page format set for paper size: {}", paperSize);
        return pageFormat;
    }
    
    /**
     * Create print request attributes based on task parameters
     * @param task The print task
     * @return PrintRequestAttributeSet with configured attributes
     */
    private PrintRequestAttributeSet createPrintAttributes(PrintTask task) {
        PrintRequestAttributeSet attributes = new HashPrintRequestAttributeSet();
        
        // Set number of copies
        if (task.getCopies() != null && task.getCopies() > 0) {
            attributes.add(new Copies(task.getCopies()));
            logger.debug("Set copies: {}", task.getCopies());
        }
        
        // Set duplex mode
        if ("duplex".equalsIgnoreCase(task.getDuplex())) {
            attributes.add(Sides.DUPLEX);
            logger.debug("Set duplex mode: DUPLEX");
        } else {
            attributes.add(Sides.ONE_SIDED);
            logger.debug("Set duplex mode: ONE_SIDED");
        }
        
        // Set color mode
        if ("color".equalsIgnoreCase(task.getColorMode())) {
            attributes.add(Chromaticity.COLOR);
            logger.debug("Set color mode: COLOR");
        } else {
            attributes.add(Chromaticity.MONOCHROME);
            logger.debug("Set color mode: MONOCHROME");
        }
        
        // Set paper size
        MediaSizeName mediaSizeName = getMediaSizeName(task.getPaperSize());
        if (mediaSizeName != null) {
            attributes.add(mediaSizeName);
            logger.debug("Set media size: {}", mediaSizeName);
        }
        
        // Set print quality
        attributes.add(PrintQuality.NORMAL);
        
        return attributes;
    }
    
    /**
     * Get MediaSizeName for paper size
     * @param paperSize The paper size string
     * @return MediaSizeName or null if not recognized
     */
    private MediaSizeName getMediaSizeName(String paperSize) {
        if (paperSize == null) {
            return MediaSizeName.ISO_A4;
        }
        
        switch (paperSize.toUpperCase()) {
            case "A4":
                return MediaSizeName.ISO_A4;
            case "LETTER":
                return MediaSizeName.NA_LETTER;
            case "A3":
                return MediaSizeName.ISO_A3;
            case "LEGAL":
                return MediaSizeName.NA_LEGAL;
            default:
                logger.warn("Unknown paper size for media: {}, using A4", paperSize);
                return MediaSizeName.ISO_A4;
        }
    }
    
    /**
     * Check if a printer supports the required capabilities
     * @param printService The print service to check
     * @param task The print task with requirements
     * @return true if supported, false otherwise
     */
    public boolean isPrinterCapable(PrintService printService, PrintTask task) {
        if (printService == null) {
            return false;
        }
        
        try {
            // Check if printer supports the required media size
            MediaSizeName mediaSizeName = getMediaSizeName(task.getPaperSize());
            if (mediaSizeName != null) {
                boolean supportsMedia = printService.isAttributeValueSupported(
                    mediaSizeName, null, null);
                if (!supportsMedia) {
                    logger.warn("Printer {} does not support media size: {}", 
                              printService.getName(), task.getPaperSize());
                    return false;
                }
            }
            
            // Check duplex support if required
            if ("duplex".equalsIgnoreCase(task.getDuplex())) {
                boolean supportsDuplex = printService.isAttributeValueSupported(
                    Sides.DUPLEX, null, null);
                if (!supportsDuplex) {
                    logger.warn("Printer {} does not support duplex printing", 
                              printService.getName());
                    // Don't fail for duplex - fall back to simplex
                }
            }
            
            // Check color support if required
            if ("color".equalsIgnoreCase(task.getColorMode())) {
                boolean supportsColor = printService.isAttributeValueSupported(
                    Chromaticity.COLOR, null, null);
                if (!supportsColor) {
                    logger.warn("Printer {} does not support color printing", 
                              printService.getName());
                    // Don't fail for color - fall back to monochrome
                }
            }
            
            return true;
            
        } catch (Exception e) {
            logger.error("Error checking printer capabilities for {}: {}", 
                        printService.getName(), e.getMessage());
            return false;
        }
    }
} 