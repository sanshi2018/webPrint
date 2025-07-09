import React from 'react'
import { Layout, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import HealthStatusCard from '../components/HealthStatusCard'

const { Content } = Layout
const { Title } = Typography

interface HealthCheckPageProps {
  onBack?: () => void
}

const HealthCheckPage: React.FC<HealthCheckPageProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      // Fallback to reload if no onBack provided
      window.location.reload()
    }
  }

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
              Back to Home
            </Button>
            
            <Title level={2} className="text-gray-800 mb-2">
              System Health Check
            </Title>
            <p className="text-lg text-gray-600">
              Monitor the status of the WebPrint backend service
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <HealthStatusCard />
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default HealthCheckPage 