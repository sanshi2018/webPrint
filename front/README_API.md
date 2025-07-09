# WebPrint API System Documentation

## Overview

The WebPrint frontend now uses a highly generalized API utility class that provides:

1. **Unified error handling** - All API errors are automatically handled and propagated consistently
2. **Configurable base URL** - IP address and port can be configured via environment variables or at runtime
3. **Abstracted endpoints** - No more hardcoded URLs in components
4. **Type-safe responses** - Full TypeScript support with proper error types
5. **Automatic error interruption** - Failed requests throw errors to interrupt the execution chain

## Architecture

### Core Components

1. **`src/api/config.ts`** - Configuration and endpoint definitions
2. **`src/api/service.ts`** - Main API service class with organized methods
3. **`src/api/index.ts`** - Enhanced axios client with interceptors
4. **`src/config/environment.ts`** - Environment configuration utilities

### API Service Structure

```typescript
apiService.printers.list()           // GET /api/printers
apiService.printers.getStatus(id)    // GET /api/printers/{id}/status
apiService.tasks.getStatus(id)       // GET /api/print/task/{id}/status
apiService.print.submit(data)        // POST /api/print/submit
apiService.queue.getStatus()         // GET /api/print/queue/status
// ... and more
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_APP_ENV=development
VITE_API_LOGGING=true
VITE_API_TIMEOUT=30000
VITE_API_VERSION=/api
```

### Predefined Environments

The system comes with three predefined environments:

```typescript
// Development (default)
baseUrl: 'http://127.0.0.1:8080'
enableLogging: true

// Staging
baseUrl: 'http://127.0.0.1:8080'
enableLogging: true

// Production
baseUrl: 'http://127.0.0.1'
enableLogging: false
```

### Runtime Configuration

You can change the configuration at runtime:

```typescript
import { runtimeConfig } from './config/environment'

// Change base URL
runtimeConfig.setApiBaseUrl('http://192.168.1.100:8080')

// Toggle logging
runtimeConfig.setApiLogging(false)

// Change timeout
runtimeConfig.setApiTimeout(60000)
```

## Usage Examples

### Basic API Calls

```typescript
import { apiService, ApiServiceError } from '../api/service'

// Old way (deprecated)
const response = await api.get<TaskStatusDto>(`/api/print/task/${id}/status`)

// New way
try {
  const taskStatus = await apiService.tasks.getStatus(id)
  console.log(taskStatus)
} catch (error) {
  if (error instanceof ApiServiceError) {
    console.error(`API Error [${error.code}]: ${error.message}`)
  }
}
```

### Printer Management

```typescript
// Get all printers
const printers = await apiService.printers.list()

// Get specific printer status
const printer = await apiService.printers.getStatus(printerId)

// Get printer details
const details = await apiService.printers.getDetail(printerId)
```

### Print Job Management

```typescript
// Submit a print job
const taskId = await apiService.print.submit({
  file: fileObject,
  printerId: 'printer-123',
  copies: 2,
  paperSize: 'A4',
  duplex: 'duplex',
  colorMode: 'color'
})

// Get print jobs
const jobs = await apiService.print.getJobs()

// Cancel a print job
await apiService.print.cancelJob(jobId)
```

### Task Management

```typescript
// Get all tasks
const tasks = await apiService.tasks.list()

// Get task status
const taskStatus = await apiService.tasks.getStatus(taskId)

// Cancel a task
await apiService.tasks.cancel(taskId)
```

### Queue Management

```typescript
// Get queue status
const queueStatus = await apiService.queue.getStatus()

// Manage queue
await apiService.queue.pause()
await apiService.queue.resume()
await apiService.queue.clear()
```

## Error Handling

### Automatic Error Handling

The API service automatically handles all errors and shows appropriate notifications:

- **Server errors (5xxx)**: Prominent notification alerts
- **Client errors (4xxx)**: Less intrusive message alerts
- **Printer errors (3xxx)**: Contextual error messages
- **File errors (2xxx)**: Validation error messages

### Custom Error Handling

For custom error handling, catch `ApiServiceError`:

