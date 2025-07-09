// Task Storage Utility for managing task IDs in localStorage
const TASK_IDS_KEY = 'webprint_task_ids'

export interface StoredTaskInfo {
  taskId: string
  fileName: string
  printerId: string
  printerName: string
  submittedAt: string
}

export class TaskStorage {
  // Add a new task ID to storage
  static addTask(taskInfo: StoredTaskInfo): void {
    const existingTasks = this.getTasks()
    const updatedTasks = [taskInfo, ...existingTasks]
    
    // Keep only the last 100 tasks to prevent unlimited growth
    const limitedTasks = updatedTasks.slice(0, 100)
    
    localStorage.setItem(TASK_IDS_KEY, JSON.stringify(limitedTasks))
  }

  // Get all stored task IDs
  static getTasks(): StoredTaskInfo[] {
    try {
      const storedTasks = localStorage.getItem(TASK_IDS_KEY)
      return storedTasks ? JSON.parse(storedTasks) : []
    } catch (error) {
      console.error('Error reading task IDs from localStorage:', error)
      return []
    }
  }

  // Get task IDs only (for API calls)
  static getTaskIds(): string[] {
    return this.getTasks().map(task => task.taskId)
  }

  // Remove a task ID from storage
  static removeTask(taskId: string): void {
    const existingTasks = this.getTasks()
    const updatedTasks = existingTasks.filter(task => task.taskId !== taskId)
    localStorage.setItem(TASK_IDS_KEY, JSON.stringify(updatedTasks))
  }

  // Clear all stored task IDs
  static clearAllTasks(): void {
    localStorage.removeItem(TASK_IDS_KEY)
  }

  // Get a specific task info by ID
  static getTaskInfo(taskId: string): StoredTaskInfo | undefined {
    const tasks = this.getTasks()
    return tasks.find(task => task.taskId === taskId)
  }

  // Update task info (useful for caching additional details)
  static updateTaskInfo(taskId: string, updates: Partial<StoredTaskInfo>): void {
    const tasks = this.getTasks()
    const taskIndex = tasks.findIndex(task => task.taskId === taskId)
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
      localStorage.setItem(TASK_IDS_KEY, JSON.stringify(tasks))
    }
  }

  // Clean up old completed tasks (older than 7 days)
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