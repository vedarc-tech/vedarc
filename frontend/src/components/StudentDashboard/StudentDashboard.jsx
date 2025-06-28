import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGraduationCap, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaUpload, FaDownload, FaCalendarAlt, FaCode, FaTrophy, FaBook, FaPlay, FaUser, FaBullhorn, FaUsers, FaLink, FaFilter, FaSearch, FaEye, FaBell, FaTimes, FaInfoCircle, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { studentAPI, authService } from '../../services/apiService'
import './StudentDashboard.css'
import CertificateAdjustModal from './CertificateAdjustModal'

// Feature flag to temporarily disable certificate functionality
// To re-enable certificate features, change this to: const CERTIFICATE_FEATURE_ENABLED = true
// This will restore:
// - Certificate card in overview section
// - Certificate Requirements section
// - Certificate Download Modal
// - Certificate Adjust Modal
// - Certificate-related text in project section
const CERTIFICATE_FEATURE_ENABLED = false

// Feature flag to enable automatic project assignment when student reaches 100% completion
// To disable auto-assignment, change this to: const AUTO_PROJECT_ASSIGNMENT_ENABLED = false
const AUTO_PROJECT_ASSIGNMENT_ENABLED = true

export default function StudentDashboard() {
  const [internshipData, setInternshipData] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    week: '',
    githubLink: '',
    deployedLink: '',
    description: ''
  })
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustModalLoading, setAdjustModalLoading] = useState(false)
  const [dailyCompletion, setDailyCompletion] = useState({})
  const [completionLoading, setCompletionLoading] = useState({})
  const [projectData, setProjectData] = useState(null)
  const [showProjectSubmitModal, setShowProjectSubmitModal] = useState(false)
  const [projectSubmitForm, setProjectSubmitForm] = useState({ uploadLink: '' })
  const [projectSubmitting, setProjectSubmitting] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState(null)
  const [showAutoAssignProjectModal, setShowAutoAssignProjectModal] = useState(false)
  const [autoAssigningProject, setAutoAssigningProject] = useState(false)
  const [availableProjectTemplates, setAvailableProjectTemplates] = useState([])

  // Calculate progress based on approved/completed submissions
  const progress = useMemo(() => {
    const completedStatuses = ['approved', 'completed']
    const totalWeeks = weeks.length
    const completedWeeks = submissions.filter(
      s => completedStatuses.includes(s.status?.toLowerCase())
    ).length
    return totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0
  }, [weeks.length, submissions])

  // Check if student has 100% completion and handle auto-project assignment
  const checkAndHandleAutoProjectAssignment = async () => {
    // Only proceed if auto-assignment is enabled, student has 100% completion and no project assigned
    if (AUTO_PROJECT_ASSIGNMENT_ENABLED && progress === 100 && !projectData && internshipData?.internship?._id) {
      try {
        // Check if there are project templates available
        const templatesRes = await studentAPI.getProjectTemplates(internshipData.internship._id)
        if (templatesRes.templates && templatesRes.templates.length > 0) {
          setAvailableProjectTemplates(templatesRes.templates)
          setShowAutoAssignProjectModal(true)
        }
      } catch (error) {
        console.log('No project templates available or error fetching templates:', error)
      }
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Check for auto-project assignment when progress reaches 100%
  useEffect(() => {
    if (AUTO_PROJECT_ASSIGNMENT_ENABLED && progress === 100 && !projectData && internshipData?.internship?._id) {
      checkAndHandleAutoProjectAssignment()
    }
  }, [progress, projectData, internshipData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-panel')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [internshipDetails, weeksData, submissionsData, announcementsData, notificationsData] = await Promise.all([
        studentAPI.getInternshipDetails(),
        studentAPI.getWeeks(),
        studentAPI.getSubmissions(),
        studentAPI.getAnnouncements(),
        studentAPI.getNotifications()
      ])
      console.log('Internship Details:', internshipDetails)
      setInternshipData(internshipDetails)
      setWeeks(weeksData.weeks || [])
      setSubmissions(submissionsData.submissions || [])
      setAnnouncements(announcementsData.announcements || [])
      setNotifications(notificationsData.notifications || [])
      
      // Fetch daily completion for all weeks
      const completionPromises = weeksData.weeks.map(week => 
        studentAPI.getDailyCompletion(week.week_number)
      )
      const completionResults = await Promise.all(completionPromises)
      const completionData = {}
      completionResults.forEach((result, index) => {
        completionData[weeksData.weeks[index].week_number] = result.daily_completion || {}
      })
      setDailyCompletion(completionData)

      // Fetch project status
      if (internshipDetails.internship?._id) {
        try {
          const projectRes = await studentAPI.getProjectStatus(internshipDetails.internship._id)
          setProjectData(projectRes.project)
        } catch (error) {
          console.log('No project assigned yet')
          setProjectData(null)
        }
      }
      
      setError('')
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    
    if (!assignmentData.githubLink.trim() || !assignmentData.deployedLink.trim()) {
      setError('Please provide both GitHub and deployed links')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      await studentAPI.submitAssignment(assignmentData)
      
      // Refresh internship data
      await fetchDashboardData()
      
      // Reset form
      setAssignmentData({
        week: '',
        githubLink: '',
        deployedLink: '',
        description: ''
      })
      setSelectedWeek(null)
      
    } catch (error) {
      setError(error.message || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    authService.clearTokens()
    window.location.href = '/'
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'var(--neon-cyan)'
      case 'pending':
        return 'var(--neon-orange)'
      case 'approved':
        return 'var(--neon-green)'
      case 'rejected':
        return 'var(--neon-red)'
      default:
        return 'var(--text-secondary)'
    }
  }

  const getInternshipDuration = () => {
    if (!internshipData) return { weeks: 0, days: 0 }
    
    const startDate = new Date(internshipData.start_date || internshipData.created_at)
    const endDate = new Date(internshipData.end_date || internshipData.completion_date)
    const today = new Date()
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    const weeksLeft = Math.ceil(daysLeft / 7)
    
    return {
      totalWeeks: Math.ceil(totalDays / 7),
      totalDays,
      daysLeft: Math.max(0, daysLeft),
      weeksLeft: Math.max(0, weeksLeft)
    }
  }

  const formatDuration = () => {
    const duration = getInternshipDuration()
    return `${duration.totalWeeks} weeks (${duration.totalDays} days)`
  }

  const formatTimeLeft = () => {
    const duration = getInternshipDuration()
    if (duration.daysLeft <= 0) {
      return "Internship Completed"
    }
    return `${duration.weeksLeft} weeks, ${duration.daysLeft % 7} days left`
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await studentAPI.markNotificationRead(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      await studentAPI.markAllNotificationsRead()
      setNotifications([])
      setShowNotifications(false)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDownloadCertificate = async (certificateType) => {
    // Prevent execution if certificate feature is disabled
    if (!CERTIFICATE_FEATURE_ENABLED) {
      console.log('Certificate feature is currently disabled')
      return
    }

    // Map frontend type to backend type
    let backendType = certificateType;
    if (certificateType === 'offer-letter') backendType = 'offer';
    if (certificateType === 'certificate-of-completion') backendType = 'completion';
    // Add more mappings if needed

    if (backendType === 'completion') {
      setShowAdjustModal(true)
      return
    }
    try {
      // Call the API to get certificate data (now returns a Blob for PDF)
      const { data: blob } = await studentAPI.downloadCertificate(backendType)
      if (!(blob instanceof Blob)) {
        setError('Failed to download certificate. Please try again.');
        return;
      }
      let filename = ''
      if (backendType === 'lor') {
        filename = `lor-certificate-${internshipData?.user?.fullName || 'student'}.pdf`
      } else if (backendType === 'offer') {
        filename = `offer-letter-${internshipData?.user?.fullName || 'student'}.pdf`
      } else {
        filename = `certificate-${internshipData?.user?.fullName || 'student'}.pdf`
      }
      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setError('') // Clear any previous errors
    } catch (error) {
      console.error('Error downloading certificate:', error)
      setError(error.message || 'Failed to download certificate. Please try again.')
    }
  }

  const handleConfirmAdjustModal = async (positions) => {
    // Prevent execution if certificate feature is disabled
    if (!CERTIFICATE_FEATURE_ENABLED) {
      console.log('Certificate feature is currently disabled')
      return
    }

    setAdjustModalLoading(true)
    try {
      const blob = await studentAPI.downloadCertificateWithPositions({
        certificateType: 'completion',
        ...positions
      })
      let filename = `completion-certificate-${internshipData?.user?.fullName || 'student'}.pdf`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setError('')
      setShowAdjustModal(false)
    } catch (error) {
      setError(error.message || 'Failed to download certificate. Please try again.')
    } finally {
      setAdjustModalLoading(false)
    }
  }

  // Daily completion functions
  const fetchDailyCompletion = async (weekNumber) => {
    try {
      const response = await studentAPI.getDailyCompletion(weekNumber)
      setDailyCompletion(prev => ({
        ...prev,
        [weekNumber]: response.daily_completion
      }))
    } catch (error) {
      console.error('Error fetching daily completion:', error)
    }
  }

  const handleDailyCompletionToggle = async (weekNumber, dayNumber, completed) => {
    const key = `${weekNumber}-${dayNumber}`
    setCompletionLoading(prev => ({ ...prev, [key]: true }))
    
    try {
      await studentAPI.markDailyCompletion({
        week_number: weekNumber,
        day_number: dayNumber,
        completed: completed
      })
      
      // Update local state
      setDailyCompletion(prev => ({
        ...prev,
        [weekNumber]: {
          ...prev[weekNumber],
          [`day_${dayNumber}`]: {
            completed: completed,
            completed_at: completed ? new Date().toISOString() : null
          }
        }
      }))
    } catch (error) {
      console.error('Error updating daily completion:', error)
      setError('Failed to update completion status')
    } finally {
      setCompletionLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const isDayCompleted = (weekNumber, dayNumber) => {
    const weekCompletion = dailyCompletion[weekNumber] || {}
    const dayCompletion = weekCompletion[`day_${dayNumber}`]
    return dayCompletion?.completed || false
  }

  const getDayCompletionLoading = (weekNumber, dayNumber) => {
    const key = `${weekNumber}-${dayNumber}`
    return completionLoading[key] || false
  }

  // Merge submission status into weeks
  const weeksWithSubmissionStatus = (internshipData?.weeks || []).map(week => {
    const submission = submissions.find(s => String(s.week) === String(week.week_number))
    return {
      ...week,
      submissionStatus: submission ? submission.status : null
    }
  })

  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    if (!projectSubmitForm.uploadLink.trim()) {
      setError('Please provide a valid project upload link')
      return
    }
    setProjectSubmitting(true)
    setError('')
    try {
      await studentAPI.submitProject({
        internship_id: internshipData.internship._id,
        upload_link: projectSubmitForm.uploadLink
      })
      await fetchDashboardData()
      setShowProjectSubmitModal(false)
      setProjectSubmitForm({ uploadLink: '' })
    } catch (error) {
      setError(error.message || 'Failed to submit project')
    } finally {
      setProjectSubmitting(false)
    }
  }

  // Handle auto-assignment of project
  const handleAutoAssignProject = async () => {
    if (!internshipData?.internship?._id) return
    
    setAutoAssigningProject(true)
    setError('')
    
    try {
      const result = await studentAPI.autoAssignProject(internshipData.internship._id)
      
      // Refresh dashboard data to show the newly assigned project
      await fetchDashboardData()
      
      setShowAutoAssignProjectModal(false)
      setAvailableProjectTemplates([])
      
      // Show success message
      setError('') // Clear any previous errors
      // You could add a success notification here
      
    } catch (error) {
      setError(error.message || 'Failed to auto-assign project')
    } finally {
      setAutoAssigningProject(false)
    }
  }

  if (!authService.isAuthenticated() || authService.getUserType() !== 'student') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized Access</h2>
        <p>Please login with student credentials to access this dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading your internship dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-bg">
        <div className="circuit-pattern"></div>
        <div className="neon-glow"></div>
      </div>

      <div className="dashboard-container">
        {/* Header */}
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="header-left">
              <FaGraduationCap className="header-icon" />
              <div className="header-text">
                <h1>Student Dashboard</h1>
                <p>Welcome back, {internshipData?.user?.fullName || 'Student'}!</p>
              </div>
            </div>
            <div className="header-right">
              <motion.button
                className="logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Error Banner */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaTimesCircle />
            {error}
          </motion.div>
        )}

        {/* Internship Overview */}
        <motion.div
          className="overview-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-icon">
                <FaCode />
              </div>
              <div className="card-content">
                <h3>Internship Track</h3>
                {internshipData?.internship?.track_name || internshipData?.user?.track ? (
                  <p className="track-name">{internshipData.internship?.track_name || internshipData.user?.track}</p>
                ) : (
                  <div className="not-assigned">
                    <p className="not-assigned-text">Not Assigned</p>
                    <p className="not-assigned-subtext">Contact HR for track assignment</p>
                  </div>
                )}
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <FaTrophy />
              </div>
              <div className="card-content">
                <h3>Progress</h3>
                <p>{progress}% Complete</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <FaCalendarAlt />
              </div>
              <div className="card-content">
                <h3>Duration</h3>
                <p>{internshipData?.internship?.duration || 'Not set'}</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <FaCheckCircle />
              </div>
              <div className="card-content">
                <h3>Status</h3>
                <p style={{ color: getStatusColor(internshipData?.user?.status) }}>
                  {internshipData?.user?.status || 'Active'}
                </p>
              </div>
            </div>

            {/* Certificates Card - moved to its own card */}
            {CERTIFICATE_FEATURE_ENABLED && (
            <div className="overview-card">
              <div className="card-icon">
                <FaDownload />
              </div>
              <div className="card-content">
                <h3>Certificates</h3>
                <div className="certificate-status">
                  <motion.button
                    className="certificate-btn"
                    onClick={() => setShowCertificateModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaDownload />
                    Download Certificates
                  </motion.button>
                  {(internshipData?.user?.certificate_unlocked || internshipData?.user?.lor_unlocked) && (
                    <span className="unlocked-badge">
                      {[internshipData?.user?.certificate_unlocked, internshipData?.user?.lor_unlocked].filter(Boolean).length} Unlocked
                    </span>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="progress-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Completion Status Section */}
        {CERTIFICATE_FEATURE_ENABLED && (
        <motion.div
          className="completion-status-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3>Certificate Requirements</h3>
          <div className="completion-grid">
            <div className="completion-item">
              <div className="completion-header">
                <h4>Course Completion</h4>
                <span className={`completion-percentage ${internshipData?.user?.course_completion_percentage >= 100 ? 'completed' : 'incomplete'}`}>
                  {internshipData?.user?.course_completion_percentage || 0}%
                </span>
              </div>
              <div className="completion-status">
                {internshipData?.user?.course_completion_percentage >= 100 ? (
                  <span className="status-complete">✅ 100% Complete - Eligible for Certificate</span>
                ) : (
                  <span className="status-incomplete">⏳ In Progress - Complete all weeks to unlock certificate</span>
                )}
              </div>
            </div>

            <div className="completion-item">
              <div className="completion-header">
                <h4>Final Project Status</h4>
                <span className={`project-status ${
                  ['Completed', 'Excellent'].includes((projectData?.status || internshipData?.user?.project_completion_status))
                    ? 'completed'
                    : (projectData?.status === 'Submitted' ? 'submitted' : 'incomplete')
                }`}>
                  {(projectData?.status || internshipData?.user?.project_completion_status) || 'Not Started'}
                </span>
              </div>
              <div className="completion-status">
                {['Completed', 'Excellent'].includes((projectData?.status || internshipData?.user?.project_completion_status)) ? (
                  <span className="status-complete">✅ Project Complete - Eligible for LOR</span>
                ) : projectData?.status === 'Submitted' ? (
                  <span className="status-submitted">⏳ Project submitted - Awaiting manager review</span>
                ) : (
                  <span className="status-incomplete">⏳ Final Project not Unlocked - Contact manager or HR</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Announcements Section */}
        <motion.div
          className="announcements-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="section-header">
            <h2><FaBullhorn /> Announcements</h2>
            <p>Stay updated with important information</p>
          </div>

          <div className="announcements-grid">
            {announcements.length === 0 ? (
              <div className="no-announcements">
                <FaBullhorn className="no-announcements-icon" />
                <h3>No Announcements</h3>
                <p>Check back later for updates from your mentors</p>
              </div>
            ) : (
              announcements.map((announcement, index) => (
                <motion.div
                  key={announcement._id || index}
                  className={`announcement-card ${announcement.priority === 'high' ? 'high-priority' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    {announcement.priority === 'high' && (
                      <span className="priority-badge">High Priority</span>
                    )}
                  </div>
                  <div className="announcement-content">
                    <p>{announcement.content}</p>
                  </div>
                  <div className="announcement-footer">
                    <span className="announcement-date">
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Weekly Content */}
        <motion.div
          className="content-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="section-header">
            <h2>Weekly Content</h2>
            <p>Complete daily tasks and track your progress</p>
          </div>

          <div className="weeks-container">
            {weeksWithSubmissionStatus.map((week, index) => {
              const isExpanded = expandedWeek === week.week_number
              return (
                <motion.div
                  key={week.week_number || index}
                  className={`week-tabular-card${isExpanded ? ' expanded' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="week-header" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setExpandedWeek(isExpanded ? null : week.week_number)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span onClick={e => { e.stopPropagation(); setExpandedWeek(isExpanded ? null : week.week_number) }} style={{ fontSize: 18, color: 'var(--neon-cyan)' }}>
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                      <h3>WEEK {week.week_number}: {week.title}</h3>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(week.submissionStatus || week.status) }}
                    >
                      {(week.submissionStatus || week.status) || 'Pending'}
                    </span>
                  </div>

                  {isExpanded && (
                    <>
                      <div className="week-description">
                        <p>{week.description}</p>
                      </div>
                      {week.lab_task && (
                        <div className="lab-task-table">
                          <div className="lab-task-row">
                            <div>Week {week.week_number}</div>
                            <div>Lab Task:</div>
                            <div>{week.lab_task.title}</div>
                            <div>What to implement:</div>
                            <div>{week.lab_task.description}</div>
                          </div>
                          <div className="submission-note">
                            Students must upload the GitHub URL link of their submission.
                          </div>
                        </div>
                      )}
                      {/* Daily Content Table */}
                      {week.daily_content && week.daily_content.length > 0 ? (
                        <div className="daily-content-table">
                          <div className="table-header">
                            <div className="header-cell">Day</div>
                            <div className="header-cell">Topic</div>
                            <div className="header-cell">Main Learning</div>
                            <div className="header-cell">Module</div>
                            <div className="header-cell">Reference Link</div>
                            <div className="header-cell">Complete</div>
                          </div>

                          <div className="table-body">
                            {week.daily_content.map((day, dayIndex) => (
                              <div key={dayIndex} className="table-row">
                                <div className="table-cell day-cell">
                                  <span className="day-number">Day {day.day}</span>
                                </div>
                                <div className="table-cell">
                                  <span className="topic-text">{day.topic}</span>
                                </div>
                                <div className="table-cell">
                                  <span className="learning-text">{day.main_learning}</span>
                                </div>
                                <div className="table-cell">
                                  <span className="module-text">{day.module}</span>
                                </div>
                                <div className="table-cell">
                                  <a 
                                    href={day.reference_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="reference-link"
                                  >
                                    <FaLink />
                                    View Resource
                                  </a>
                                </div>
                                <div className="table-cell completion-cell">
                                  <motion.button
                                    className={`completion-checkbox ${isDayCompleted(week.week_number, day.day) ? 'completed' : ''}`}
                                    onClick={() => handleDailyCompletionToggle(
                                      week.week_number, 
                                      day.day, 
                                      !isDayCompleted(week.week_number, day.day)
                                    )}
                                    disabled={getDayCompletionLoading(week.week_number, day.day)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {getDayCompletionLoading(week.week_number, day.day) ? (
                                      <FaSpinner className="spinner" />
                                    ) : isDayCompleted(week.week_number, day.day) ? (
                                      <FaCheckCircle />
                                    ) : (
                                      <div className="checkbox-placeholder"></div>
                                    )}
                                  </motion.button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="no-daily-content">
                          <p>No daily content available for this week.</p>
                        </div>
                      )}
                      {/* Week Actions */}
                      <div className="week-actions">
                        {(week.submissionStatus || week.status)?.toLowerCase() === 'completed' || (week.submissionStatus || week.status)?.toLowerCase() === 'approved' ? (
                          <div className="completed-indicator">
                            <FaCheckCircle />
                            <span>Week Completed</span>
                          </div>
                        ) : (week.submissionStatus || week.status)?.toLowerCase() === 'pending' ? (
                          <div className="pending-indicator">
                            <FaSpinner className="spinner" />
                            <span>Pending Review</span>
                          </div>
                        ) : (
                          <motion.button
                            className="submit-btn"
                            onClick={() => setSelectedWeek(week)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaUpload />
                            Submit Assignment
                          </motion.button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Assignment Submission Modal */}
        <AnimatePresence>
          {selectedWeek && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWeek(null)}
            >
              <motion.div
                className="submission-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Submit Assignment - Week {selectedWeek.week_number}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedWeek(null)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <form onSubmit={handleSubmitAssignment} className="submission-form">
                  <div className="form-group">
                    <label>GitHub Repository Link *</label>
                    <input
                      type="url"
                      value={assignmentData.githubLink}
                      onChange={(e) => setAssignmentData(prev => ({
                        ...prev,
                        githubLink: e.target.value,
                        week: selectedWeek.week_number
                      }))}
                      placeholder="https://github.com/username/repository"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Deployed Application Link *</label>
                    <input
                      type="url"
                      value={assignmentData.deployedLink}
                      onChange={(e) => setAssignmentData(prev => ({
                        ...prev,
                        deployedLink: e.target.value
                      }))}
                      placeholder="https://your-app.vercel.app"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      value={assignmentData.description}
                      onChange={(e) => setAssignmentData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Brief description of your implementation..."
                      rows="3"
                    />
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setSelectedWeek(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaUpload />
                      )}
                      Submit Assignment
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate Download Modal */}
        {CERTIFICATE_FEATURE_ENABLED && (
        <AnimatePresence>
          {showCertificateModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertificateModal(false)}
            >
              <motion.div
                className="certificate-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3><FaDownload /> Download Certificates</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowCertificateModal(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="certificate-options">
                  <div className="certificate-option">
                    <div className="certificate-info">
                      <h4>1. Internship Offer Letter</h4>
                      <p>Official offer letter for your internship program</p>
                    </div>
                    <motion.button
                      className="download-btn available"
                      onClick={() => handleDownloadCertificate('offer-letter')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaDownload />
                      Download
                    </motion.button>
                  </div>

                  <div className="certificate-option">
                    <div className="certificate-info">
                      <h4>2. Certificate of Completion</h4>
                      <p>Certificate awarded upon successful completion</p>
                      {internshipData?.user?.certificate_unlocked ? (
                        <span className="status-unlocked">✅ Unlocked - Ready to Download</span>
                      ) : (
                        <span className="status-locked">🔒 Locked - Contact Manager</span>
                      )}
                    </div>
                    <motion.button
                      className={`download-btn ${internshipData?.user?.certificate_unlocked ? 'available' : 'locked'}`}
                      onClick={() => handleDownloadCertificate('completion')}
                      disabled={!internshipData?.user?.certificate_unlocked}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {internshipData?.user?.certificate_unlocked ? (
                        <>
                          <FaDownload />
                          Download
                        </>
                      ) : (
                        <>
                          <FaTimes />
                          Locked
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="certificate-option">
                    <div className="certificate-info">
                      <h4>3. Letter of Recommendation (LOR)</h4>
                      <p>Professional recommendation letter</p>
                      {internshipData?.user?.lor_unlocked ? (
                        <span className="status-unlocked">✅ Unlocked - Ready to Download</span>
                      ) : (
                        <span className="status-locked">🔒 Locked - Contact Manager</span>
                      )}
                    </div>
                    <motion.button
                      className={`download-btn ${internshipData?.user?.lor_unlocked ? 'available' : 'locked'}`}
                      onClick={() => handleDownloadCertificate('lor')}
                      disabled={!internshipData?.user?.lor_unlocked}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {internshipData?.user?.lor_unlocked ? (
                        <>
                          <FaDownload />
                          Download
                        </>
                      ) : (
                        <>
                          <FaTimes />
                          Locked
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="modal-footer">
                  <p className="certificate-note">
                    <FaInfoCircle />
                    {internshipData?.user?.certificate_unlocked || internshipData?.user?.lor_unlocked ? (
                      "Some certificates are now available for download. Unlocked certificates will be available immediately."
                    ) : (
                      "Only the Internship Offer Letter is available for download. Certificate of Completion and LOR will be unlocked by your internship manager upon successful completion of the program."
                    )}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {CERTIFICATE_FEATURE_ENABLED && (
        <CertificateAdjustModal
          open={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          onConfirm={handleConfirmAdjustModal}
          name={internshipData?.user?.fullName || ''}
          track={internshipData?.user?.track || ''}
          date={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
        />
        )}

        {/* Project Section */}
        {projectData && (
          <motion.div
            className="content-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="section-header">
              <h2>Final Project</h2>
              <p>{CERTIFICATE_FEATURE_ENABLED ? 'Complete your assigned project to unlock LOR' : 'Complete your assigned project to demonstrate your skills'}</p>
            </div>

            <div className="project-card">
              <div className="project-header">
                <h3>{projectData.title}</h3>
                <span className={`project-status ${projectData.status?.toLowerCase()}`}>
                  {projectData.status}
                </span>
              </div>
              
              <div className="project-details">
                <p><strong>Description:</strong> {projectData.description}</p>
                
                {projectData.upload_link && (
                  <div className="project-upload">
                    <p><strong>Upload Link:</strong></p>
                    <a href={projectData.upload_link} target="_blank" rel="noopener noreferrer" className="project-link">
                      View Project Requirements
                    </a>
                  </div>
                )}
                
                {projectData.status === 'Assigned' && (
                  <div className="project-actions">
                    <motion.button
                      className="submit-project-btn"
                      onClick={() => setShowProjectSubmitModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Project
                    </motion.button>
                  </div>
                )}
                
                {projectData.status === 'Submitted' && (
                  <div className="project-submitted">
                    <FaCheckCircle style={{ color: 'var(--neon-green)', marginRight: '8px' }} />
                    <span>Project submitted and awaiting review</span>
                  </div>
                )}
                
                {projectData.review_status && (
                  <div className="project-review">
                    <p><strong>Review Status:</strong> {projectData.review_status}</p>
                    {projectData.review_feedback && (
                      <p><strong>Feedback:</strong> {projectData.review_feedback}</p>
                    )}
                    {projectData.review_status === 'Approved' && (
                      <div className="project-approved">
                        <FaTrophy style={{ color: 'var(--neon-cyan)', marginRight: '8px' }} />
                        <span>{CERTIFICATE_FEATURE_ENABLED ? 'Project approved! LOR unlocked.' : 'Project approved! Great work!'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Project Submit Modal */}
        <AnimatePresence>
          {showProjectSubmitModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProjectSubmitModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Submit Project</h3>
                  <button className="close-btn" onClick={() => setShowProjectSubmitModal(false)}>
                    <FaTimesCircle />
                  </button>
                </div>
                <form onSubmit={handleProjectSubmit} className="modal-form">
                  <div className="form-group">
                    <label>Project Upload Link *</label>
                    <input
                      type="url"
                      value={projectSubmitForm.uploadLink}
                      onChange={e => setProjectSubmitForm(prev => ({ ...prev, uploadLink: e.target.value }))}
                      placeholder="https://github.com/your-username/project-repo"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowProjectSubmitModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={projectSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {projectSubmitting ? <FaSpinner className="spinner" /> : <FaUpload />}
                      Submit Project
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-Assign Project Modal */}
        <AnimatePresence>
          {showAutoAssignProjectModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoAssignProjectModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3><FaTrophy /> Congratulations! 🎉</h3>
                  <button className="close-btn" onClick={() => setShowAutoAssignProjectModal(false)}>
                    <FaTimesCircle />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="auto-assign-content">
                    <div className="success-message">
                      <FaCheckCircle className="success-icon" />
                      <h4>You've completed 100% of your weekly tasks!</h4>
                      <p>You're now eligible for a final project assignment. A project template has been prepared for your internship track.</p>
                    </div>
                    
                    {availableProjectTemplates.length > 0 && (
                      <div className="project-template-preview">
                        <h5>Available Project:</h5>
                        <div className="template-card">
                          <h6>{availableProjectTemplates[0].title}</h6>
                          <p>{availableProjectTemplates[0].description}</p>
                          {availableProjectTemplates[0].upload_link && (
                            <a 
                              href={availableProjectTemplates[0].upload_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="template-link"
                            >
                              View Project Requirements
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="auto-assign-actions">
                      <motion.button
                        className="auto-assign-btn"
                        onClick={handleAutoAssignProject}
                        disabled={autoAssigningProject}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {autoAssigningProject ? (
                          <>
                            <FaSpinner className="spinner" />
                            Assigning Project...
                          </>
                        ) : (
                          <>
                            <FaTrophy />
                            Assign Project to Me
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        className="cancel-btn"
                        onClick={() => setShowAutoAssignProjectModal(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Maybe Later
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 