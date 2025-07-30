// API Service for VEDARC Internship Platform
// Centralized service for all backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vedarc.co.in/api'

// API Response Handler
const handleResponse = async (response, responseType = 'json') => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    
    try {
      const errorData = await response.json()
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch (e) {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage
    }
    
    const error = new Error(errorMessage)
    error.status = response.status
    error.response = response
    throw error
  }
  
  if (responseType === 'blob') {
    return { data: await response.blob() }
  }
  
  return await response.json()
}

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // Add authorization header if token exists
  const token = sessionStorage.getItem('student_token') || 
                sessionStorage.getItem('hr_token') || 
                sessionStorage.getItem('admin_token') ||
                sessionStorage.getItem('manager_token')
  
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`
  }

  // Add session ID header if exists
  const sessionId = sessionStorage.getItem('session_id')
  if (sessionId) {
    defaultOptions.headers['X-Session-ID'] = sessionId
  }

  const config = {
    ...defaultOptions,
    ...options,
  }

  // Only merge headers if options.headers exists
  if (options.headers) {
    config.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    }
  }

  const responseType = options.responseType || 'json'
  // Remove responseType from fetch options
  delete config.responseType

  try {
    const response = await fetch(url, config)
    return await handleResponse(response, responseType)
  } catch (error) {
    // Only log errors in production or when not a CORS error
    if (process.env.NODE_ENV === 'production' || !error.message.includes('Failed to fetch')) {
      console.error('API Request Error:', error)
    }
    throw error
  }
}

// ============================================================================
// PUBLIC API ENDPOINTS
// ============================================================================

export const publicAPI = {
  // Get all available internship tracks
  getInternships: () => apiRequest('/internships'),
  
  // Get featured projects for public showcase
  getFeaturedProjects: () => apiRequest('/featured-projects'),
  
  // Get company projects for public showcase
  getCompanyProjects: () => apiRequest('/company-projects'),
  
  // Register new student with payment
  registerStudent: (studentData) => apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),
  
  // Verify payment
  verifyPayment: (paymentData) => apiRequest('/verify-payment', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),
  // Get global system settings (public)
  getSystemSettings: () => apiRequest('/system/settings'),
  
  // AI Internship Application endpoints
  sendApplicationOtp: (formData) => {
    const data = new FormData()
    data.append('email', formData.email)
    data.append('fullName', formData.fullName)
    
    return fetch(`${API_BASE_URL}/internship-application/send-otp`, {
      method: 'POST',
      body: data
    }).then(response => response.json())
  },
  
  submitApplication: (formData) => {
    const data = new FormData()
    data.append('fullName', formData.fullName)
    data.append('email', formData.email)
    data.append('phoneNumber', formData.phoneNumber)
    data.append('linkedinUrl', formData.linkedinUrl)
    data.append('areaOfInterest', formData.areaOfInterest)
    data.append('whyJoin', formData.whyJoin)
    data.append('portfolioLinks', formData.portfolioLinks || '')
    data.append('otp', formData.otp)
    data.append('resume', formData.resume)
    
    return fetch(`${API_BASE_URL}/internship-application/submit`, {
      method: 'POST',
      body: data
    }).then(response => response.json())
  },
  
  // Waitlist subscription
  subscribeToWaitlist: (data) => apiRequest('/waitlist/subscribe', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Contact form submission
  submitContactForm: (data) => apiRequest('/contact/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Investor inquiry submission
  submitInvestorInquiry: (data) => apiRequest('/investor/inquiry', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// ============================================================================
// STUDENT API ENDPOINTS
// ============================================================================

export const studentAPI = {
  // Login student
  login: (credentials) => apiRequest('/student/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Logout student
  logout: () => apiRequest('/student/logout', {
    method: 'POST'
  }),
  
  // Get student's internship details
  getInternshipDetails: () => apiRequest('/student/internship-details'),
  
  // Get weeks for student's internship
  getWeeks: () => apiRequest('/student/weeks'),
  
  // Get student's submissions
  getSubmissions: () => apiRequest('/student/submissions'),
  
  // Get announcements for student
  getAnnouncements: () => apiRequest('/student/announcements'),
  
  // Submit assignment
  submitAssignment: async (data) => {
    return await apiRequest('/student/submit-assignment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  },
  
  // Get student's notifications
  getNotifications: () => apiRequest('/student/notifications'),
  
  // Mark notification as read
  markNotificationRead: (notificationId) => apiRequest(`/student/notifications/${notificationId}/read`, {
    method: 'POST'
  }),
  
  // Mark all notifications as read
  markAllNotificationsRead: () => apiRequest('/student/notifications/read-all', {
    method: 'POST'
  }),
  
  // Download certificate
  downloadCertificate: (certificateType) => apiRequest(`/student/certificates/${certificateType}`, {
    method: 'GET',
    responseType: 'blob'
  }),
  
  // Download certificate with custom positions (for completion certificate)
  downloadCertificateWithPositions: (data) => apiRequest('/student/certificates/completion', {
    method: 'POST',
    body: JSON.stringify(data),
    responseType: 'blob'
  }),

  // Mark daily completion
  markDailyCompletion: (data) => apiRequest('/student/daily-completion', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Get daily completion status for a week
  getDailyCompletion: (weekNumber) => apiRequest(`/student/daily-completion/${weekNumber}`),

  projectOptIn: (internshipId) => apiRequest('/student/project/optin', {
    method: 'POST',
    body: JSON.stringify({ internship_id: internshipId })
  }),

  submitProject: (data) => apiRequest('/student/project/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getProjectStatus: (internshipId) => apiRequest(`/student/project/status?internship_id=${internshipId}`),

  // Get project templates for student's internship track (for auto-assignment)
  getProjectTemplates: (internshipId) => apiRequest(`/student/project/templates?internship_id=${internshipId}`),

  // Auto-assign project when student reaches 100% completion
  autoAssignProject: (internshipId) => apiRequest('/student/project/auto-assign', {
    method: 'POST',
    body: JSON.stringify({ internship_id: internshipId })
  })
}

// ============================================================================
// HR API ENDPOINTS
// ============================================================================

export const hrAPI = {
  // Login HR
  login: (credentials) => apiRequest('/hr/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Logout HR
  logout: () => apiRequest('/hr/logout', {
    method: 'POST'
  }),
  
  // Get pending registrations
  getPendingRegistrations: (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.track) queryParams.append('track', filters.track)
    if (filters.date) queryParams.append('date', filters.date)
    
    return apiRequest(`/hr/pending-registrations?${queryParams}`)
  },
  
  // Get available tracks
  getAvailableTracks: () => apiRequest('/hr/available-tracks'),
  
  // Enable user (set status to Active)
  enableUser: (data) => apiRequest('/hr/activate-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: data.user_id })
  }),

  // Disable user (set status to Disabled)
  disableUser: (data) => apiRequest('/hr/deactivate-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: data.user_id, reason: data.reason })
  }),

  // Reset student password (HR)
  resetStudentPassword: (userId) => apiRequest('/hr/reset-student-password', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  }),

  // Get HR statistics
  getStatistics: () => apiRequest('/hr/statistics'),
  
  // Debug user status
  debugUserStatus: (userId) => apiRequest(`/hr/debug-user-status?user_id=${userId}`),
  
  // Fix inconsistent users
  fixInconsistentUsers: () => apiRequest('/hr/fix-inconsistent-users', {
    method: 'POST'
  }),

  // Bulk enable all paid, pending students
  bulkEnable: () => apiRequest('/hr/bulk-enable', {
    method: 'POST'
  }),

  // Bulk disable all enabled students
  bulkDisable: () => apiRequest('/hr/bulk-disable', {
    method: 'POST'
  }),

  // Get payment details for HR dashboard
  getPayments: () => apiRequest('/admin/payments', {
    method: 'GET'
  }),

  // Get all users (for HR dashboard list view)
  getAllUsers: () => apiRequest('/hr/pending-registrations', {
    method: 'GET'
  }),
  // Enable user (set status to Active)
  enableUser: (data) => apiRequest('/hr/activate-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: data.user_id })
  }),

  // Delete user permanently
  deleteUser: (deletionData) => apiRequest('/hr/delete-user', {
    method: 'POST',
    body: JSON.stringify(deletionData)
  }),

  // Get internship applications
  getInternshipApplications: (page = 1, limit = 10) => apiRequest(`/hr/internship-applications?page=${page}&limit=${limit}`),
  
  // Download resume
  downloadResume: (applicationId) => apiRequest(`/hr/internship-applications/${applicationId}/resume`, {
    method: 'GET',
    responseType: 'blob'
  }),
  
  // Delete application
  deleteApplication: (applicationId) => apiRequest(`/hr/internship-applications/${applicationId}`, {
    method: 'DELETE'
  }),
  
  // Get waitlist subscribers
  getWaitlistSubscribers: (page = 1, limit = 50) => apiRequest(`/hr/waitlist-subscribers?page=${page}&limit=${limit}`),
  
  // Get contact inquiries
  getContactInquiries: (page = 1, limit = 50) => apiRequest(`/hr/contact-inquiries?page=${page}&limit=${limit}`),
  
  // Get investor inquiries
  getInvestorInquiries: (page = 1, limit = 50) => apiRequest(`/hr/investor-inquiries?page=${page}&limit=${limit}`),
  
  // Update inquiry status
  updateInquiryStatus: (data) => apiRequest('/hr/update-inquiry-status', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// ============================================================================
// INTERNSHIP MANAGER API ENDPOINTS
// ============================================================================

export const managerAPI = {
  // Login manager
  login: (credentials) => apiRequest('/manager/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Logout manager
  logout: () => apiRequest('/manager/logout', {
    method: 'POST'
  }),
  
  // Get all internships managed by this manager
  getInternships: () => apiRequest('/manager/internships'),
  
  // Create new internship
  createInternship: (internshipData) => apiRequest('/manager/internships', {
    method: 'POST',
    body: JSON.stringify(internshipData)
  }),
  
  // Update internship
  updateInternship: (internshipId, internshipData) => apiRequest(`/manager/internships/${internshipId}`, {
    method: 'PUT',
    body: JSON.stringify(internshipData)
  }),
  
  // Delete internship
  deleteInternship: (internshipId) => apiRequest(`/manager/internships/${internshipId}`, {
    method: 'DELETE'
  }),
  
  // Get weeks for an internship
  getWeeks: (internshipId) => apiRequest(`/manager/internships/${internshipId}/weeks`),
  
  // Add week to internship
  addWeek: (internshipId, weekData) => apiRequest(`/manager/internships/${internshipId}/weeks`, {
    method: 'POST',
    body: JSON.stringify(weekData)
  }),
  
  // Update week
  updateWeek: (internshipId, weekId, weekData) => apiRequest(`/manager/internships/${internshipId}/weeks/${weekId}`, {
    method: 'PUT',
    body: JSON.stringify(weekData)
  }),
  
  // Delete week
  deleteWeek: (internshipId, weekId) => apiRequest(`/manager/internships/${internshipId}/weeks/${weekId}`, {
    method: 'DELETE'
  }),
  
  // Get announcements
  getAnnouncements: () => apiRequest('/manager/announcements'),
  
  // Create announcement
  createAnnouncement: (announcementData) => apiRequest('/manager/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData)
  }),
  
  // Update announcement
  updateAnnouncement: (announcementId, announcementData) => apiRequest(`/manager/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData)
  }),
  
  // Delete announcement
  deleteAnnouncement: (announcementId) => apiRequest(`/manager/announcements/${announcementId}`, {
    method: 'DELETE'
  }),
  
  // Get students for an internship
  getStudents: (internshipId) => apiRequest(`/manager/internships/${internshipId}/students`),
  
  // Get submissions for an internship
  getSubmissions: (internshipId, filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.week) queryParams.append('week', filters.week)
    if (filters.status) queryParams.append('status', filters.status)
    
    return apiRequest(`/manager/internships/${internshipId}/submissions?${queryParams}`)
  },
  
  // Review submission
  reviewSubmission: (submissionId, reviewData) => apiRequest(`/manager/submissions/${submissionId}/review`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  // Get students with certificate status
  getStudentsWithCertificates: (internshipId) => apiRequest(`/manager/students/${internshipId}`),

  // Export students data for CSV
  exportStudentsCSV: (internshipId) => apiRequest(`/manager/students-export/${internshipId}`),

  // Unlock certificate for student
  unlockCertificate: (data) => apiRequest('/manager/certificates/unlock', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Bulk unlock certificates
  bulkUnlockCertificates: (data) => apiRequest('/manager/certificates/bulk-unlock', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Generate certificate for student
  generateCertificate: (data) => apiRequest('/manager/certificates/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Recalculate completion percentages
  recalculateCompletion: () => apiRequest('/manager/recalculate-completion', {
    method: 'POST'
  }),

  // Project Template Management
  getProjectTemplates: (internshipId) => apiRequest(`/manager/project/templates?internship_id=${internshipId}`),

  createProjectTemplate: (data) => apiRequest('/manager/project/templates', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateProjectTemplate: (templateId, data) => apiRequest(`/manager/project/templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteProjectTemplate: (templateId) => apiRequest(`/manager/project/templates/${templateId}`, {
    method: 'DELETE'
  }),

  // Project Assignment (now uses template_id)
  assignProject: (data) => apiRequest('/manager/project/assign', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  listProjects: (internshipId) => apiRequest(`/manager/project/list?internship_id=${internshipId}`),

  reviewProject: (data) => apiRequest('/manager/project/review', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  // System settings endpoints
  getSystemSettings: () => apiRequest('/manager/system/settings'),
  updateSystemSettings: (settings) => apiRequest('/manager/system/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),
}

// ============================================================================
// ADMIN API ENDPOINTS
// ============================================================================

export const adminAPI = {
  // Login admin
  login: (credentials) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Logout admin
  logout: () => apiRequest('/admin/logout', {
    method: 'POST'
  }),
  
  // Get all users
  getUsers: (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.track) queryParams.append('track', filters.track)
    if (filters.status) queryParams.append('status', filters.status)
    
    return apiRequest(`/admin/users?${queryParams}`)
  },
  
  // Get all internships
  getInternships: () => apiRequest('/admin/internships'),
  
  // Get all submissions
  getSubmissions: (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.track) queryParams.append('track', filters.track)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.week) queryParams.append('week', filters.week)
    
    return apiRequest(`/admin/submissions?${queryParams}`)
  },
  
  // Add new internship track
  addInternship: (internshipData) => apiRequest('/admin/internships', {
    method: 'POST',
    body: JSON.stringify(internshipData)
  }),
  
  // Add weekly content
  addWeek: (weekData) => apiRequest('/admin/weeks', {
    method: 'POST',
    body: JSON.stringify(weekData)
  }),
  
  // Update submission status
  updateSubmission: (submissionId, status) => apiRequest(`/admin/submissions/${submissionId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  // Upload certificate
  uploadCertificate: (certificateData) => apiRequest('/admin/certificates', {
    method: 'POST',
    body: JSON.stringify(certificateData)
  }),

  // Reset any user's password (Admin)
  resetUserPassword: (userData) => apiRequest('/admin/reset-user-password', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Create new user account (Admin)
  createUser: (userData) => apiRequest('/admin/create-user', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Get all user types for dropdown
  getUserTypes: () => apiRequest('/admin/user-types'),

  // Generate certificate
  generateCertificate: (certificateData) => apiRequest('/admin/generate-certificate', {
    method: 'POST',
    body: JSON.stringify(certificateData),
    responseType: 'blob'
  }),

  // Generate certificate preview
  generateCertificatePreview: (previewData) => apiRequest('/admin/certificate-preview', {
    method: 'POST',
    body: JSON.stringify(previewData),
    responseType: 'blob'
  }),

  // Release certificate for student
  releaseCertificate: (studentId, certificateType) => apiRequest('/admin/release-certificate', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, certificate_type: certificateType })
  }),

  // Approve certificate unlock
  approveCertificate: (data) => apiRequest('/admin/certificate-approval', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Bulk approve certificates
  bulkApproveCertificates: (data) => apiRequest('/admin/certificate-approval/bulk', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Save certificate template
  setCertificateTemplate: (type, template) => apiRequest('/admin/certificate-template', {
    method: 'POST',
    body: JSON.stringify({ type, template })
  }),

  // Get certificate template by type
  getCertificateTemplate: (type) => apiRequest(`/admin/certificate-template?type=${type}`, {
    method: 'GET'
  }),

  // Upload template file (PDF or image)
  uploadTemplateFile: (formData) => apiRequest('/admin/certificate-template/upload', {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set Content-Type for FormData
  }),

  // Get available placeholder options
  getCertificatePlaceholders: () => apiRequest('/admin/certificate-placeholders', {
    method: 'GET'
  }),

  // Get all payment records for admin/HR dashboard
  getPayments: () => apiRequest('/admin/payments', {
    method: 'GET'
  }),
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const authService = {
  // Get current user type
  getUserType: () => {
    if (sessionStorage.getItem('student_token')) return 'student'
    if (sessionStorage.getItem('hr_token')) return 'hr'
    if (sessionStorage.getItem('manager_token')) return 'manager'
    if (sessionStorage.getItem('admin_token')) return 'admin'
    return null
  },
  
  // Get current token
  getToken: () => {
    return sessionStorage.getItem('student_token') || 
           sessionStorage.getItem('hr_token') || 
           sessionStorage.getItem('manager_token') ||
           sessionStorage.getItem('admin_token')
  },
  
  // Set token based on user type
  setToken: (userType, token) => {
    const tokenKey = `${userType}_token`
    sessionStorage.setItem(tokenKey, token)
  },
  
  // Set session ID
  setSessionId: (sessionId) => {
    sessionStorage.setItem('session_id', sessionId)
  },
  
  // Get session ID
  getSessionId: () => {
    return sessionStorage.getItem('session_id')
  },
  
  // Clear all tokens and session
  clearTokens: () => {
    sessionStorage.removeItem('student_token')
    sessionStorage.removeItem('hr_token')
    sessionStorage.removeItem('manager_token')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('session_id')
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(sessionStorage.getItem('student_token') || 
             sessionStorage.getItem('hr_token') || 
             sessionStorage.getItem('manager_token') ||
             sessionStorage.getItem('admin_token'))
  },
  
  // Detect user type from username
  detectUserType: (username) => {
    if (username.includes('@vedarc.co.in')) {
      if (username === 'hr@vedarc.co.in') return 'hr'
      if (username === 'admin@vedarc.co.in') return 'admin'
      if (username === 'manager@vedarc.co.in') return 'manager'
      return 'hr' // Default for other vedarc emails
    }
    if (username.startsWith('VEDARC-')) return 'student'
    return 'student' // Default
  },
  
  // Logout function
  logout: async () => {
    try {
      const userType = authService.getUserType()
      if (userType) {
        const logoutEndpoints = {
          student: '/student/logout',
          hr: '/hr/logout',
          admin: '/admin/logout',
          manager: '/manager/logout'
        }
        
        const endpoint = logoutEndpoints[userType]
        if (endpoint) {
          await apiRequest(endpoint, { method: 'POST' })
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authService.clearTokens()
    }
  }
}

// ============================================================================
// USAGE EXAMPLES FOR DEVELOPERS
// ============================================================================

/*
USAGE EXAMPLES:

1. Student Registration:
   const response = await publicAPI.registerStudent({
     fullName: 'John Doe',
     email: 'john@example.com',
     whatsapp: '+1234567890',
     collegeName: 'Example University',
     track: 'Basic Frontend',
     yearOfStudy: '3rd Year',
     passoutYear: 2025
   })

2. Student Login:
   const response = await studentAPI.login({
     user_id: 'VEDARC-FE-001',
     password: 'password123'
   })
   authService.setToken('student', response.access_token)

3. HR Login:
   const response = await hrAPI.login({
     username: 'hr@vedarc.co.in',
     password: 'vedarc_hr_2024'
   })
   authService.setToken('hr', response.access_token)

4. Manager Login:
   const response = await managerAPI.login({
     username: 'manager@vedarc.co.in',
     password: 'vedarc_manager_2024'
   })
   authService.setToken('manager', response.access_token)

5. Create Internship (Manager):
   await managerAPI.createInternship({
     track_name: 'Advanced React',
     duration: '6 weeks',
     description: 'Advanced React concepts',
     max_students: 50
   })

6. Add Week with Resources (Manager):
   await managerAPI.addWeek('internship_id', {
     week_number: 1,
     title: 'Introduction to React',
     description: 'Learn React basics',
     resources: [
       { title: 'React Documentation', link: 'https://react.dev' },
       { title: 'Video Tutorial', link: 'https://youtube.com/watch?v=...' }
     ]
   })

7. Create Announcement (Manager):
   await managerAPI.createAnnouncement({
     title: 'Important Update',
     content: 'Next week\'s assignment deadline has been extended',
     priority: 'high'
   })

8. Admin Login:
   const response = await adminAPI.login({
     username: 'admin@vedarc.co.in',
     password: 'vedarc_admin_2024'
   })
   authService.setToken('admin', response.access_token)

9. Reset Any User's Password (Admin):
   await adminAPI.resetUserPassword({
     user_id: 'VEDARC-FE-001',
     user_type: 'student'
   })

10. Create New User Account (Admin):
    await adminAPI.createUser({
      fullName: 'Jane Smith',
      email: 'jane@vedarc.co.in',
      username: 'jane.hr',
      user_type: 'hr',
      password: 'secure_password_123'
    })

11. Check Authentication:
    if (authService.isAuthenticated()) {
      const userType = authService.getUserType()
      console.log(`User is logged in as: ${userType}`)
    }

12. Logout:
    authService.clearTokens()
*/

export default {
  publicAPI,
  studentAPI,
  hrAPI,
  managerAPI,
  adminAPI,
  authService
}