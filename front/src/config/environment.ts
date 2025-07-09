/**
 * Environment Configuration
 * Centralizes environment variable handling and provides type-safe access to environment settings
 */

import { updateApiConfig, type ApiConfig } from '../api/config'

/**
 * Environment variables interface
 */
interface EnvironmentVariables {
  /** API base URL */
  VITE_API_BASE_URL?: string
  /** Application environment */
  VITE_APP_ENV?: 'development' | 'staging' | 'production'
  /** Enable API logging */
  VITE_API_LOGGING?: string
  /** API timeout */
  VITE_API_TIMEOUT?: string
  /** API version prefix */
  VITE_API_VERSION?: string
}

/**
 * Get environment variable with type safety
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Environment variable value or default
 */
const getEnvVar = (key: keyof EnvironmentVariables, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue
}

/**
 * Get boolean environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Boolean value
 */
const getBooleanEnvVar = (key: keyof EnvironmentVariables, defaultValue: boolean): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

/**
 * Get number environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Number value
 */
const getNumberEnvVar = (key: keyof EnvironmentVariables, defaultValue: number): number => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Current environment configuration
 */
export const environment = {
  /** Current environment */
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  /** Is development environment */
  isDevelopment: import.meta.env.DEV || false,
  /** Is production environment */
  isProduction: import.meta.env.PROD || false,
  /** Application environment */
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development'),
  /** API base URL */
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
  /** API logging enabled */
  API_LOGGING: getBooleanEnvVar('VITE_API_LOGGING', import.meta.env.DEV || false),
  /** API timeout */
  API_TIMEOUT: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
  /** API version prefix */
  API_VERSION: getEnvVar('VITE_API_VERSION', '/api'),
} as const

/**
 * Apply environment configuration to API client
 * This should be called during application initialization
 */
export const applyEnvironmentConfig = (): void => {
  const apiConfig: Partial<ApiConfig> = {
    baseUrl: environment.API_BASE_URL,
    timeout: environment.API_TIMEOUT,
    enableLogging: environment.API_LOGGING,
    apiVersion: environment.API_VERSION,
  }

  updateApiConfig(apiConfig)
}

/**
 * Get current environment name
 * @returns Environment name
 */
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  return environment.APP_ENV as 'development' | 'staging' | 'production'
}

/**
 * Environment-specific configuration
 */
export const environmentConfig = {
  development: {
    apiBaseUrl: 'http://localhost:8080',
    enableLogging: true,
    timeout: 30000,
  },
  staging: {
    apiBaseUrl: 'http://localhost:8080',
    enableLogging: true,
    timeout: 30000,
  },
  production: {
    apiBaseUrl: 'http://localhost',
    enableLogging: false,
    timeout: 30000,
  },
} as const

/**
 * Update API configuration for specific environment
 * @param env - Environment name
 */
export const setEnvironment = (env: keyof typeof environmentConfig): void => {
  const config = environmentConfig[env]
  if (config) {
    updateApiConfig({
      baseUrl: config.apiBaseUrl,
      enableLogging: config.enableLogging,
      timeout: config.timeout,
    })
  }
}

/**
 * Runtime configuration utilities
 */
export const runtimeConfig = {
  /**
   * Update API base URL at runtime
   * @param baseUrl - New base URL
   */
  setApiBaseUrl: (baseUrl: string): void => {
    updateApiConfig({ baseUrl })
  },

  /**
   * Toggle API logging at runtime
   * @param enabled - Whether logging is enabled
   */
  setApiLogging: (enabled: boolean): void => {
    updateApiConfig({ enableLogging: enabled })
  },

  /**
   * Update API timeout at runtime
   * @param timeout - New timeout in milliseconds
   */
  setApiTimeout: (timeout: number): void => {
    updateApiConfig({ timeout })
  },

  /**
   * Get current API configuration
   * @returns Current API configuration
   */
  getApiConfig: (): ApiConfig => {
    return {
      baseUrl: environment.API_BASE_URL,
      timeout: environment.API_TIMEOUT,
      enableLogging: environment.API_LOGGING,
      apiVersion: environment.API_VERSION,
    }
  },
} 