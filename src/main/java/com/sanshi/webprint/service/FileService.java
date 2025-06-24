package com.sanshi.webprint.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for file operations including upload, validation, and storage
 */
@Service
public class FileService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);
    
    // File size limit: 50MB
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    
    // Supported file extensions
    private static final List<String> SUPPORTED_EXTENSIONS = Arrays.asList(".pdf", ".doc", ".docx");
    
    // File type mappings
    private static final String PDF_TYPE = "PDF";
    private static final String WORD_TYPE = "WORD";
    
    // Temporary storage directory
    private static final String TEMP_DIR = "temp/print_files";
    
    /**
     * Validate file format based on extension
     * @param filename The filename to validate
     * @return true if format is supported
     */
    public boolean isValidFileFormat(String filename) {
        if (filename == null || filename.isEmpty()) {
            return false;
        }
        
        String lowerFilename = filename.toLowerCase();
        return SUPPORTED_EXTENSIONS.stream()
                .anyMatch(lowerFilename::endsWith);
    }
    
    /**
     * Validate file size
     * @param fileSize Size in bytes
     * @return true if size is within limits
     */
    public boolean isValidFileSize(long fileSize) {
        return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
    }
    
    /**
     * Get file type based on extension
     * @param filename The filename
     * @return File type (PDF or WORD)
     */
    public String getFileType(String filename) {
        if (filename == null) {
            return null;
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".pdf")) {
            return PDF_TYPE;
        } else if (lowerFilename.endsWith(".doc") || lowerFilename.endsWith(".docx")) {
            return WORD_TYPE;
        }
        return null;
    }
    
    /**
     * Save uploaded file to temporary directory
     * @param file The multipart file to save
     * @return Full path to the saved file
     * @throws IOException if file saving fails
     */
    public String saveUploadedFile(MultipartFile file) throws IOException {
        logger.info("Saving uploaded file: {}", file.getOriginalFilename());
        
        // Create temp directory if it doesn't exist
        Path tempDir = Paths.get(TEMP_DIR);
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
            logger.info("Created temporary directory: {}", tempDir.toAbsolutePath());
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String uniqueFilename = UUID.randomUUID().toString() + "_" + 
                               (originalFilename != null ? originalFilename : "unknown") + extension;
        
        Path filePath = tempDir.resolve(uniqueFilename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        String savedPath = filePath.toAbsolutePath().toString();
        logger.info("File saved successfully: {}", savedPath);
        
        return savedPath;
    }
    
    /**
     * Validate file against all criteria
     * @param file The multipart file to validate
     * @return null if valid, error message if invalid
     */
    public String validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "File is empty or null";
        }
        
        String filename = file.getOriginalFilename();
        
        // Check file format
        if (!isValidFileFormat(filename)) {
            logger.warn("Invalid file format: {}", filename);
            return "Unsupported file format. Only PDF, DOC, and DOCX files are allowed.";
        }
        
        // Check file size
        if (!isValidFileSize(file.getSize())) {
            logger.warn("File size exceeded limit: {} bytes", file.getSize());
            return "File size exceeds the maximum limit of 50MB.";
        }
        
        return null; // Valid file
    }
    
    /**
     * Get maximum file size in bytes
     * @return Maximum file size
     */
    public long getMaxFileSize() {
        return MAX_FILE_SIZE;
    }
} 