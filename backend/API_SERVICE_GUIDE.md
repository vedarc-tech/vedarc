# VEDARC Internship Platform - API Service Guide

## Overview

The `src/services/apiService.js` file contains a centralized API service that handles all backend communication for the VEDARC Internship Platform. This service provides a clean, consistent interface for making API calls and managing authentication.

## Features

- **Centralized API Management**: All API endpoints are organized in one place
- **Automatic Authentication**: Tokens are automatically included in requests
- **Error Handling**: Consistent error handling across all API calls
- **Type-Specific APIs**: Separate APIs for students, HR, and admin users
- **Authentication Helpers**: Easy token management and user type detection

## API Structure

### 1. Public API (`publicAPI`)
For unauthenticated endpoints:

```javascript
import { publicAPI } from '../services/apiService'

// Get all internship tracks
const internships = await publicAPI.getInternships()

// Register a new student
const response = await publicAPI.registerStudent({
  fullName: 'John Doe',
  email: 'john@example.com',
  whatsapp: '+1234567890',
  collegeName: 'Example University',
  track: 'Basic Frontend',
  yearOfStudy: '3rd Year',
  passoutYear: 2025
})
```

### 2. Student API (`studentAPI`)
For student-specific endpoints:

```javascript
import { studentAPI } from '../services/apiService'

// Student login
const response = await studentAPI.login({
  user_id: 'VEDARC-FE-001',
  password: 'password123'
})

// Get internship details
const details = await studentAPI.getInternshipDetails()

// Submit assignment
await studentAPI.submitAssignment({
  week: 1,
  githubLink: 'https://github.com/username/repo',
  deployedLink: 'https://app.vercel.app',
  description: 'Assignment description'
})
```

### 3. HR API (`hrAPI`)
For HR-specific endpoints:

```javascript
import { hrAPI } from '../services/apiService'

// HR login
const response = await hrAPI.login({
  username: 'hr@vedarc.co.in',
  password: 'vedarc_hr_2024'
})

// Get pending registrations
const registrations = await hrAPI.getPendingRegistrations({
  track: 'Basic Frontend',
  date: '2024-01-01'
})

// Activate user
await hrAPI.activateUser({
  user_id: 'VEDARC-FE-001',
  payment_id: 'PAY123456'
})
```

### 4. Admin API (`adminAPI`)
For admin-specific endpoints:

```javascript
import { adminAPI } from '../services/apiService'

// Admin login
const response = await adminAPI.login({
  username: 'admin@vedarc.co.in',
  password: 'vedarc_admin_2024'
})

// Get all users
const users = await adminAPI.getUsers({
  track: 'Basic Frontend',
  status: 'Active'
})

// Add new internship track
await adminAPI.addInternship({
  track_name: 'Advanced React',
  duration: '6 weeks',
  description: 'Advanced React concepts'
})

// Add weekly content
await adminAPI.addWeek({
  week_number: 1,
  title: 'Introduction to React',
  description: 'Learn React basics',
  track: 'Basic Frontend'
})

// Update submission status
await adminAPI.updateSubmission('submission_id', 'Approved')

// Upload certificate
await adminAPI.uploadCertificate({
  user_id: 'VEDARC-FE-001'
})
```

## Authentication Service (`authService`)

The authentication service provides helper functions for managing user sessions:

```javascript
import { authService } from '../services/apiService'

// Check if user is authenticated
if (authService.isAuthenticated()) {
  console.log('User is logged in')
}

// Get current user type
const userType = authService.getUserType() // 'student', 'hr', or 'admin'

// Get current token
const token = authService.getToken()

// Set token for a user type
authService.setToken('student', 'access_token_here')

// Clear all tokens (logout)
authService.clearTokens()

// Detect user type from username
const detectedType = authService.detectUserType('VEDARC-FE-001') // returns 'student'
const detectedType2 = authService.detectUserType('hr@vedarc.co.in') // returns 'hr'
```

## Error Handling

All API calls include automatic error handling:

```javascript
try {
  const response = await studentAPI.login(credentials)
  // Handle success
} catch (error) {
  // Error is automatically handled and includes user-friendly message
  console.error('Login failed:', error.message)
  setError(error.message)
}
```

## Usage Examples in Components

### Login Component
```javascript
import { studentAPI, hrAPI, adminAPI, authService } from '../services/apiService'

const handleLogin = async (credentials) => {
  const userType = authService.detectUserType(credentials.username)
  
  try {
    let response
    switch (userType) {
      case 'student':
        response = await studentAPI.login(credentials)
        break
      case 'hr':
        response = await hrAPI.login(credentials)
        break
      case 'admin':
        response = await adminAPI.login(credentials)
        break
    }
    
    authService.setToken(userType, response.access_token)
    // Redirect to appropriate dashboard
  } catch (error) {
    setError(error.message)
  }
}
```

### Dashboard Component
```javascript
import { studentAPI, authService } from '../services/apiService'

const StudentDashboard = () => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    if (authService.isAuthenticated() && authService.getUserType() === 'student') {
      fetchData()
    }
  }, [])
  
  const fetchData = async () => {
    try {
      const internshipData = await studentAPI.getInternshipDetails()
      setData(internshipData)
    } catch (error) {
      console.error('Failed to fetch data:', error.message)
    }
  }
}
```

## Configuration

The API base URL is configured in the service file:

```javascript
const API_BASE_URL = 'http://localhost:5000/api'
```

To change the backend URL, update this constant in `src/services/apiService.js`.

## Benefits for Developers

1. **Consistency**: All API calls follow the same pattern
2. **Maintainability**: Changes to API endpoints only need to be made in one place
3. **Type Safety**: Clear separation between different user types
4. **Error Handling**: Centralized error handling reduces code duplication
5. **Authentication**: Automatic token management
6. **Documentation**: Clear examples and usage patterns

## Best Practices

1. **Always use try-catch**: Wrap API calls in try-catch blocks
2. **Check authentication**: Use `authService.isAuthenticated()` before making authenticated calls
3. **Handle loading states**: Show loading indicators during API calls
4. **Validate data**: Validate form data before sending to API
5. **Use appropriate API**: Use the correct API (studentAPI, hrAPI, adminAPI) for each user type

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if user is authenticated and token is valid
2. **Network Error**: Verify backend server is running and accessible
3. **CORS Error**: Ensure backend allows requests from frontend domain
4. **Token Expired**: Clear tokens and redirect to login

### Debug Tips

1. Check browser console for error messages
2. Verify API base URL is correct
3. Ensure proper user type detection
4. Check if all required fields are provided

This centralized API service makes it easy for developers to work with the backend without worrying about authentication, error handling, or endpoint management. 