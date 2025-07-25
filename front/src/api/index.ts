import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message, notification, Modal } from 'antd'
import type { ApiResponse } from '../types/api'
import { endpointBuilder } from './config'

// Error code mappings for user-friendly messages
const ERROR_MESSAGES: Record<number, string> = {
  // Success
  1000: 'Operation completed successfully',
  
  // File-related errors (2xxx)
  2001: 'Unsupported file format. Please select a PDF, DOC, or DOCX file.',
  2002: 'File size exceeds the maximum limit of 50MB.',
  2003: 'File upload failed. Please try again.',
  
  // Printer-related errors (3xxx)
  3001: 'Printer not found. Please check if the printer is available.',
  3002: 'Printer is currently offline. Please check the printer connection.',
  3003: 'Printer is busy. Please wait and try again later.',
  3004: 'Printer encountered an error. Please check the printer status.',
  3005: 'Invalid print parameters. Please check your settings.',
  3006: 'Failed to create print job. Please try again.',
  
  // Authentication/Authorization errors (4xxx)
  4001: 'Task does not exist or has expired.',
  
  // Server errors (5xxx)
  5000: 'Internal server error. Please try again later or contact support.',
}

/**
 * Creates a configured axios instance with interceptors for request/response handling
 * @returns Configured axios instance with error handling
 */
