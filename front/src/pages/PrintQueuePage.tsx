import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Typography, Button, Alert } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import TaskDetailModal from '../components/TaskDetailModal'
import QueueStatusCard from '../components/QueueStatusCard'
import TaskTable from '../components/TaskTable'
import { TaskStorage } from '../utils/taskStorage'
import type { QueueStatusDto, TaskStatusDto, TaskWithInfo } from '../types/api'

const { Content } = Layout
const { Title, Text } = Typography

interface LocationState {
  taskId?: string
}

/**
 * Print Queue Page Component
 * Displays real-time queue status and task management interface
 */
const PrintQueuePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  // State management
  const [loading, setLoading] = useState<boolean>(false)
  const [queueStatus, setQueueStatus] = useState<QueueStatusDto | null>(null)
  const [tasks, setTasks] = useState<TaskWithInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  
  // Real-time update interval
  const UPDATE_INTERVAL = 5000 // 5 seconds

  /**
   * Handles back button navigation to printer list
   */
  const handleBack = () => {
    navigate('/')
  }

  /**
   * Fetches queue status from API
   */
  const fetchQueueStatus = useCallback(async () => {
    try {
      const response = await api.get<QueueStatusDto>('/api/print/queue/status')
      if (response.code === 1000) {
        setQueueStatus(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch queue status:', err)
    }
  }, [])

  /**
   * Fetches task details for all stored task IDs from localStorage
   */
  const fetchTaskDetails = useCallback(async () => {
    const storedTasks = TaskStorage.getTasks()
    const taskIds = storedTasks.map(task => task.taskId)
    
    if (taskIds.length === 0) {
      setTasks([])
      return
    }

    try {
      // Fetch details for each task ID
      const taskPromises = taskIds.map(async (taskId) => {
        try {
          const response = await api.get<TaskStatusDto>(`/api/print/task/${taskId}/status`)
          if (response.code === 1000) {
            const taskData = response.data
            const storedInfo = TaskStorage.getTaskInfo(taskId)
            
            // Combine API data with stored info
            return {
              ...taskData,
              fileName: storedInfo?.fileName,
              printerName: storedInfo?.printerName
            } as TaskWithInfo
          }
        } catch (err) {
          console.error(`Failed to fetch task ${taskId}:`, err)
          return null
        }
        return null
      })

      const taskResults = await Promise.allSettled(taskPromises)
      const validTasks = taskResults
        .filter((result): result is PromiseFulfilledResult<TaskWithInfo> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)

      setTasks(validTasks)
    } catch (err) {
      console.error('Failed to fetch task details:', err)
      setError('Failed to load task details. Please try again.')
    }
  }, [])

  /**
   * Fetches all data (queue status and task details)
   */
  const fetchAllData = useCallback(async () => {
    if (!loading) {
      setLoading(true)
      setError(null)
      
      try {
        await Promise.all([
          fetchQueueStatus(),
          fetchTaskDetails()
        ])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }, [loading, fetchQueueStatus, fetchTaskDetails])

  /**
   * Handles refresh button click
   */
  const handleRefresh = useCallback(() => {
    fetchAllData()
  }, [fetchAllData])

  /**
   * Handles task ID click to show task details modal
   * @param taskId - The ID of the task to show details for
   */
  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
    setModalVisible(true)
  }, [])

  /**
   * Handles modal close action
   */
  const handleModalClose = useCallback(() => {
    setModalVisible(false)
    setSelectedTaskId(null)
  }, [])

  // Setup real-time updates
  useEffect(() => {
    // Initial load
    fetchAllData()
    
    // Cleanup old tasks
    TaskStorage.cleanupOldTasks()

    // Setup interval for real-time updates
    const interval = setInterval(() => {
      fetchQueueStatus()
      fetchTaskDetails()
    }, UPDATE_INTERVAL)

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [fetchAllData, fetchQueueStatus, fetchTaskDetails])

  // Highlight new task if navigated from upload page
  useEffect(() => {
    if (state?.taskId) {
      // Scroll to and highlight the new task
      setTimeout(() => {
        const element = document.getElementById(`task-${state.taskId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 1000)
    }
  }, [state?.taskId])



  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              Back to Printer List
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <Title level={2} className="text-gray-800 mb-2">
                  Print Job Management
                </Title>
                <Text className="text-lg text-gray-600">
                  Monitor and manage your print jobs in real-time
                </Text>
              </div>
              
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                size="large"
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-6"
              onClose={() => setError(null)}
            />
          )}

          {/* Queue Status Overview */}
          <QueueStatusCard 
            queueStatus={queueStatus}
            updateInterval={UPDATE_INTERVAL}
          />

          {/* Job List */}
          <TaskTable 
            tasks={tasks}
            loading={loading}
            onTaskClick={handleTaskClick}
          />

          {/* Task Detail Modal */}
          <TaskDetailModal
            taskId={selectedTaskId}
            visible={modalVisible}
            onClose={handleModalClose}
          />
        </div>
      </Content>
    </Layout>
  )
}

export default PrintQueuePage 