import React from 'react'
import { Card, Descriptions, Tag, Typography } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons'
import type { QueueStatusDto, SchedulerStatus } from '../types/api'

const { Text } = Typography

interface QueueStatusCardProps {
  queueStatus: QueueStatusDto | null
  updateInterval: number
}

/**
 * Queue Status Overview Card Component
 * Displays real-time queue statistics and scheduler status
 */
const QueueStatusCard: React.FC<QueueStatusCardProps> = React.memo(({ queueStatus, updateInterval }) => {
  /**
   * Get scheduler status icon based on current status
   */
  const getSchedulerIcon = (status: SchedulerStatus) => {
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

  if (!queueStatus) {
    return (
      <Card 
        title="Queue Status Overview" 
        className="mb-6 shadow-lg"
        extra={
          <div className="flex items-center space-x-2">
            <Text className="text-sm text-gray-500">
              Auto-refresh every {updateInterval / 1000}s
            </Text>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        }
      >
        <div className="flex items-center justify-center py-8">
          <Text className="text-gray-500">Loading queue status...</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Queue Status Overview" 
      className="mb-6 shadow-lg"
      extra={
        <div className="flex items-center space-x-2">
          <Text className="text-sm text-gray-500">
            Auto-refresh every {updateInterval / 1000}s
          </Text>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      }
    >
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
    </Card>
  )
})

QueueStatusCard.displayName = 'QueueStatusCard'

export default QueueStatusCard 