```typescript
try {
  const result = await apiService.tasks.getStatus(taskId)
  // Handle success
} catch (error) {
  if (error instanceof ApiServiceError) {
    // Handle specific error codes
    switch (error.code) {
      case 4001:
        // Task not found
        break
      case 5000:
        // Server error
        break
      default:
        // Other errors
    }
  }
  // Error chain is automatically interrupted
}
```

## Migration Guide

### From Old API System

**Before:**
```typescript
import { api } from '../api'

const response = await api.get<TaskStatusDto>(`/api/print/task/${id}/status`)
if (response.code === 1000) {
  setTaskDetail(response.data)
} else {
  setError('Failed to fetch task details.')
}
```

**After:**
```typescript
import { apiService, ApiServiceError } from '../api/service'

try {
  const taskDetail = await apiService.tasks.getStatus(id)
  setTaskDetail(taskDetail)
} catch (error) {
  if (error instanceof ApiServiceError) {
    setError(error.message)
  } else {
    setError('Failed to fetch task details.')
  }
}
```

### Benefits of Migration

1. **Cleaner code**: No more manual response.code checking
2. **Better error handling**: Automatic error interruption and consistent error messages
3. **Type safety**: Full TypeScript support with proper error types
4. **Maintainability**: Centralized endpoint definitions
5. **Flexibility**: Easy to change base URLs and configuration

## Advanced Features

### Custom Endpoint Builder

For edge cases, you can use the endpoint builder directly:

```typescript
import { getApiUrl, API_ENDPOINTS } from '../api/config'

const customUrl = getApiUrl(API_ENDPOINTS.TASKS.STATUS('task-123'))
// Returns: "http://127.0.0.1:8080/api/print/task/task-123/status"
```

### Safe API Calls

For additional error context:

```typescript
import { safeApiCall } from '../api/service'

const result = await safeApiCall(
  () => apiService.tasks.getStatus(taskId),
  'Failed to fetch task status from queue page'
)
```

### Environment Detection

```typescript
import { getCurrentEnvironment, environment } from '../config/environment'

if (getCurrentEnvironment() === 'development') {
  console.log('Development mode - API logging enabled')
}

console.log('Current API base URL:', environment.API_BASE_URL)
```

## Configuration Examples

### Docker Environment

```dockerfile
ENV VITE_API_BASE_URL=http://webprint-backend:8080
ENV VITE_APP_ENV=production
ENV VITE_API_LOGGING=false
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webprint-frontend-config
data:
  VITE_API_BASE_URL: "http://webprint-backend-service:8080"
  VITE_APP_ENV: "production"
  VITE_API_LOGGING: "false"
```

### Development with Different Backend

```bash
# .env.local
VITE_API_BASE_URL=http://192.168.1.100:3000
VITE_API_LOGGING=true
```

## Best Practices

1. **Always use apiService** instead of direct API calls
2. **Handle ApiServiceError** for specific error scenarios
3. **Use environment variables** for different deployment environments
4. **Don't hardcode URLs** - use the endpoint definitions
5. **Test error scenarios** with different error codes
6. **Use TypeScript** for better type safety
7. **Configure logging** appropriately for each environment

## Troubleshooting

### Common Issues

1. **CORS errors**: Check if base URL is correct
2. **Timeout errors**: Increase timeout in configuration
3. **Network errors**: Verify backend service is running
4. **Type errors**: Ensure proper TypeScript types are imported

### Debug Mode

Enable debug logging in development:

```typescript
import { runtimeConfig } from './config/environment'

runtimeConfig.setApiLogging(true)
```

### Health Check

Use the health endpoint to verify backend connectivity:

```typescript
try {
  const health = await apiService.health.check()
  console.log('Backend status:', health.status)
} catch (error) {
  console.error('Backend is not accessible')
}
```

## Future Enhancements

1. **Request caching** for frequently accessed data
2. **Request deduplication** for concurrent identical requests
3. **Offline support** with request queuing
4. **Authentication tokens** integration
5. **Request/response transformation** middleware
6. **Real-time updates** via WebSocket integration 