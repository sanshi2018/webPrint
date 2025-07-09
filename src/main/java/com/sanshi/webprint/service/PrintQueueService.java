package com.sanshi.webprint.service;

import com.sanshi.webprint.entity.PrintTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

/**
 * Service for managing print task queue
 */
@Service
public class PrintQueueService {
    
    private static final Logger logger = LoggerFactory.getLogger(PrintQueueService.class);
    
    // Thread-safe FIFO queue for print tasks
    private final ConcurrentLinkedQueue<PrintTask> printQueue = new ConcurrentLinkedQueue<>();
    
    // Thread-safe map for quick task lookup by ID
    private final ConcurrentHashMap<String, PrintTask> taskMap = new ConcurrentHashMap<>();
    
    /**
     * Add a print task to the queue
     * @param task The print task to add
     * @return The task ID
     */
    public String enqueueTask(PrintTask task) {
        if (task == null) {
            throw new IllegalArgumentException("Task cannot be null");
        }
        
        // Generate task ID if not set
        if (task.getTaskId() == null || task.getTaskId().isEmpty()) {
            task.setTaskId(UUID.randomUUID().toString());
        }
        
        // Add to queue and map
        printQueue.offer(task);
        taskMap.put(task.getTaskId(), task);
        
        logger.info("Print task enqueued: {} (Queue size: {})", task.getTaskId(), printQueue.size());
        logger.debug("Task details: {}", task);
        
        return task.getTaskId();
    }
    
    /**
     * Create and enqueue a print task
     * @param filePath Path to the file to print
     * @param fileType Type of file (PDF, WORD)
     * @param printerName Target printer ID
     * @param copies Number of copies
     * @param paperSize Paper size
     * @param duplex Duplex mode
     * @param colorMode Color mode
     * @return The task ID
     */
    public String createAndEnqueueTask(String filePath, String fileType, String printerName,
                                     Integer copies, String paperSize, String duplex, String colorMode) {
        
        PrintTask task = new PrintTask(
            UUID.randomUUID().toString(),
            filePath,
            fileType,
            printerName,
            copies,
            paperSize,
            duplex,
            colorMode
        );
        
        return enqueueTask(task);
    }
    
    /**
     * Get the next task from the queue (FIFO)
     * @return The next print task, or null if queue is empty
     */
    public PrintTask dequeueTask() {
        PrintTask task = printQueue.poll();
        if (task != null) {
            logger.info("Print task dequeued: {} (Queue size: {})", task.getTaskId(), printQueue.size());
        }
        return task;
    }
    
    /**
     * Peek at the next task without removing it
     * @return The next print task, or null if queue is empty
     */
    public PrintTask peekTask() {
        return printQueue.peek();
    }
    
    /**
     * Get task by ID
     * @param taskId The task ID
     * @return The print task, or null if not found
     */
    public PrintTask getTaskById(String taskId) {
        return taskMap.get(taskId);
    }
    
    /**
     * Update task status
     * @param taskId The task ID
     * @param status New status
     * @param errorMessage Error message (optional)
     */
    public void updateTaskStatus(String taskId, PrintTask.TaskStatus status, String errorMessage) {
        PrintTask task = taskMap.get(taskId);
        if (task != null) {
            task.setStatus(status);
            if (errorMessage != null) {
                task.setErrorMessage(errorMessage);
            }
            logger.info("Task status updated: {} -> {}", taskId, status);
        } else {
            logger.warn("Task not found for status update: {}", taskId);
        }
    }
    
    /**
     * Get current queue size
     * @return Number of tasks in queue
     */
    public int getQueueSize() {
        return printQueue.size();
    }
    
    /**
     * Get all tasks in queue (for debugging/monitoring)
     * @return List of all tasks
     */
    public List<PrintTask> getAllTasks() {
        return new ArrayList<>(printQueue);
    }
    
    /**
     * Clear all tasks from queue
     */
    public void clearQueue() {
        int size = printQueue.size();
        printQueue.clear();
        taskMap.clear();
        logger.info("Print queue cleared. Removed {} tasks", size);
    }
    
    /**
     * Get queue statistics
     * @return String representation of queue stats
     */
    public String getQueueStats() {
        long pendingCount = taskMap.values().stream()
                .filter(task -> task.getStatus() == PrintTask.TaskStatus.PENDING)
                .count();
        
        long processingCount = taskMap.values().stream()
                .filter(task -> task.getStatus() == PrintTask.TaskStatus.PROCESSING || 
                               task.getStatus() == PrintTask.TaskStatus.PRINTING)
                .count();
        
        long completedCount = taskMap.values().stream()
                .filter(task -> task.getStatus() == PrintTask.TaskStatus.COMPLETED)
                .count();
        
        long failedCount = taskMap.values().stream()
                .filter(task -> task.getStatus() == PrintTask.TaskStatus.FAILED)
                .count();
        
        return String.format("Queue Stats - Total: %d, Pending: %d, Processing: %d, Completed: %d, Failed: %d",
                taskMap.size(), pendingCount, processingCount, completedCount, failedCount);
    }
} 