package com.sanshi.webprint.entity;

import java.time.LocalDateTime;

/**
 * Print task entity representing a print job in the queue
 */
public class PrintTask {
    
    /**
     * Task status enumeration
     */
    public enum TaskStatus {
        PENDING,
        PROCESSING,
        PRINTING,
        COMPLETED,
        FAILED
    }
    
    private String taskId;
    private String filePath;
    private String fileType;
    private String printerName;
    private Integer copies;
    private String paperSize;
    private String duplex;
    private String colorMode;
    private TaskStatus status;
    private LocalDateTime submitTime;
    private String errorMessage;
    
    public PrintTask() {
        this.submitTime = LocalDateTime.now();
        this.status = TaskStatus.PENDING;
    }
    
    public PrintTask(String taskId, String filePath, String fileType, String printerName,
                     Integer copies, String paperSize, String duplex, String colorMode) {
        this();
        this.taskId = taskId;
        this.filePath = filePath;
        this.fileType = fileType;
        this.printerName = printerName;
        this.copies = copies;
        this.paperSize = paperSize;
        this.duplex = duplex;
        this.colorMode = colorMode;
    }
    
    // Getters and Setters
    public String getTaskId() {
        return taskId;
    }
    
    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public String getPrinterName() {
        return printerName;
    }
    
    public void setPrinterName(String printerName) {
        this.printerName = printerName;
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
    
    public TaskStatus getStatus() {
        return status;
    }
    
    public void setStatus(TaskStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getSubmitTime() {
        return submitTime;
    }
    
    public void setSubmitTime(LocalDateTime submitTime) {
        this.submitTime = submitTime;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    @Override
    public String toString() {
        return "PrintTask{" +
                "taskId='" + taskId + '\'' +
                ", filePath='" + filePath + '\'' +
                ", fileType='" + fileType + '\'' +
                ", printerId='" + printerName + '\'' +
                ", copies=" + copies +
                ", status=" + status +
                ", submitTime=" + submitTime +
                '}';
    }
} 