// API Response Types
export interface PrinterDto {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'error'
  description?: string
}

export interface PrintJobDto {
  id: string
  taskId: string
  fileName: string
  fileSize: number
  printerName: string
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  copies: number
  paperSize: string
  duplex: 'simplex' | 'duplex'
  colorMode: 'color' | 'grayscale'
  createdAt: string
  updatedAt: string
}

// Queue Status Response
export interface QueueStatusDto {
  queueSize: number
  queueStats: {
    pending: number
    processing: number
    completed: number
    failed: number
  }
  schedulerStatus: 'running' | 'stopped' | 'paused'
}

// Task Status Response
export interface TaskStatusDto {
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  message: string
  progress: number // 0-100
  fileType: string
  printerId: string
  copies: number
  paperSize: string
  duplex: 'simplex' | 'duplex'
  colorMode: 'color' | 'grayscale'
  submitTime: string
}

// API Request Types
export interface PrintRequestDto {
  printerId: string
  file: File
  copies: number
  paperSize: string
  duplex: 'simplex' | 'duplex'
  colorMode: 'color' | 'grayscale'
}

// Form Types
export interface PrintFormData {
  copies: number
  paperSize: string
  duplex: 'simplex' | 'duplex'
  colorMode: 'color' | 'grayscale'
}

// API Response Wrapper
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Error Response
export interface ApiError {
  code: number
  message: string
  details?: string
}

// Paper Size Options
export const PAPER_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'A3', label: 'A3' },
  { value: 'Legal', label: 'Legal' }
] as const

// Duplex Options
export const DUPLEX_OPTIONS = [
  { value: 'simplex', label: 'Simplex' },
  { value: 'duplex', label: 'Duplex' }
] as const

// Color Mode Options
export const COLOR_MODE_OPTIONS = [
  { value: 'color', label: 'Color' },
  { value: 'grayscale', label: 'Grayscale' }
] as const

// File Upload Constants
export const SUPPORTED_FILE_TYPES = ['.pdf', '.doc', '.docx']
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

// Task Status Utilities
export const getStatusColor = (status: TaskStatusDto['status']) => {
  switch (status) {
    case 'PENDING':
      return 'blue'
    case 'PROCESSING':
    case 'PRINTING':
      return 'orange'
    case 'COMPLETED':
      return 'green'
    case 'FAILED':
    case 'CANCELLED':
      return 'red'
    default:
      return 'default'
  }
}

export const getStatusText = (status: TaskStatusDto['status']) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'PROCESSING':
      return 'Processing'
    case 'PRINTING':
      return 'Printing'
    case 'COMPLETED':
      return 'Completed'
    case 'FAILED':
      return 'Failed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
} 