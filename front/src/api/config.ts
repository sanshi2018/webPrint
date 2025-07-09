/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

/**
 * Environment configuration interface
 */
export interface ApiConfig {
  /** Base URL for API requests (includes protocol, host, and port) */
  baseUrl: string
  /** Request timeout in milliseconds */
  timeout: number
  /** Whether to enable request/response logging */
  enableLogging: boolean
  /** API version prefix */
  apiVersion: string
}

/**
 * Default API configuration
 * Can be overridden by environment variables or runtime configuration
 */
export const defaultApiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  enableLogging: import.meta.env.DEV || false,
  apiVersion: '/api',
}

/**
 * API endpoint definitions
 * All endpoints are defined here to avoid hardcoding URLs throughout the application
 */
export const API_ENDPOINTS = {
  // Health check endpoints
  HEALTH: '/health',
  
  // Printer management endpoints
  PRINTERS: {
    LIST: '/printers',
    DETAIL: (id: string) => `/printers/${id}`,
    STATUS: (id: string) => `/printers/${id}/status`,
  },
  
  // Print job management endpoints
  PRINT: {
    SUBMIT: '/print/submit',
    JOBS: '/print/jobs',
    JOB_DETAIL: (id: string) => `/print/jobs/${id}`,
    JOB_STATUS: (id: string) => `/print/jobs/${id}/status`,
    CANCEL_JOB: (id: string) => `/print/jobs/${id}/cancel`,
  },
  
  // Task management endpoints
  TASKS: {
    LIST: '/print/tasks',
    DETAIL: (id: string) => `/print/task/${id}`,
    STATUS: (id: string) => `/print/task/${id}/status`,
    CANCEL: (id: string) => `/print/task/${id}/cancel`,
  },
  
  // Queue management endpoints
  QUEUE: {
    STATUS: '/print/queue/status',
    CLEAR: '/print/queue/clear',
    PAUSE: '/print/queue/pause',
    RESUME: '/print/queue/resume',
  },
  
  // File upload endpoints
  UPLOAD: {
    FILE: '/upload/file',
    VALIDATE: '/upload/validate',
  },
} as const

/**
 * API endpoint builder utility
 * Builds complete URLs by combining base URL, API version, and endpoint paths
 */
export class ApiEndpointBuilder {
  private config: ApiConfig

  constructor(config: ApiConfig = defaultApiConfig) {
    this.config = config
  }

  /**
   * Build complete URL for an endpoint
   * @param endpoint - Endpoint path from API_ENDPOINTS
   * @returns Complete URL string
   */
  build(endpoint: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    const apiVersion = this.config.apiVersion.replace(/^\//, '').replace(/\/$/, '') // Remove leading/trailing slashes
    const endpointPath = endpoint.replace(/^\//, '') // Remove leading slash
    
    return `${baseUrl}/${apiVersion}/${endpointPath}`
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   * @param newConfig - Partial configuration to merge
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

/**
 * Global endpoint builder instance
 */
export const endpointBuilder = new ApiEndpointBuilder()

/**
 * Utility function to get a complete API URL
 * @param endpoint - Endpoint path from API_ENDPOINTS
 * @returns Complete URL string
 */
export const getApiUrl = (endpoint: string): string => {
  return endpointBuilder.build(endpoint)
}

/**
 * Update API configuration at runtime
 * @param config - New configuration to apply
 */
export const updateApiConfig = (config: Partial<ApiConfig>): void => {
  endpointBuilder.updateConfig(config)
}

/**
 * Environment-specific configurations
 */
export const ENV_CONFIGS = {
  development: {
    baseUrl: 'http://localhost:8080',
    timeout: 30000,
    enableLogging: true,
    apiVersion: '/api',
  },
  staging: {
    baseUrl: 'http://localhost:8080',
    timeout: 30000,
    enableLogging: true,
    apiVersion: '/api',
  },
  production: {
    baseUrl: 'http://localhost',
    timeout: 30000,
    enableLogging: false,
    apiVersion: '/api',
  },
} as const

/**
 * Apply environment-specific configuration
 * @param env - Environment name
 */
export const applyEnvConfig = (env: keyof typeof ENV_CONFIGS): void => {
  const config = ENV_CONFIGS[env]
  if (config) {
    updateApiConfig(config)
  }
} 