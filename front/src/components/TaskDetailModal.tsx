import React, { useState, useEffect } from 'react'
import { Modal, Descriptions, Spin, Alert, Tag, Progress } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { api } from '../api'
import type { TaskStatusDto } from '../types/api'
import { getStatusColor, getStatusText } from '../types/api'

interface TaskDetailModalProps {
  taskId: string | null
  visible: boolean
  onClose: () => void
}

/**
 * Task Detail Modal Component
 * Displays detailed information about a specific print task
 */
const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, visible, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [taskDetail, setTaskDetail] = useState<TaskStatusDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches task details from API
   * @param id - Task ID to fetch details for
   */
  const fetchTaskDetail = async (id: string) => {
    setLoading(true)
    setError(null)
    setTaskDetail(null)

    try {
      const response = await api.get<TaskStatusDto>(`/api/print/task/${id}/status`)
      
      if (response.code === 1000) {
        setTaskDetail(response.data)
      } else {
        setError('Failed to fetch task details.')
      }
    } catch (err) {
      // Error handling is done by API interceptors
      console.error('Failed to fetch task detail:', err)
      setError('Failed to fetch task details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && taskId) {
      fetchTaskDetail(taskId)
    }
  }, [visible, taskId])

  /**
   * Handles modal close and cleanup
   */
  const handleClose = () => {
    setTaskDetail(null)
    setError(null)
    onClose()
  }

  /**
   * Formats ISO date string to localized date/time
   * @param dateTime - ISO date string
   * @returns Formatted date/time string
   */
  const formatDateTime = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleString()
    } catch {
      return dateTime
    }
  }

  /**
   * Renders the modal content based on loading/error/data state
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert
          message="Error Loading Task Details"
          description={error}
          type="error"
          showIcon
          className="my-4"
        />
      )
    }

    if (!taskDetail) {
      return null
    }

    return (
      <div className="space-y-6">
        {/* Task Status and Progress */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Tag color={getStatusColor(taskDetail.status)} className="text-sm">
                {getStatusText(taskDetail.status)}
              </Tag>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <Progress 
                percent={taskDetail.progress} 
                size="small"
                className="w-24"
                strokeColor={getStatusColor(taskDetail.status)}
              />
            </div>
          </div>
          
          {taskDetail.message && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700">Message:</span>
              <p className="text-sm text-gray-600 mt-1">{taskDetail.message}</p>
            </div>
          )}
        </div>

        {/* Task Details */}
        <Descriptions
          bordered
          column={1}
          size="small"
          labelStyle={{ width: '30%' }}
          className="[&_.ant-descriptions-item-label]:font-bold"
        >
          <Descriptions.Item label="Task ID">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {taskDetail.taskId}
            </code>
          </Descriptions.Item>
          
          <Descriptions.Item label="File Type">
            <Tag color="blue">{taskDetail.fileType.toUpperCase()}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Printer ID">
            {taskDetail.printerId}
          </Descriptions.Item>
          
          <Descriptions.Item label="Copies">
            {taskDetail.copies}
          </Descriptions.Item>
          
          <Descriptions.Item label="Paper Size">
            {taskDetail.paperSize}
          </Descriptions.Item>
          
          <Descriptions.Item label="Duplex Mode">
            <Tag color={taskDetail.duplex === 'duplex' ? 'green' : 'default'}>
              {taskDetail.duplex === 'duplex' ? 'Duplex' : 'Simplex'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Color Mode">
            <Tag color={taskDetail.colorMode === 'color' ? 'orange' : 'default'}>
              {taskDetail.colorMode === 'color' ? 'Color' : 'Grayscale'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Submit Time">
            {formatDateTime(taskDetail.submitTime)}
          </Descriptions.Item>
        </Descriptions>
      </div>
    )
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <span>Task Details</span>
          {taskId && (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {taskId.length > 8 ? `${taskId.slice(0, 8)}...` : taskId}
            </code>
          )}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      maskClosable={false}
      closeIcon={<CloseOutlined />}
    >
      {renderContent()}
    </Modal>
  )
}

export default TaskDetailModal 