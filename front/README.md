# WebPrint Frontend

A modern, responsive React application for managing network printers and print jobs. Built with TypeScript, Tailwind CSS, and Ant Design components.

## 🚀 Features

- **Printer Management**: View and select from available network printers
- **File Upload**: Upload PDF, DOC, DOCX files with drag-and-drop support
- **Print Configuration**: Configure copies, paper size, duplex mode, and color settings
- **Real-time Monitoring**: Track print job status and queue statistics
- **Task Management**: View detailed task information and progress
- **Error Handling**: Comprehensive error handling with user-friendly notifications
- **Responsive Design**: Mobile-first design that works on all devices
- **Performance Optimized**: Code splitting and bundle optimization

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (no custom CSS)
- **UI Components**: Ant Design
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite
- **Development**: ESLint, TypeScript strict mode

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v18+ recommended)
- npm or yarn package manager
- WebPrint backend service running on `localhost:8080`

## 🚦 Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd webPrint/front

# Install dependencies
npm install
```

### 2. Environment Setup

The application is pre-configured to connect to the backend at `http://localhost:8080`. If your backend runs on a different port, update the proxy configuration in `vite.config.ts`.

### 3. Development

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### 4. Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/                    # API layer with axios configuration
│   └── index.ts           # Unified API client with error handling
├── components/            # Reusable UI components
│   ├── HealthStatusCard.tsx    # Backend health monitoring
│   ├── PrinterCard.tsx        # Printer display component
│   ├── QueueStatusCard.tsx     # Queue statistics display
│   ├── TaskDetailModal.tsx     # Task detail modal
│   └── TaskTable.tsx           # Task list table
├── pages/                 # Page components
│   ├── FileUploadPage.tsx      # File upload and print configuration
│   ├── HealthCheckPage.tsx     # Health monitoring page
│   ├── PrinterListPage.tsx     # Main printer selection page
│   └── PrintQueuePage.tsx      # Print queue management
├── types/                 # TypeScript type definitions
│   └── api.ts             # API interfaces and types
├── utils/                 # Utility functions
│   └── taskStorage.ts     # localStorage management
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Tailwind CSS imports only
```

## 🔧 Configuration

### API Configuration

The API client is configured in `src/api/index.ts` with:

- Automatic error handling for all API responses
- Request/response interceptors for logging
- Unified error messaging with Ant Design notifications
- Loading state management

### Styling Guidelines

This project strictly follows these styling principles:

- **Tailwind CSS Only**: All styling uses Tailwind utility classes
- **No Custom CSS**: The `src/index.css` contains only Tailwind directives
- **Ant Design Components**: UI components from Ant Design with Tailwind styling
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Code Standards

- **TypeScript Strict Mode**: All code is fully typed with no `any` usage
- **Performance Optimized**: Uses React.memo, useCallback, useMemo for optimization
- **Component Architecture**: Single responsibility principle with reusable components
- **JSDoc Documentation**: Comprehensive documentation for all functions and components

## 🔗 API Integration

The application integrates with the WebPrint backend through these endpoints:

### Health Check
- `GET /actuator/health` - Backend service health status

### Printer Management
- `GET /api/print/printers` - List available printers

### Print Job Management
- `POST /api/print/upload` - Submit print job with file
- `GET /api/print/task/{taskId}/status` - Get task status
- `GET /api/print/queue/status` - Get queue statistics

### Error Handling

The application handles these error codes:

- **1000**: Success
- **2001-2003**: File-related errors (format, size, upload)
- **3001-3006**: Printer-related errors (offline, busy, error)
- **4001**: Task not found
- **5000**: Server errors

## 🎯 Usage Guide

### 1. Printer Selection
1. Navigate to the main page to view available printers
2. Check printer status (Online, Offline, Busy, Error)
3. Click "Select and Print" on an available printer

### 2. File Upload and Configuration
1. Drag and drop or click to select a file (PDF, DOC, DOCX)
2. Configure print settings:
   - Number of copies (1-999)
   - Paper size (A4, Letter, A3, Legal)
   - Duplex mode (Simplex/Duplex)
   - Color mode (Color/Grayscale)
3. Click "Submit Print Job"

### 3. Queue Management
1. View real-time queue statistics
2. Monitor submitted jobs with progress indicators
3. Click on task IDs to view detailed information
4. Auto-refresh every 5 seconds

## 🔧 Development Guidelines

### Adding New Components

1. Create components in appropriate directories (`src/components/` or `src/pages/`)
2. Use TypeScript with explicit type definitions
3. Add JSDoc comments for documentation
4. Use React.memo for performance optimization
5. Style with Tailwind CSS classes only

### API Integration

1. All API calls should use the unified `api` instance from `src/api/index.ts`
2. Error handling is automatic through interceptors
3. Use loading states with the provided utilities
4. Type all API responses with interfaces from `src/types/api.ts`

### Performance Best Practices

1. Use `useCallback` for event handlers
2. Use `useMemo` for expensive computations
3. Use `React.memo` for components that receive props
4. Optimize bundle size with code splitting

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend is running on `localhost:8080`
   - Check proxy configuration in `vite.config.ts`

2. **File Upload Errors**
   - Verify file format (PDF, DOC, DOCX only)
   - Check file size (50MB maximum)

3. **Build Errors**
   - Run `npm install` to ensure dependencies are installed
   - Check TypeScript errors with `npm run build`

### Performance Issues

1. **Large Bundle Size**
   - The build is optimized with code splitting
   - Ant Design is isolated in its own chunk
   - Consider lazy loading for additional optimization

2. **Slow Loading**
   - Enable gzip compression on your web server
   - Use the production build (`npm run build`)

## 📈 Performance Metrics

The optimized build produces:

- **Main Application**: ~222KB (compressed: ~70KB)
- **Ant Design UI**: ~943KB (compressed: ~293KB)
- **React Vendor**: ~46KB (compressed: ~17KB)
- **Utilities**: ~35KB (compressed: ~14KB)

Total compressed size: ~394KB

## 🤝 Contributing

1. Follow the existing code style and TypeScript conventions
2. Add JSDoc comments for new functions and components
3. Use only Tailwind CSS for styling
4. Test all changes thoroughly
5. Ensure no TypeScript errors before committing

## 📄 License

This project is part of the WebPrint network printing solution.

---

For more information about the backend API, refer to the WebPrint backend documentation.
