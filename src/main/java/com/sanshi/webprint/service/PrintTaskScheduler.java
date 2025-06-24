package com.sanshi.webprint.service;

import com.sanshi.webprint.entity.PrintTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Scheduled service for processing print tasks from the queue
 */
@Service
public class PrintTaskScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(PrintTaskScheduler.class);
    
    @Autowired
    private PrintQueueService printQueueService;
    
    @Autowired
    private PdfPrintService pdfPrintService;
    
    @Autowired
    private FileService fileService;
    
    // Flag to prevent concurrent processing
    private final AtomicBoolean isProcessing = new AtomicBoolean(false);
    
    /**
     * Scheduled method to process print tasks
     * Runs every 2 seconds to check for pending tasks
     */
    @Scheduled(fixedDelay = 2000, initialDelay = 5000)
    public void processPrintTasks() {
        // Check if already processing a task
        if (!isProcessing.compareAndSet(false, true)) {
            logger.debug("Print task processing already in progress, skipping this cycle");
            return;
        }
        
        try {
            // Check for pending tasks
            PrintTask task = findNextPendingTask();
            if (task != null) {
                processTask(task);
            }
        } catch (Exception e) {
            logger.error("Error in print task scheduler", e);
        } finally {
            // Release the processing flag
            isProcessing.set(false);
        }
    }
    
    /**
     * Find the next pending task in the queue
     * @return PrintTask or null if no pending tasks
     */
    private PrintTask findNextPendingTask() {
        PrintTask task = printQueueService.peekTask();
        
        if (task == null) {
            logger.debug("No tasks in queue");
            return null;
        }
        
        // Check if the task is pending
        if (task.getStatus() != PrintTask.TaskStatus.PENDING) {
            logger.debug("Next task is not pending (status: {}), checking for cleanup", task.getStatus());
            
            // If task is completed or failed, remove it from queue and clean up
            if (task.getStatus() == PrintTask.TaskStatus.COMPLETED || 
                task.getStatus() == PrintTask.TaskStatus.FAILED) {
                
                printQueueService.dequeueTask(); // Remove from queue
                cleanupTaskFile(task);
                logger.info("Cleaned up completed/failed task: {}", task.getTaskId());
                
                // Check for next task
                return findNextPendingTask();
            }
            
            return null;
        }
        
        // Remove the pending task from queue and return it
        printQueueService.dequeueTask();
        logger.info("Found pending task for processing: {}", task.getTaskId());
        return task;
    }
    
    /**
     * Process a single print task
     * @param task The task to process
     */
    private void processTask(PrintTask task) {
        logger.info("Processing print task: {} (file: {}, type: {}, printer: {})",
                   task.getTaskId(), task.getFilePath(), task.getFileType(), task.getPrinterId());
        
        try {
            // Update status to PROCESSING
            printQueueService.updateTaskStatus(task.getTaskId(), PrintTask.TaskStatus.PROCESSING, null);
            
            // Validate file exists
            if (!fileExists(task.getFilePath())) {
                throw new RuntimeException("File not found: " + task.getFilePath());
            }
            
            // Update status to PRINTING
            printQueueService.updateTaskStatus(task.getTaskId(), PrintTask.TaskStatus.PRINTING, null);
            
            // Process based on file type
            if ("PDF".equalsIgnoreCase(task.getFileType())) {
                processPdfTask(task);
            } else if ("WORD".equalsIgnoreCase(task.getFileType())) {
                processWordTask(task);
            } else {
                throw new RuntimeException("Unsupported file type: " + task.getFileType());
            }
            
            // Mark as completed
            printQueueService.updateTaskStatus(task.getTaskId(), PrintTask.TaskStatus.COMPLETED, null);
            logger.info("Print task completed successfully: {}", task.getTaskId());
            
        } catch (Exception e) {
            // Mark as failed
            String errorMessage = "Print failed: " + e.getMessage();
            printQueueService.updateTaskStatus(task.getTaskId(), PrintTask.TaskStatus.FAILED, errorMessage);
            logger.error("Print task failed: {}", task.getTaskId(), e);
        }
    }
    
    /**
     * Process a PDF print task
     * @param task The PDF task to process
     * @throws Exception if printing fails
     */
    private void processPdfTask(PrintTask task) throws Exception {
        logger.info("Processing PDF print task: {}", task.getTaskId());
        pdfPrintService.printPdf(task);
    }
    
    /**
     * Process a Word document print task
     * @param task The Word task to process
     * @throws Exception if printing fails
     */
    private void processWordTask(PrintTask task) throws Exception {
        logger.info("Processing Word print task: {}", task.getTaskId());
        // TODO: Implement Word document printing
        // For now, throw an exception as Word printing is not yet implemented
        throw new RuntimeException("Word document printing not yet implemented");
    }
    
    /**
     * Check if file exists
     * @param filePath Path to the file
     * @return true if file exists
     */
    private boolean fileExists(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        
        File file = new File(filePath);
        boolean exists = file.exists() && file.isFile();
        
        if (!exists) {
            logger.warn("File does not exist: {}", filePath);
        }
        
        return exists;
    }
    
    /**
     * Clean up temporary file after task completion
     * @param task The completed task
     */
    private void cleanupTaskFile(PrintTask task) {
        if (task.getFilePath() == null || task.getFilePath().isEmpty()) {
            return;
        }
        
        try {
            Path filePath = Paths.get(task.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Cleaned up temporary file: {}", task.getFilePath());
            } else {
                logger.debug("File already cleaned up or doesn't exist: {}", task.getFilePath());
            }
        } catch (Exception e) {
            logger.error("Failed to clean up file: {}", task.getFilePath(), e);
        }
    }
    
    /**
     * Get current processing status
     * @return true if currently processing a task
     */
    public boolean isCurrentlyProcessing() {
        return isProcessing.get();
    }
    
    /**
     * Force stop current processing (for emergency situations)
     */
    public void forceStopProcessing() {
        logger.warn("Force stopping print task processing");
        isProcessing.set(false);
    }
    
    /**
     * Get scheduler statistics
     * @return Status string
     */
    public String getSchedulerStatus() {
        return String.format("Print Task Scheduler - Processing: %s, Queue: %s",
                           isProcessing.get() ? "YES" : "NO",
                           printQueueService.getQueueStats());
    }
} 