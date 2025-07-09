import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Typography, Button, Card, Descriptions, Table, Tag, Progress, Spin, Alert } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { api } from '../api'
import TaskDetailModal from '../components/TaskDetailModal'
import { TaskStorage } from '../utils/taskStorage'
import type { QueueStatusDto, TaskStatusDto } from '../types/api'
import { getStatusColor, getStatusText } from '../types/api'

const { Content } = Layout
const { Title, Text, Link } = Typography

interface LocationState {
  taskId?: string
}

interface TaskWithInfo extends TaskStatusDto {
  fileName?: string
  printerName?: string
}

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

  const handleBack = () => {
    navigate('/')
  }

  // Fetch queue status
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

  // Fetch task details for all stored task IDs
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

  // Fetch all data
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

  // Handle refresh button
  const handleRefresh = () => {
    fetchAllData()
  }

  // Handle task ID click
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setModalVisible(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false)
    setSelectedTaskId(null)
  }

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

  // Get scheduler status icon
  const getSchedulerIcon = (status: QueueStatusDto['schedulerStatus']) => {
    switch (status) {
      case 'running':
        return <PlayCircleOutlined className="text-green-500" />
      case 'paused':
        return <PauseCircleOutlined className="text-orange-500" />
      case 'stopped':
        return <StopOutlined className="text-red-500" />
      default:
        return null
    }
  }

  // Table columns definition
  const columns: ColumnsType<TaskWithInfo> = [
    {
      title: 'Task ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
      render: (taskId: string) => (
        <Link 
          onClick={() => handleTaskClick(taskId)}
          className="font-mono text-blue-600 hover:text-blue-800"
        >
          {taskId.length > 8 ? `${taskId.slice(0, 8)}...` : taskId}
        </Link>
      ),
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName: string) => fileName || 'N/A',
    },
    {
      title: 'Printer',
      dataIndex: 'printerName',
      key: 'printerName',
      render: (printerName: string, record) => printerName || record.printerId,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatusDto['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record) => (
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor={getStatusColor(record.status)}
          trailColor="#f0f0f0"
        />
      ),
    },
    {
      title: 'Submit Time',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 150,
      render: (submitTime: string) => {
        try {
          return new Date(submitTime).toLocaleString()
        } catch {
          return submitTime
        }
      },
    },
  ]

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
          <Card 
            title="Queue Status Overview" 
            className="mb-6 shadow-lg"
            extra={
              <div className="flex items-center space-x-2">
                <Text className="text-sm text-gray-500">
                  Auto-refresh every {UPDATE_INTERVAL / 1000}s
                </Text>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            }
          >
            {queueStatus ? (
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="Queue Size">
                  <Text className="text-lg font-semibold text-blue-600">
                    {queueStatus.queueSize}
                  </Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Scheduler Status">
                  <div className="flex items-center space-x-2">
                    {getSchedulerIcon(queueStatus.schedulerStatus)}
                    <Text className="capitalize font-medium">
                      {queueStatus.schedulerStatus}
                    </Text>
                  </div>
                </Descriptions.Item>
                
                <Descriptions.Item label="Pending">
                  <Tag color="blue">{queueStatus.queueStats.pending}</Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Processing">
                  <Tag color="orange">{queueStatus.queueStats.processing}</Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Completed">
                  <Tag color="green">{queueStatus.queueStats.completed}</Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Failed">
                  <Tag color="red">{queueStatus.queueStats.failed}</Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Spin size="large" />
                <Text className="ml-4 text-gray-600">Loading queue status...</Text>
              </div>
            )}
          </Card>

          {/* Job List */}
          <Card title="Print Jobs" className="shadow-lg">
            <Table
              columns={columns}
              dataSource={tasks}
              rowKey="taskId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} jobs`
              }}
              locale={{
                emptyText: "No print jobs available"
              }}
              className="bg-white"
              scroll={{ x: 800 }}
              rowClassName={(record) => 
                record.taskId === state?.taskId ? 'bg-blue-50' : ''
              }
              onRow={(record) => ({
                id: `task-${record.taskId}`,
              })}
            />
          </Card>

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