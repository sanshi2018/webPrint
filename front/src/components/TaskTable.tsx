import React, { useMemo, useCallback } from 'react'
import { Table, Tag, Progress, Typography, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TaskStatusDto, TaskWithInfo } from '../types/api'
import { getStatusColor, getStatusText } from '../types/api'

const { Link } = Typography

interface TaskTableProps {
  tasks: TaskWithInfo[]
  loading: boolean
  onTaskClick: (taskId: string) => void
}

/**
 * Task Table Component
 * Displays task list with status, progress, and clickable task IDs
 */
const TaskTable: React.FC<TaskTableProps> = React.memo(({ tasks, loading, onTaskClick }) => {
  /**
   * Handle task ID click
   */
  const handleTaskClick = useCallback((taskId: string) => {
    onTaskClick(taskId)
  }, [onTaskClick])

  /**
   * Format datetime for display
   */
  const formatDateTime = useCallback((submitTime: string) => {
    try {
      return new Date(submitTime).toLocaleString()
    } catch {
      return submitTime
    }
  }, [])

  /**
   * Memoized table columns definition
   */
  const columns: ColumnsType<TaskWithInfo> = useMemo(() => [
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
      render: (printerName: string, record: TaskWithInfo) => printerName || record.printerId,
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
      render: (progress: number, record: TaskWithInfo) => (
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
      render: (submitTime: string) => formatDateTime(submitTime),
    },
  ], [handleTaskClick, formatDateTime])

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">My Print Jobs</h3>
        <p className="text-sm text-gray-600 mt-1">
          {tasks.length === 0 ? 'No print jobs found' : `${tasks.length} job(s) found`}
        </p>
      </div>
      
      <Table<TaskWithInfo>
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="taskId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  No print jobs found. Submit a print job to see it here.
                </span>
              }
            />
          )
        }}
        scroll={{ x: 800 }}
        size="small"
        className="border-0"
      />
    </div>
  )
})

TaskTable.displayName = 'TaskTable'

export default TaskTable 