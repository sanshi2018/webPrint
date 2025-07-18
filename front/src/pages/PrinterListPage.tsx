import React, { useState, useEffect } from 'react'
import { Layout, Typography, Button, List, Spin, Alert, Empty } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { apiService, ApiServiceError } from '../api/service'
import PrinterCard from '../components/PrinterCard'
import type { PrinterDto } from '../types/api'

const { Content } = Layout
const { Title } = Typography

/**
 * Printer List Page Component
 * Displays a list of available printers with their status and allows selection
 */
const PrinterListPage: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches printer list from API
   */
  const fetchPrinters = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const printerData = await apiService.printers.list()
      setPrinters(printerData)
    } catch (err) {
      // Error handling is done by API service
      if (err instanceof ApiServiceError) {
        setError(err.message)
      } else {
        setError('Unable to retrieve printer list.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrinters()
  }, [])

  /**
   * Handles refresh button click
   */
  const handleRefresh = () => {
    fetchPrinters()
  }

  /**
   * Renders the main content based on loading/error/data state
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading printer list...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert
          message="Error Loading Printers"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )
    }

    if (printers.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-gray-600">
              No available printers detected. Please ensure the printer is connected and powered on, 
              and check the backend service status.
            </span>
          }
        />
      )
    }

    return (
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 4,
        }}
        dataSource={printers}
        renderItem={(printer) => (
          <List.Item>
            <PrinterCard printer={printer} />
          </List.Item>
        )}
      />
    )
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <Title level={1} className="text-3xl font-bold text-gray-800 mb-6">
              Available Printers
            </Title>
            <p className="text-lg text-gray-600 mb-6">
              Select a printer to start printing your documents
            </p>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="mb-4 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
              size="large"
            >
              Refresh Printer List
            </Button>
          </div>
          
          <div className="w-full">
            {renderContent()}
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default PrinterListPage 