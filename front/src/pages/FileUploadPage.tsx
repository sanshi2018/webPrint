import React, { useState } from 'react'
import { Layout, Typography, Button, Form, Upload, InputNumber, Select, Radio, Modal, message } from 'antd'
import { ArrowLeftOutlined, InboxOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import type { UploadFile, UploadProps } from 'antd/es/upload'
import type { PrintFormData, ApiResponse } from '../types/api'
import { TaskStorage } from '../utils/taskStorage'
import { 
  PAPER_SIZE_OPTIONS, 
  DUPLEX_OPTIONS, 
  COLOR_MODE_OPTIONS, 
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE 
} from '../types/api'

const { Content } = Layout
const { Title, Text } = Typography
const { Dragger } = Upload
const { Option } = Select

interface LocationState {
  printerId?: string
  printerName?: string
}

const FileUploadPage: React.FC = () => {
  const navigate = useNavigate()
  const { printerId } = useParams<{ printerId: string }>()
  const location = useLocation()
  const state = location.state as LocationState
  
  const [form] = Form.useForm<PrintFormData>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState<boolean>(false)

  const currentPrinterId = printerId || state?.printerId
  const currentPrinterName = state?.printerName || `Printer ${currentPrinterId}`

  const handleBack = () => {
    navigate(-1)
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    const isValidType = SUPPORTED_MIME_TYPES.includes(file.type) || 
                       SUPPORTED_FILE_TYPES.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      message.error('Unsupported file format. Please select a PDF, DOC, or DOCX file.')
      return false
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error(`File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return false
    }

    return true
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: SUPPORTED_FILE_TYPES.join(','),
    fileList,
    beforeUpload: (file) => {
      if (!validateFile(file)) {
        return Upload.LIST_IGNORE
      }
      setFileList([file])
      return false // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([])
    },
    onChange: (info) => {
      // Handle file list changes
      const { fileList: newFileList } = info
      setFileList(newFileList)
    }
  }

  const handleSubmit = async (values: PrintFormData) => {
    if (fileList.length === 0) {
      message.error('Please select a file to print.')
      return
    }

    if (!currentPrinterId) {
      message.error('Printer ID is missing. Please go back and select a printer.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', fileList[0] as any)
      formData.append('printerId', currentPrinterId)
      formData.append('copies', values.copies.toString())
      formData.append('paperSize', values.paperSize)
      formData.append('duplex', values.duplex)
      formData.append('colorMode', values.colorMode)

      const response = await axios.post<ApiResponse<{ taskId: string }>>('/api/print/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.code === 1000) {
        const taskId = response.data.data.taskId
        
        // Store task information in localStorage
        TaskStorage.addTask({
          taskId,
          fileName: fileList[0].name,
          printerId: currentPrinterId,
          printerName: currentPrinterName,
          submittedAt: new Date().toISOString()
        })
        
        Modal.success({
          title: 'Print job submitted successfully!',
          content: `Task ID: ${taskId}`,
          onOk: () => {
            navigate('/tasks', {
              state: { taskId }
            })
          }
        })
      } else {
        const errorMessages: { [key: number]: string } = {
          2001: 'Unsupported file format.',
          2002: 'File size exceeds limit.',
          2003: 'File upload failed.',
          3001: 'Printer not found.',
          3002: 'Printer offline.',
          3003: 'Printer busy.',
          3004: 'Printer error.',
          3005: 'Invalid print parameters.',
          3006: 'Print job creation failed.',
          4001: 'Authentication failed.',
          5000: 'Internal server error.'
        }

        const errorMessage = errorMessages[response.data.code] || 'Unknown error occurred.'
        
        Modal.error({
          title: 'Print job submission failed',
          content: `${errorMessage} (Error Code: ${response.data.code})`
        })
      }
    } catch (error) {
      console.error('Print job submission failed:', error)
      Modal.error({
        title: 'Print job submission failed',
        content: 'Network error or server unavailable. Please try again later. (Error Code: 5000)'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              Back to Printer List
            </Button>
            
            <Title level={2} className="text-gray-800 mb-2">
              File Upload and Print
            </Title>
            
            <Text className="text-lg font-medium text-gray-700 mb-4 block">
              Selected Printer: {currentPrinterName}
            </Text>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                copies: 1,
                paperSize: 'A4',
                duplex: 'simplex',
                colorMode: 'grayscale'
              }}
            >
              {/* File Upload Area */}
              <Form.Item
                label="File to Print"
                required
                className="mb-6"
              >
                <Dragger {...uploadProps} className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className="text-4xl text-gray-400" />
                  </p>
                  <p className="ant-upload-text text-lg font-medium text-gray-700">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint text-sm text-gray-500">
                    Supports PDF, DOC, DOCX files. Maximum file size: 50MB
                  </p>
                </Dragger>
              </Form.Item>

              {/* Print Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label="Number of Copies"
                  name="copies"
                  rules={[
                    { required: true, message: 'Please enter number of copies' },
                    { type: 'number', min: 1, max: 999, message: 'Copies must be between 1 and 999' }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={999}
                    className="w-full"
                    placeholder="Enter number of copies"
                  />
                </Form.Item>

                <Form.Item
                  label="Paper Size"
                  name="paperSize"
                  rules={[{ required: true, message: 'Please select paper size' }]}
                >
                  <Select placeholder="Select paper size">
                    {PAPER_SIZE_OPTIONS.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Duplex Mode"
                  name="duplex"
                  rules={[{ required: true, message: 'Please select duplex mode' }]}
                >
                  <Radio.Group>
                    {DUPLEX_OPTIONS.map(option => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="Color Mode"
                  name="colorMode"
                  rules={[{ required: true, message: 'Please select color mode' }]}
                >
                  <Radio.Group>
                    {COLOR_MODE_OPTIONS.map(option => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* Submit Button */}
              <Form.Item className="mb-0 mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={uploading}
                  disabled={fileList.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-12 text-lg font-medium"
                >
                  {uploading ? 'Submitting Print Job...' : 'Submit Print Job'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default FileUploadPage 