const createApiInstance = (): AxiosInstance => {
  const config = endpointBuilder.getConfig()
  
  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor for logging and authentication
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add any common headers or authentication tokens here
      if (endpointBuilder.getConfig().enableLogging) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error: AxiosError) => {
      if (endpointBuilder.getConfig().enableLogging) {
        console.error('❌ Request Error:', error)
      }
      return Promise.reject(error)
    }
  )

  // Response interceptor for unified error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (endpointBuilder.getConfig().enableLogging) {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
      }
      
      // Check if response has the expected API structure
      if (response.data && typeof response.data === 'object' && 'code' in response.data) {
        const apiResponse = response.data as ApiResponse<any>
        
        // Handle non-1000 success codes as business logic errors
        if (apiResponse.code !== 1000) {
          handleApiError(apiResponse.code, apiResponse.message)
          // Still return the response for the caller to handle if needed
        }
      }
      
      return response
    },
    (error: AxiosError) => {
      if (endpointBuilder.getConfig().enableLogging) {
        console.error('❌ API Error:', error)
      }
      handleNetworkError(error)
      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Handles API business logic errors (non-1000 codes) by showing appropriate notifications
 * @param code - Error code from API response
 * @param errorMessage - Optional custom error message
 */
const handleApiError = (code: number, errorMessage?: string): void => {
  const userMessage = ERROR_MESSAGES[code] || errorMessage || `Unknown error occurred (Code: ${code})`
  
  // Use different notification types based on error severity
  if (code >= 5000) {
    // Server errors - use notification for more prominent display
    notification.error({
      message: 'Server Error',
      description: userMessage,
      duration: 5,
      placement: 'topRight',
    })
  } else if (code >= 4000) {
    // Client errors - use message for less intrusive display
    message.error(userMessage, 4)
  } else if (code >= 3000) {
    // Printer errors - use message
    message.error(userMessage, 4)
  } else if (code >= 2000) {
    // File errors - use message
    message.error(userMessage, 4)
  } else {
    // Generic errors - use message
    message.error(userMessage, 3)
  }
}

/**
 * Handles network and HTTP errors by showing appropriate notifications
 * @param error - Axios error object
 */
const handleNetworkError = (error: AxiosError): void => {
  let errorMessage = 'Network request failed, please try again later.'
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    
    switch (status) {
      case 400:
        errorMessage = 'Bad request. Please check your input.'
        break
      case 401:
        errorMessage = 'Unauthorized. Please check your credentials.'
        break
      case 403:
        errorMessage = 'Access forbidden.'
        break
      case 404:
        errorMessage = 'Resource not found.'
        break
      case 408:
        errorMessage = 'Request timeout. Please try again.'
        break
      case 429:
        errorMessage = 'Too many requests. Please wait and try again.'
        break
      case 500:
        errorMessage = 'Internal server error. Please try again later.'
        break
      case 502:
        errorMessage = 'Bad gateway. Server is temporarily unavailable.'
        break
      case 503:
        errorMessage = 'Service unavailable. Please try again later.'
        break
      case 504:
        errorMessage = 'Gateway timeout. Please try again.'
        break
      default:
        errorMessage = `Request failed with status ${status}.`
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Network connection failed. Please check your internet connection.'
  } else {
    // Request setup error
    errorMessage = 'Request configuration error.'
  }

  // Use notification for network errors as they are more serious
  notification.error({
    message: 'Network Error',
    description: errorMessage,
    duration: 5,
    placement: 'topRight',
  })
}

// Create the global API instance
const api = createApiInstance()

// Generic API request methods with type safety
export const apiRequest = {
  // GET request
  get: async <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    const response = await api.get<ApiResponse<T>>(url, config)
    return response.data
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    const response = await api.post<ApiResponse<T>>(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    const response = await api.put<ApiResponse<T>>(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    const response = await api.delete<ApiResponse<T>>(url, config)
    return response.data
  },

  // File upload with progress support
  upload: async <T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> => {
    const response = await api.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  },
}

// Utility functions for manual error handling when needed
export const showError = (code: number, customMessage?: string): void => {
  const errorMsg = customMessage || ERROR_MESSAGES[code] || `Error occurred (Code: ${code})`
  handleApiError(code, errorMsg)
}

export const showModalError = (title: string, content: string): void => {
  Modal.error({
    title,
    content,
    okText: 'OK',
  })
}

export const showSuccess = (successMessage: string, duration = 3): void => {
  message.success(successMessage, duration)
}

// Loading notification utilities
export class LoadingManager {
  private static loadingKeys: Map<string, () => void> = new Map()

  // Show loading message for long-running operations
  static showLoading(key: string, loadingMessage = 'Processing...'): void {
    const hide = message.loading(loadingMessage, 0) // 0 means no auto-hide
    this.loadingKeys.set(key, hide)
  }

  // Hide loading message
  static hideLoading(key: string): void {
    const hide = this.loadingKeys.get(key)
    if (hide) {
      hide()
      this.loadingKeys.delete(key)
    }
  }

  // Show loading and automatically hide on completion
  static async withLoading<T>(
    key: string,
    operation: () => Promise<T>,
    loadingMessage = 'Processing...',
    successMessage?: string
  ): Promise<T> {
    this.showLoading(key, loadingMessage)
    
    try {
      const result = await operation()
      
      if (successMessage) {
        this.showSuccess(successMessage)
      }
      
      return result
    } catch (error) {
      // Error is already handled by interceptors
      throw error
    } finally {
      this.hideLoading(key)
    }
  }

  // Helper method for success messages
  private static showSuccess(successMessage: string): void {
    message.success(successMessage, 3)
  }
}

// Enhanced API request methods with loading support
export const apiRequestWithLoading = {
  // GET request with optional loading
  get: async <T = any>(
    url: string, 
    config?: any,
    options?: {
      loadingKey?: string
      loadingMessage?: string
      successMessage?: string
    }
  ): Promise<ApiResponse<T>> => {
    if (options?.loadingKey) {
      return LoadingManager.withLoading(
        options.loadingKey,
        () => apiRequest.get<T>(url, config),
        options.loadingMessage,
        options.successMessage
      )
    }
    return apiRequest.get<T>(url, config)
  },

  // POST request with optional loading
  post: async <T = any>(
    url: string, 
    data?: any, 
    config?: any,
    options?: {
      loadingKey?: string
      loadingMessage?: string
      successMessage?: string
    }
  ): Promise<ApiResponse<T>> => {
    if (options?.loadingKey) {
      return LoadingManager.withLoading(
        options.loadingKey,
        () => apiRequest.post<T>(url, data, config),
        options.loadingMessage,
        options.successMessage
      )
    }
    return apiRequest.post<T>(url, data, config)
  },

  // File upload with loading and progress
  upload: async <T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void,
    options?: {
      loadingKey?: string
      loadingMessage?: string
      successMessage?: string
    }
  ): Promise<ApiResponse<T>> => {
    if (options?.loadingKey) {
      return LoadingManager.withLoading(
        options.loadingKey,
        () => apiRequest.upload<T>(url, formData, onProgress),
        options.loadingMessage,
        options.successMessage
      )
    }
    return apiRequest.upload<T>(url, formData, onProgress)
  },
}

// Export the raw axios instance for edge cases
export { api as axiosInstance }

// Export both the basic and enhanced API instances
export { apiRequestWithLoading as api }
export default apiRequest 