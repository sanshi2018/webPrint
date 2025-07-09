import { useState } from 'react'
import { Layout, Typography, Button } from 'antd'
import { PrinterOutlined, HeartOutlined } from '@ant-design/icons'
import HealthCheckPage from './pages/HealthCheckPage'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'health'>('home')

  if (currentPage === 'health') {
    return <HealthCheckPage onBack={() => setCurrentPage('home')} />
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-600 shadow-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <PrinterOutlined className="text-white text-2xl" />
            <Title level={3} className="text-white m-0">
              WebPrint
            </Title>
          </div>
          <Button
            icon={<HeartOutlined />}
            onClick={() => setCurrentPage('health')}
            type="text"
            className="text-white hover:text-gray-200"
          >
            Health Check
          </Button>
        </div>
      </Header>
      
      <Content className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Title level={1} className="text-gray-800 mb-6">
              Welcome to WebPrint
            </Title>
            <p className="text-lg text-gray-600 mb-8">
              Remote printer control and file printing service
            </p>
            <div className="space-x-4">
              <Button 
                type="primary" 
                size="large"
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                Get Started
              </Button>
              <Button
                icon={<HeartOutlined />}
                onClick={() => setCurrentPage('health')}
                size="large"
                className="border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700"
              >
                System Health
              </Button>
            </div>
          </div>
        </div>
      </Content>
      
      <Footer className="bg-gray-800 text-white text-center py-4">
        <p className="m-0">WebPrint © 2024 - Remote Printing Solution</p>
      </Footer>
    </Layout>
  )
}

export default App
