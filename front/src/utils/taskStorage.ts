/**
 * Task Storage Utility for managing task IDs in localStorage
 */
const TASK_IDS_KEY = 'webprint_task_ids'

/**
 * Interface for stored task information
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
 * Task Storage Utility Class
 * Manages task information persistence in localStorage
 */
export class TaskStorage {
  /**
   * Adds a new task to storage with automatic cleanup
   * @param taskInfo - Complete task information to store
   */
  static addTask(taskInfo: StoredTaskInfo): void {
    const existingTasks = this.getTasks()
    const updatedTasks = [taskInfo, ...existingTasks]
    
    // Keep only the last 100 tasks to prevent unlimited growth
    const limitedTasks = updatedTasks.slice(0, 100)
    
    localStorage.setItem(TASK_IDS_KEY, JSON.stringify(limitedTasks))
  }

  /**
   * Gets all stored task information
   * @returns Array of stored task information
   */
  static getTasks(): StoredTaskInfo[] {
    try {
      const storedTasks = localStorage.getItem(TASK_IDS_KEY)
      return storedTasks ? JSON.parse(storedTasks) : []
    } catch (error) {
      console.error('Error reading task IDs from localStorage:', error)
      return []
    }
  }

  /**
   * Gets only task IDs for API calls
   * @returns Array of task IDs
   */
  static getTaskIds(): string[] {
    return this.getTasks().map(task => task.taskId)
  }

  /**
   * Removes a specific task from storage
   * @param taskId - Task ID to remove
   */
  static removeTask(taskId: string): void {
    const existingTasks = this.getTasks()
    const updatedTasks = existingTasks.filter(task => task.taskId !== taskId)
    localStorage.setItem(TASK_IDS_KEY, JSON.stringify(updatedTasks))
  }

  /**
   * Clears all stored task information
   */
  static clearAllTasks(): void {
    localStorage.removeItem(TASK_IDS_KEY)
  }

  /**
   * Gets specific task information by ID
   * @param taskId - Task ID to look up
   * @returns Task information if found, undefined otherwise
   */
  static getTaskInfo(taskId: string): StoredTaskInfo | undefined {
    const tasks = this.getTasks()
    return tasks.find(task => task.taskId === taskId)
  }

  /**
   * Updates existing task information
   * @param taskId - Task ID to update
   * @param updates - Partial updates to apply
   */
  static updateTaskInfo(taskId: string, updates: Partial<StoredTaskInfo>): void {
    const tasks = this.getTasks()
    const taskIndex = tasks.findIndex(task => task.taskId === taskId)
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
      localStorage.setItem(TASK_IDS_KEY, JSON.stringify(tasks))
    }
  }

  /**
   * Cleans up old completed tasks (older than 7 days)
   */
  static cleanupOldTasks(): void {
    const tasks = this.getTasks()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const recentTasks = tasks.filter(task => {
      const submittedAt = new Date(task.submittedAt)
      return submittedAt > sevenDaysAgo
    })
    
    localStorage.setItem(TASK_IDS_KEY, JSON.stringify(recentTasks))
  }
} 