import React from 'react'
import { Card, Button, Typography, Tag } from 'antd'
import { PrinterOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { PrinterDto } from '../types/api'

const { Text } = Typography

interface PrinterCardProps {
  printer: PrinterDto
  className?: string
}

const PrinterCard: React.FC<PrinterCardProps> = ({ printer, className }) => {
  const navigate = useNavigate()

  const handleSelectPrinter = () => {
    navigate(`/print/${printer.id}`, {
      state: {
        printerId: printer.id,
        printerName: printer.name
      }
    })
  }

  const getStatusColor = (status: PrinterDto['status']) => {
    switch (status) {
      case 'online':
        return 'success'
      case 'offline':
        return 'default'
      case 'busy':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: PrinterDto['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircleOutlined />
      case 'offline':
        return <CloseCircleOutlined />
      case 'busy':
        return <ExclamationCircleOutlined />
      case 'error':
        return <ExclamationCircleOutlined />
      default:
        return <PrinterOutlined />
    }
  }

  const getStatusText = (status: PrinterDto['status']) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'offline':
        return 'Offline'
      case 'busy':
        return 'Busy'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  const isDisabled = printer.status === 'offline' || printer.status === 'error'

  return (
    <Card
      className={`w-full md:w-80 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className || ''}`}
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <PrinterOutlined className="text-blue-600 text-2xl" />
        <div className="flex-1 min-w-0">
          <Text className="text-xl font-semibold text-gray-900 block truncate">
            {printer.name}
          </Text>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          <Tag 
            color={getStatusColor(printer.status)} 
            icon={getStatusIcon(printer.status)}
            className="flex items-center space-x-1"
          >
            {getStatusText(printer.status)}
          </Tag>
        </div>
      </div>

      {printer.description && (
        <div className="mb-4">
          <Text className="text-sm text-gray-600 block">
            {printer.description}
          </Text>
        </div>
      )}

      <Button
        type="primary"
        block
        size="large"
        disabled={isDisabled}
        onClick={handleSelectPrinter}
        className="bg-blue-600 hover:bg-blue-700 border-blue-600 disabled:bg-gray-400 disabled:border-gray-400"
      >
        Select and Print
      </Button>
      
      {isDisabled && (
        <div className="mt-2 text-center">
          <Text className="text-xs text-gray-500">
            This printer is currently unavailable
          </Text>
        </div>
      )}
    </Card>
  )
}

export default PrinterCard 