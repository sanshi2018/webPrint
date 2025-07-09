/**
 * API Service
 * Centralized API service class that provides unified error handling and abstracts all API calls
 */

import { api } from './index'
import { API_ENDPOINTS, getApiUrl, endpointBuilder } from './config'
import type { 
  ApiResponse, 
  PrinterDto, 
  PrintJobDto, 
  QueueStatusDto, 
  TaskStatusDto, 
  TaskWithInfo,
  PrintRequestDto
} from '../types/api'

/**
 * API Service Error
 * Custom error class for API service errors
 */
export class ApiServiceError extends Error {
  public code: number
  public message: string
  public details?: string

  constructor(code: number, message: string, details?: string) {
    super(message)
    this.name = 'ApiServiceError'
    this.code = code
    this.message = message
    this.details = details
  }
}

/**
 * Centralized API Service Class
 * Provides unified error handling and abstracts all API endpoints
 */
export class ApiService {
  /**
   * Health Check Service
   */
  health = {
    /**
     * Check API health status
     * @returns Promise resolving to health status
     * @throws ApiServiceError on failure
     */
    check: async (): Promise<{ status: string; timestamp: string }> => {
      try {
        const response = await api.get<{ status: string; timestamp: string }>(
          getApiUrl(API_ENDPOINTS.HEALTH)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to check health status')
      }
    }
  }

  /**
   * Printer Management Service
   */
  printers = {
    /**
     * Get list of all printers
     * @returns Promise resolving to printer list
     * @throws ApiServiceError on failure
     */
    list: async (): Promise<PrinterDto[]> => {
      try {
        const response = await api.get<PrinterDto[]>(
          getApiUrl(API_ENDPOINTS.PRINTERS.LIST)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to fetch printer list')
      }
    },

    /**
     * Get detailed information about a specific printer
     * @param id - Printer ID
     * @returns Promise resolving to printer details
     * @throws ApiServiceError on failure
     */
    getDetail: async (id: string): Promise<PrinterDto> => {
      try {
        const response = await api.get<PrinterDto>(
          getApiUrl(API_ENDPOINTS.PRINTERS.DETAIL(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to fetch printer details for ID: ${id}`)
      }
    },

    /**
     * Get printer status
     * @param id - Printer ID
     * @returns Promise resolving to printer status
     * @throws ApiServiceError on failure
     */
    getStatus: async (id: string): Promise<PrinterDto> => {
      try {
        const response = await api.get<PrinterDto>(
          getApiUrl(API_ENDPOINTS.PRINTERS.STATUS(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to fetch printer status for ID: ${id}`)
      }
    }
  }

  /**
   * Print Job Management Service
   */
  print = {
    /**
     * Submit a print job
     * @param printData - Print job data
     * @returns Promise resolving to task ID
     * @throws ApiServiceError on failure
     */
    submit: async (printData: PrintRequestDto): Promise<string> => {
      try {
        const formData = new FormData()
        formData.append('file', printData.file)
        formData.append('printerId', printData.printerId)
        formData.append('copies', printData.copies.toString())
        formData.append('paperSize', printData.paperSize)
        formData.append('duplex', printData.duplex)
        formData.append('colorMode', printData.colorMode)

        const response = await api.upload<string>(
          getApiUrl(API_ENDPOINTS.PRINT.SUBMIT),
          formData
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to submit print job')
      }
    },

    /**
     * Get list of print jobs
     * @returns Promise resolving to print job list
     * @throws ApiServiceError on failure
     */
    getJobs: async (): Promise<PrintJobDto[]> => {
      try {
        const response = await api.get<PrintJobDto[]>(
          getApiUrl(API_ENDPOINTS.PRINT.JOBS)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to fetch print jobs')
      }
    },

    /**
     * Get print job details
     * @param id - Print job ID
     * @returns Promise resolving to print job details
     * @throws ApiServiceError on failure
     */
    getJobDetail: async (id: string): Promise<PrintJobDto> => {
      try {
        const response = await api.get<PrintJobDto>(
          getApiUrl(API_ENDPOINTS.PRINT.JOB_DETAIL(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to fetch print job details for ID: ${id}`)
      }
    },

    /**
     * Cancel a print job
     * @param id - Print job ID
     * @returns Promise resolving to success message
     * @throws ApiServiceError on failure
     */
    cancelJob: async (id: string): Promise<string> => {
      try {
        const response = await api.post<string>(
          getApiUrl(API_ENDPOINTS.PRINT.CANCEL_JOB(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to cancel print job ID: ${id}`)
      }
    }
  }

  /**
   * Task Management Service
   */
  tasks = {
    /**
     * Get list of all tasks
     * @returns Promise resolving to task list
     * @throws ApiServiceError on failure
     */
    list: async (): Promise<TaskWithInfo[]> => {
      try {
        const response = await api.get<TaskWithInfo[]>(
          getApiUrl(API_ENDPOINTS.TASKS.LIST)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to fetch task list')
      }
    },

    /**
     * Get task details
     * @param id - Task ID
     * @returns Promise resolving to task details
     * @throws ApiServiceError on failure
     */
    getDetail: async (id: string): Promise<TaskStatusDto> => {
      try {
        const response = await api.get<TaskStatusDto>(
          getApiUrl(API_ENDPOINTS.TASKS.DETAIL(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to fetch task details for ID: ${id}`)
      }
    },

    /**
     * Get task status
     * @param id - Task ID
     * @returns Promise resolving to task status
     * @throws ApiServiceError on failure
     */
    getStatus: async (id: string): Promise<TaskStatusDto> => {
      try {
        const response = await api.get<TaskStatusDto>(
          getApiUrl(API_ENDPOINTS.TASKS.STATUS(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to fetch task status for ID: ${id}`)
      }
    },

    /**
     * Cancel a task
     * @param id - Task ID
     * @returns Promise resolving to success message
     * @throws ApiServiceError on failure
     */
    cancel: async (id: string): Promise<string> => {
      try {
        const response = await api.post<string>(
          getApiUrl(API_ENDPOINTS.TASKS.CANCEL(id))
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, `Failed to cancel task ID: ${id}`)
      }
    }
  }

  /**
   * Queue Management Service
   */
  queue = {
    /**
     * Get queue status
     * @returns Promise resolving to queue status
     * @throws ApiServiceError on failure
     */
    getStatus: async (): Promise<QueueStatusDto> => {
      try {
        const response = await api.get<QueueStatusDto>(
          getApiUrl(API_ENDPOINTS.QUEUE.STATUS)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to fetch queue status')
      }
    },

    /**
     * Clear the queue
     * @returns Promise resolving to success message
     * @throws ApiServiceError on failure
     */
    clear: async (): Promise<string> => {
      try {
        const response = await api.post<string>(
          getApiUrl(API_ENDPOINTS.QUEUE.CLEAR)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to clear queue')
      }
    },

    /**
     * Pause the queue
     * @returns Promise resolving to success message
     * @throws ApiServiceError on failure
     */
    pause: async (): Promise<string> => {
      try {
        const response = await api.post<string>(
          getApiUrl(API_ENDPOINTS.QUEUE.PAUSE)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to pause queue')
      }
    },

    /**
     * Resume the queue
     * @returns Promise resolving to success message
     * @throws ApiServiceError on failure
     */
    resume: async (): Promise<string> => {
      try {
        const response = await api.post<string>(
          getApiUrl(API_ENDPOINTS.QUEUE.RESUME)
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to resume queue')
      }
    }
  }

  /**
   * File Upload Service
   */
  upload = {
    /**
     * Upload a file
     * @param file - File to upload
     * @param onProgress - Progress callback
     * @returns Promise resolving to upload result
     * @throws ApiServiceError on failure
     */
    uploadFile: async (
      file: File, 
      onProgress?: (progress: number) => void
    ): Promise<string> => {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.upload<string>(
          getApiUrl(API_ENDPOINTS.UPLOAD.FILE),
          formData,
          onProgress
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to upload file')
      }
    },

    /**
     * Validate a file before upload
     * @param file - File to validate
     * @returns Promise resolving to validation result
     * @throws ApiServiceError on failure
     */
    validateFile: async (file: File): Promise<{ valid: boolean; message?: string }> => {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post<{ valid: boolean; message?: string }>(
          getApiUrl(API_ENDPOINTS.UPLOAD.VALIDATE),
          formData
        )
        this.validateResponse(response)
        return response.data
      } catch (error) {
        throw this.handleError(error, 'Failed to validate file')
      }
    }
  }

  /**
   * Validates API response and throws error if not successful
   * @param response - API response to validate
   * @throws ApiServiceError if response code is not 1000
   */
  private validateResponse<T>(response: ApiResponse<T>): void {
    if (response.code !== 1000) {
      throw new ApiServiceError(
        response.code,
        response.message,
        'API returned non-success code'
      )
    }
  }

  /**
   * Handles errors and converts them to ApiServiceError
   * @param error - Original error
   * @param context - Context message for the error
   * @returns ApiServiceError
   */
  private handleError(error: unknown, context: string): ApiServiceError {
    if (endpointBuilder.getConfig().enableLogging) {
      console.error(`${context}:`, error)
    }

    // If it's already an ApiServiceError, re-throw it
    if (error instanceof ApiServiceError) {
      return error
    }

    // If it's a known error with code and message, create ApiServiceError
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return new ApiServiceError(
        (error as any).code,
        (error as any).message,
        context
      )
    }

    // Generic error
    return new ApiServiceError(
      5000,
      context,
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Global API service instance
 * Use this instance throughout the application for all API calls
 */
export const apiService = new ApiService()

/**
 * Utility function to handle API service errors in components
 * @param error - Error to handle
 * @param fallbackMessage - Fallback message if error is not ApiServiceError
 */
export const handleApiServiceError = (error: unknown, fallbackMessage: string): void => {
  if (endpointBuilder.getConfig().enableLogging) {
    if (error instanceof ApiServiceError) {
      console.error(`API Service Error [${error.code}]: ${error.message}`)
      if (error.details) {
        console.error('Details:', error.details)
      }
    } else {
      console.error(fallbackMessage, error)
    }
  }
}

/**
 * Type-safe wrapper for API service calls with error handling
 * @param apiCall - API service call function
 * @param errorContext - Context for error handling
 * @returns Promise that resolves to the API result or throws ApiServiceError
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorContext: string
): Promise<T> => {
  try {
    return await apiCall()
  } catch (error) {
    handleApiServiceError(error, errorContext)
    throw error
  }
} 