// API Response Types

/**
 * Printer status enumeration
 */
export type PrinterStatus = 'online' | 'offline' | 'busy' | 'error'

/**
 * Printer data transfer object
 */
export interface PrinterDto {
  /** Unique printer identifier */
  id: string
  /** Human-readable printer name */
  name: string
  /** Current printer status */
  status: PrinterStatus
  /** Optional printer description */
  description?: string
}

/**
 * Print job status enumeration
 */
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'

/**
 * Duplex mode enumeration
 */
export type DuplexMode = 'simplex' | 'duplex'

/**
 * Color mode enumeration
 */
export type ColorMode = 'color' | 'grayscale'

/**
 * Print job data transfer object
 */
export interface PrintJobDto {
  /** Unique print job identifier */
  id: string
  /** Associated task identifier */
  taskId: string
  /** Name of the file being printed */
  fileName: string
  /** File size in bytes */
  fileSize: number
  /** Name of the printer handling the job */
  printerName: string
  /** Current status of the print job */
  status: PrintJobStatus
  /** Number of copies requested */
  copies: number
  /** Paper size specification */
  paperSize: string
  /** Duplex printing mode */
  duplex: DuplexMode
  /** Color printing mode */
  colorMode: ColorMode
  /** ISO 8601 timestamp of creation */
  createdAt: string
  /** ISO 8601 timestamp of last update */
  updatedAt: string
}

/**
 * Queue scheduler status enumeration
 */
export type SchedulerStatus = 'running' | 'stopped' | 'paused'

/**
 * Queue statistics breakdown
 */
export interface QueueStats {
  /** Number of jobs pending execution */
  pending: number
  /** Number of jobs currently being processed */
  processing: number
  /** Number of jobs completed successfully */
  completed: number
  /** Number of jobs that failed */
  failed: number
}

/**
 * Queue status data transfer object
 */
export interface QueueStatusDto {
  /** Total number of jobs in the queue */
  queueSize: number
  /** Detailed breakdown of queue statistics */
  queueStats: QueueStats
  /** Current status of the job scheduler */
  schedulerStatus: SchedulerStatus
}

/**
 * Task execution status enumeration
 */
export type TaskStatus = 'PENDING' | 'PROCESSING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

/**
 * Task progress percentage (0-100)
 */
export type TaskProgress = number

/**
 * Task status data transfer object
 */
export interface TaskStatusDto {
  /** Unique task identifier */
  taskId: string
  /** Current execution status */
  status: TaskStatus
  /** Status message or error description */
  message: string
  /** Task completion progress (0-100) */
  progress: TaskProgress
  /** File type/extension */
  fileType: string
  /** Target printer identifier */
  printerId: string
  /** Number of copies requested */
  copies: number
  /** Paper size specification */
  paperSize: string
  /** Duplex printing mode */
  duplex: DuplexMode
  /** Color printing mode */
  colorMode: ColorMode
  /** ISO 8601 timestamp of task submission */
  submitTime: string
}

/**
 * API request for print job submission
 */
export interface PrintRequestDto {
  /** Target printer identifier */
  printerId: string
  /** File to be printed */
  file: File
  /** Number of copies requested */
  copies: number
  /** Paper size specification */
  paperSize: string
  /** Duplex printing mode */
  duplex: DuplexMode
  /** Color printing mode */
  colorMode: ColorMode
}

/**
 * Form data for print job configuration
 */
export interface PrintFormData {
  /** Number of copies requested */
  copies: number
  /** Paper size specification */
  paperSize: string
  /** Duplex printing mode */
  duplex: DuplexMode
  /** Color printing mode */
  colorMode: ColorMode
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response code (1000 = success, others = error) */
  code: number
  /** Response message */
  message: string
  /** Response data payload */
  data: T
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Error code */
  code: number
  /** Error message */
  message: string
  /** Optional error details */
  details?: string
}

/**
 * Paper size specification type
 */
export type PaperSize = 'A4' | 'Letter' | 'A3' | 'Legal'

/**
 * File extension type for supported formats
 */
export type SupportedFileExtension = '.pdf' | '.doc' | '.docx'

/**
 * MIME type for supported file formats
 */
export type SupportedMimeType = 
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * Option interface for form select components
 */
export interface SelectOption<T> {
  value: T
  label: string
}

/**
 * Paper size options for form selection
 */
export const PAPER_SIZE_OPTIONS: readonly SelectOption<PaperSize>[] = [
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'A3', label: 'A3' },
  { value: 'Legal', label: 'Legal' }
] as const

/**
 * Duplex mode options for form selection
 */
export const DUPLEX_OPTIONS: readonly SelectOption<DuplexMode>[] = [
  { value: 'simplex', label: 'Simplex' },
  { value: 'duplex', label: 'Duplex' }
] as const

/**
 * Color mode options for form selection
 */
export const COLOR_MODE_OPTIONS: readonly SelectOption<ColorMode>[] = [
  { value: 'color', label: 'Color' },
  { value: 'grayscale', label: 'Grayscale' }
] as const

/**
 * Supported file extensions for upload
 */
export const SUPPORTED_FILE_TYPES: readonly SupportedFileExtension[] = ['.pdf', '.doc', '.docx']

/**
 * Maximum file size for upload (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Supported MIME types for file validation
 */
export const SUPPORTED_MIME_TYPES: readonly SupportedMimeType[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

/**
 * Task information stored in local storage
 */
export interface StoredTaskInfo {
  /** Task identifier */
  taskId: string
  /** Original file name */
  fileName: string
  /** Target printer identifier */
  printerId: string
  /** Target printer name */
  printerName: string
  /** ISO 8601 timestamp of submission */
  submittedAt: string
}

/**
 * Task status with additional local information
 */
export interface TaskWithInfo extends TaskStatusDto {
  /** File name from local storage */
  fileName?: string
  /** Printer name from local storage */
  printerName?: string
}

/**
 * API error code constants
 */
export const ApiErrorCode = {
  /** Success */
  SUCCESS: 1000,
  /** File format not supported */
  UNSUPPORTED_FILE_FORMAT: 2001,
  /** File size exceeds limit */
  FILE_SIZE_EXCEEDED: 2002,
  /** File upload failed */
  FILE_UPLOAD_FAILED: 2003,
  /** Printer not found */
  PRINTER_NOT_FOUND: 3001,
  /** Printer offline */
  PRINTER_OFFLINE: 3002,
  /** Printer busy */
  PRINTER_BUSY: 3003,
  /** Printer error */
  PRINTER_ERROR: 3004,
  /** Invalid print parameters */
  INVALID_PARAMETERS: 3005,
  /** Print job creation failed */
  PRINT_JOB_FAILED: 3006,
  /** Task not found */
  TASK_NOT_FOUND: 4001,
  /** Internal server error */
  SERVER_ERROR: 5000
} as const

/**
 * API error code type
 */
export type ApiErrorCodeType = typeof ApiErrorCode[keyof typeof ApiErrorCode]

/**
 * Ant Design tag color type for status indicators
 */
export type StatusTagColor = 'blue' | 'orange' | 'green' | 'red' | 'default'

/**
 * Get Ant Design tag color for task status
 * @param status - Task execution status
 * @returns Appropriate color for the status tag
 */
export const getStatusColor = (status: TaskStatus): StatusTagColor => {
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

/**
 * Get human-readable text for task status
 * @param status - Task execution status
 * @returns Formatted status text for display
 */
export const getStatusText = (status: TaskStatus): string => {
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