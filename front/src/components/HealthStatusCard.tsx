import React, { useState, useEffect } from 'react'
import { Card, Alert, Spin, Button } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { apiService, ApiServiceError } from '../api/service'

interface HealthStatus {
  status: string
}

interface HealthStatusCardProps {
  className?: string
}

/**
 * Health Status Card Component
 * Displays backend service health status with real-time updates
 */
const HealthStatusCard: React.FC<HealthStatusCardProps> = ({ className }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches health status from backend API
   */
  const fetchHealthStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const healthData = await apiService.health.check()
      setHealthStatus(healthData)
    } catch (err) {
      // Error handling is done by API service
      if (err instanceof ApiServiceError) {
        setError(err.message)
      } else {
        setError('Failed to fetch health status.')
      }
      setHealthStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
  }, [])

  /**
   * Handles refresh button click
   */
  const handleRefresh = () => {
    fetchHealthStatus()
  }

  /**
   * Renders the card content based on loading/error/data state
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Checking backend service status...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert
          message="Backend Service Status: Error"
          description={error}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          className="mb-4"
        />
      )
    }

    if (healthStatus?.status === 'UP') {
      return (
        <Alert
          message="Backend Service Status: Normal"
          description="Backend service is running properly and ready to accept requests."
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
          className="mb-4"
        />
      )
    }

    return (
      <Alert
        message="Backend Service Status: Abnormal"
        description="Backend service status is not UP. Please check the service or contact administrator."
        type="warning"
        icon={<ExclamationCircleOutlined />}
        showIcon
        className="mb-4"
      />
    )
  }

  return (
    <Card 
      title="Health Check" 
      className={`w-full max-w-2xl shadow-lg ${className || ''}`}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
          type="text"
          className="text-blue-600 hover:text-blue-800"
        >
          Refresh
        </Button>
      }
    >
      {renderContent()}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">GET /actuator/health</code></p>
        <p>Last checked: {new Date().toLocaleString()}</p>
      </div>
    </Card>
  )
}

export default HealthStatusCard 