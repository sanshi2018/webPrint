import React, { useState, useEffect } from 'react'
import { Card, Alert, Spin, Button } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'

interface HealthStatus {
  status: string
}

interface HealthStatusCardProps {
  className?: string
}

const HealthStatusCard: React.FC<HealthStatusCardProps> = ({ className }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get<HealthStatus>('http://localhost:8080/actuator/health')
      setHealthStatus(response.data)
    } catch (err) {
      setError('Failed to fetch health status. Please check network connection or backend service.')
      setHealthStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
  }, [])

  const handleRefresh = () => {
    fetchHealthStatus()
  }

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