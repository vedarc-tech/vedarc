import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUserTie, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit, FaTrash, FaCode, FaCalendarAlt, FaTrophy, FaBullhorn, FaUsers, FaLink, FaFile, FaFilter, FaSearch, FaEye, FaCertificate, FaUnlock, FaLock, FaDownload, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa'
import { saveAs } from 'file-saver'
import { managerAPI, authService } from '../../services/apiService'
import './InternshipManagerDashboard.css'

// Add at the top, after imports
function getSafeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return 'https://' + url
}

export default function InternshipManagerDashboard() {
  const [internships, setInternships] = useState([])
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('internships')
  
  // Modal states
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showAddWeek, setShowAddWeek] = useState(false)
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false)
  const [showEditInternship, setShowEditInternship] = useState(false)
  const [showEditWeek, setShowEditWeek] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showBulkUnlockModal, setShowBulkUnlockModal] = useState(false)
  const [showAdminApprovalModal, setShowAdminApprovalModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  
  // Form states
  const [newInternship, setNewInternship] = useState({
    track_name: '',
    duration: '',
    description: '',
    submission_type: 'link'
  })
  
  const [newWeek, setNewWeek] = useState({
    week_number: '',
    title: '',
    description: '',
    submission_type: 'link',
    resources: [],
    daily_content: [
      {
        day: 1,
        topic: '',
        main_learning: '',
        module: '',
        reference_link: ''
      }
    ],
    lab_task: {
      title: '',
      description: ''
    }
  })
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal'
  })

  // Certificate unlock states
  const [studentsWithCertificates, setStudentsWithCertificates] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [certificateType, setCertificateType] = useState('completion')
  const [adminApprovalData, setAdminApprovalData] = useState(null)

  // Add state for expanded week and editing week
  const [expandedWeekId, setExpandedWeekId] = useState(null)
  const [editWeekData, setEditWeekData] = useState(null)

  // Add state for students expanded
  const [studentsExpanded, setStudentsExpanded] = useState(false)

  // Add state for project form and student
  const [projectForm, setProjectForm] = useState({ userId: '', templateId: '' })
  const [projectStudent, setProjectStudent] = useState(null)
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectError, setProjectError] = useState('')
  const [studentSearchResults, setStudentSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Add state for project list
  const [projectList, setProjectList] = useState([])
  const [projectTemplates, setProjectTemplates] = useState([])

  // Add state for template form and editing template
  const [templateForm, setTemplateForm] = useState({ title: '', description: '', uploadLink: '' })
  const [editingTemplate, setEditingTemplate] = useState(null)

  // Add state for registration toggle
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [toggleError, setToggleError] = useState('')

  // Only show toggle if user is manager
  const isManager = authService.getUserType() === 'manager'

  // Fetch system setting on mount (if manager)
  useEffect(() => {
    if (isManager) {
      setToggleLoading(true)
      managerAPI.getSystemSettings()
        .then(res => {
          setRegistrationEnabled(res.internship_registration_enabled)
          setToggleError('')
        })
        .catch(() => setToggleError('Failed to fetch registration setting'))
        .finally(() => setToggleLoading(false))
    }
  }, [isManager])

  // Toggle handler
  const handleToggle = async () => {
    setToggleLoading(true)
    setToggleError('')
    try {
      const updated = await managerAPI.updateSystemSettings({ internship_registration_enabled: !registrationEnabled })
      setRegistrationEnabled(updated.internship_registration_enabled)
    } catch (e) {
      setToggleError('Failed to update setting')
    } finally {
      setToggleLoading(false)
    }
  }

  // Add click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentSearchResults.length > 0) {
        const searchContainer = event.target.closest('.student-id-input-container')
        if (!searchContainer) {
          setStudentSearchResults([])
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [studentSearchResults.length])

  // Fetch project list when internship changes
  useEffect(() => {
    if (selectedInternship?._id) {
      Promise.all([
        managerAPI.listProjects(selectedInternship._id),
        managerAPI.getProjectTemplates(selectedInternship._id)
      ]).then(([projectsRes, templatesRes]) => {
        setProjectList(projectsRes.projects || [])
        setProjectTemplates(templatesRes.templates || [])
      })
    } else {
      setProjectList([])
      setProjectTemplates([])
    }
  }, [selectedInternship])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [internshipsData, announcementsData] = await Promise.all([
        managerAPI.getInternships(),
        managerAPI.getAnnouncements()
      ])
      
      setInternships(internshipsData.internships || [])
      setAnnouncements(announcementsData.announcements || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchInternshipDetails = async (internshipId) => {
    if (!internshipId) {
      console.error('No internship ID provided')
      setError('Invalid internship selected')
      return
    }
    
    setLoadingDetails(true)
    try {
      const [weeksData, studentsData, submissionsData, certificatesData] = await Promise.all([
        managerAPI.getWeeks(internshipId),
        managerAPI.getStudents(internshipId),
        managerAPI.getSubmissions(internshipId),
        managerAPI.getStudentsWithCertificates(internshipId)
      ])
      
      setWeeks(weeksData.weeks || [])
      setStudents(studentsData.students || [])
      setSubmissions(submissionsData.submissions || [])
      setStudentsWithCertificates(certificatesData.students || [])
      setError('') // Clear any previous errors
    } catch (error) {
      console.error('Error fetching internship details:', error)
      setError('Failed to load internship details. Please try again.')
      // Clear the data on error
      setWeeks([])
      setStudents([])
      setSubmissions([])
      setStudentsWithCertificates([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCreateInternship = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await managerAPI.createInternship(newInternship)
      await fetchDashboardData()
      setShowAddInternship(false)
      setNewInternship({
        track_name: '',
        duration: '',
        description: '',
        submission_type: 'link'
      })
    } catch (error) {
      setError(error.message || 'Failed to create internship')
    } finally {
      setProcessing(false)
    }
  }

  const handleAddWeek = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await managerAPI.addWeek(selectedInternship._id, newWeek)
      await fetchInternshipDetails(selectedInternship._id)
      setShowAddWeek(false)
      setNewWeek({
        week_number: '',
        title: '',
        description: '',
        submission_type: 'link',
        resources: [],
        daily_content: [
          {
            day: 1,
            topic: '',
            main_learning: '',
            module: '',
            reference_link: ''
          }
        ],
        lab_task: {
          title: '',
          description: ''
        }
      })
    } catch (error) {
      setError(error.message || 'Failed to add week')
    } finally {
      setProcessing(false)
    }
  }

  // Helper functions for daily content management
  const addDayToWeek = () => {
    const currentDays = newWeek.daily_content.length
    if (currentDays < 7) {
      setNewWeek(prev => ({
        ...prev,
        daily_content: [
          ...prev.daily_content,
          {
            day: currentDays + 1,
            topic: '',
            main_learning: '',
            module: '',
            reference_link: ''
          }
        ]
      }))
    }
  }

  const removeDayFromWeek = (dayIndex) => {
    if (newWeek.daily_content.length > 1) {
      setNewWeek(prev => ({
        ...prev,
        daily_content: prev.daily_content.filter((_, index) => index !== dayIndex)
          .map((day, index) => ({ ...day, day: index + 1 }))
      }))
    }
  }

  const updateDayContent = (dayIndex, field, value) => {
    setNewWeek(prev => ({
      ...prev,
      daily_content: prev.daily_content.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }))
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await managerAPI.createAnnouncement(newAnnouncement)
      await fetchDashboardData()
      setShowAddAnnouncement(false)
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal'
      })
    } catch (error) {
      setError(error.message || 'Failed to create announcement')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteInternship = async (internshipId) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return
    
    setProcessing(true)
    try {
      await managerAPI.deleteInternship(internshipId)
      await fetchDashboardData()
      if (selectedInternship?._id === internshipId) {
        setSelectedInternship(null)
        setWeeks([])
        setStudents([])
        setSubmissions([])
      }
    } catch (error) {
      setError(error.message || 'Failed to delete internship')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteWeek = async (weekId) => {
    if (!window.confirm('Are you sure you want to delete this week?')) return
    
    setProcessing(true)
    try {
      await managerAPI.deleteWeek(selectedInternship._id, weekId)
      await fetchInternshipDetails(selectedInternship._id)
    } catch (error) {
      setError(error.message || 'Failed to delete week')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    
    setProcessing(true)
    try {
      await managerAPI.deleteAnnouncement(announcementId)
      await fetchDashboardData()
    } catch (error) {
      setError(error.message || 'Failed to delete announcement')
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = () => {
    authService.clearTokens()
    window.location.href = '/'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--neon-red)'
      case 'medium': return 'var(--neon-orange)'
      case 'normal': return 'var(--neon-cyan)'
      default: return 'var(--text-secondary)'
    }
  }

  const getSubmissionTypeIcon = (type) => {
    return type === 'link' ? <FaLink /> : <FaFile />
  }

  // Certificate unlock functions
  const fetchStudentsWithCertificates = async (internshipId) => {
    try {
      const response = await managerAPI.getStudentsWithCertificates(internshipId)
      // Filter to only show students with 100% course completion
      const eligibleStudents = (response.students || []).filter(student => 
        student.course_completion_percentage >= 100
      )
      setStudentsWithCertificates(eligibleStudents)
    } catch (error) {
      console.error('Error fetching students with certificates:', error)
      setError('Failed to load students certificate data')
    }
  }

  const handleUnlockCertificate = async (userId, type) => {
    setProcessing(true)
    try {
      const response = await managerAPI.unlockCertificate({
        user_id: userId,
        certificate_type: type
      })
      
      if (response.requires_admin_approval) {
        setAdminApprovalData({
          user_id: userId,
          certificate_type: type,
          message: response.message
        })
        setShowAdminApprovalModal(true)
      } else {
        // Refresh students data
        await fetchStudentsWithCertificates(selectedInternship._id)
        setError('') // Clear any previous errors
      }
    } catch (error) {
      if (error.requires_admin_approval) {
        setAdminApprovalData({
          user_id: userId,
          certificate_type: type,
          message: error.message
        })
        setShowAdminApprovalModal(true)
      } else {
        setError(error.message || 'Failed to unlock certificate')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkUnlockCertificates = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student')
      return
    }

    setProcessing(true)
    try {
      const response = await managerAPI.bulkUnlockCertificates({
        user_ids: selectedStudents,
        certificate_type: certificateType
      })
      
      if (response.results.requires_admin_approval.length > 0) {
        setAdminApprovalData({
          user_ids: response.results.requires_admin_approval.map(s => s.user_id),
          certificate_type: certificateType,
          message: `Admin approval required for ${response.results.requires_admin_approval.length} students`,
          students: response.results.requires_admin_approval
        })
        setShowAdminApprovalModal(true)
      }
      
      // Refresh students data
      await fetchStudentsWithCertificates(selectedInternship._id)
      setSelectedStudents([])
      setShowBulkUnlockModal(false)
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.message || 'Failed to bulk unlock certificates')
    } finally {
      setProcessing(false)
    }
  }

  const handleGenerateCertificate = async (userId, type) => {
    setProcessing(true)
    try {
      const response = await managerAPI.generateCertificate({
        user_id: userId,
        certificate_type: type
      })
      
      // Refresh students data
      await fetchStudentsWithCertificates(selectedInternship._id)
      setError('') // Clear any previous errors
      alert(`${type === 'completion' ? 'Certificate of Completion' : 'Letter of Recommendation'} generated successfully for the student!`)
    } catch (error) {
      setError(error.message || 'Failed to generate certificate')
    } finally {
      setProcessing(false)
    }
  }

  const handleStudentSelection = (userId) => {
    setSelectedStudents(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAllStudents = () => {
    const eligibleStudents = studentsWithCertificates.filter(student => {
      if (certificateType === 'completion') {
        return !student.certificate_unlocked
      } else {
        return ['Completed', 'Excellent'].includes(student.project_completion_status) && !student.lor_unlocked
      }
    })
    setSelectedStudents(eligibleStudents.map(s => s.user_id))
  }

  const handleClearSelection = () => {
    setSelectedStudents([])
  }

  const getCertificateStatus = (student, type) => {
    if (type === 'completion') {
      if (student.course_completion_percentage < 100) {
        return { status: 'locked', message: 'Course not 100% complete' }
      }
      if (student.certificate_unlocked) {
        const hasCertificate = student.certificate_generated || false
        return {
          status: hasCertificate ? 'generated' : 'unlocked',
          message: hasCertificate ? 'Certificate generated' : 'Certificate unlocked, ready to generate'
        }
      }
      return { status: 'eligible', message: 'Eligible for unlock' }
    } else {
      if (student.project_completion_status !== 'Completed' && student.project_completion_status !== 'Excellent') {
        return { status: 'locked', message: 'Project not completed' }
      }
      if (!student.admin_lor_approval) {
        return { status: 'locked', message: 'Admin approval required' }
      }
      if (student.lor_unlocked) {
        const hasLOR = student.lor_generated || false
        return {
          status: hasLOR ? 'generated' : 'unlocked',
          message: hasLOR ? 'LOR generated' : 'LOR unlocked, ready to generate'
        }
      }
      return { status: 'eligible', message: 'Eligible for unlock' }
    }
  }

  // Template management functions
  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await managerAPI.createProjectTemplate({
        internship_id: selectedInternship._id,
        title: templateForm.title,
        description: templateForm.description,
        upload_link: templateForm.uploadLink
      })
      const res = await managerAPI.getProjectTemplates(selectedInternship._id)
      setProjectTemplates(res.templates || [])
      setShowTemplateModal(false)
      setTemplateForm({ title: '', description: '', uploadLink: '' })
      setEditingTemplate(null)
    } catch (error) {
      setError(error.message || 'Failed to create template')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateTemplate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await managerAPI.updateProjectTemplate(editingTemplate._id, {
        title: templateForm.title,
        description: templateForm.description,
        upload_link: templateForm.uploadLink
      })
      const res = await managerAPI.getProjectTemplates(selectedInternship._id)
      setProjectTemplates(res.templates || [])
      setShowTemplateModal(false)
      setTemplateForm({ title: '', description: '', uploadLink: '' })
      setEditingTemplate(null)
    } catch (error) {
      setError(error.message || 'Failed to update template')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return
    setProcessing(true)
    try {
      await managerAPI.deleteProjectTemplate(templateId)
      const res = await managerAPI.getProjectTemplates(selectedInternship._id)
      setProjectTemplates(res.templates || [])
    } catch (error) {
      setError(error.message || 'Failed to delete template')
    } finally {
      setProcessing(false)
    }
  }

  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({
        title: template.title,
        description: template.description,
        uploadLink: template.upload_link || ''
      })
    } else {
      setEditingTemplate(null)
      setTemplateForm({ title: '', description: '', uploadLink: '' })
    }
    setShowTemplateModal(true)
  }

  // Student search function
  const searchStudent = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setStudentSearchResults([])
      setProjectStudent(null)
      return
    }

    setIsSearching(true)
    try {
      // Search through students in the current internship
      const filteredStudents = students.filter(student => 
        student.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setStudentSearchResults(filteredStudents)
      
      // If exact match found, set as selected student
      const exactMatch = filteredStudents.find(student => 
        student.user_id.toLowerCase() === searchTerm.toLowerCase()
      )
      if (exactMatch) {
        setProjectStudent(exactMatch)
      } else {
        setProjectStudent(null)
      }
    } catch (error) {
      console.error('Error searching students:', error)
      setStudentSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle student ID input change
  const handleStudentIdChange = (e) => {
    const value = e.target.value
    let userId = value
    
    // If user types just numbers, add VEDARC- prefix
    if (/^\d+$/.test(value)) {
      userId = `VEDARC-${value}`
    }
    // If user types VEDARC- followed by numbers, keep as is
    else if (/^VEDARC-\d*$/.test(value)) {
      userId = value
    }
    // If user types something else, try to extract numbers and add prefix
    else if (/^\d+/.test(value)) {
      const numbers = value.match(/^\d+/)[0]
      userId = `VEDARC-${numbers}`
    }
    
    setProjectForm(prev => ({ ...prev, userId }))
    searchStudent(userId)
  }

  // Select student from search results
  const selectStudent = (student) => {
    setProjectForm(prev => ({ ...prev, userId: student.user_id }))
    setProjectStudent(student)
    setStudentSearchResults([])
  }

  // Handle keyboard navigation for search results
  const handleStudentIdKeyDown = (e) => {
    if (studentSearchResults.length === 0) return

    const currentIndex = parseInt(e.target.getAttribute('data-selected-index') || '-1')
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = currentIndex < studentSearchResults.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : studentSearchResults.length - 1
        break
      case 'Enter':
        e.preventDefault()
        if (currentIndex >= 0 && currentIndex < studentSearchResults.length) {
          selectStudent(studentSearchResults[currentIndex])
        }
        return
      case 'Escape':
        setStudentSearchResults([])
        return
      default:
        return
    }

    // Update the selected index
    const searchInput = e.target
    searchInput.setAttribute('data-selected-index', newIndex.toString())
    
    // Remove previous selection
    const prevSelected = document.querySelector('.search-result-item.selected')
    if (prevSelected) {
      prevSelected.classList.remove('selected')
    }
    
    // Add selection to new item
    const selectedItem = document.querySelector(`[data-result-index="${newIndex}"]`)
    if (selectedItem) {
      selectedItem.classList.add('selected')
      selectedItem.scrollIntoView({ block: 'nearest' })
    }
  }

  // CSV export function
  const exportStudentsToCSV = async (internshipId) => {
    if (!internshipId) {
      setError('Please select an internship first')
      return
    }

    setProcessing(true)
    try {
      const response = await managerAPI.exportStudentsCSV(internshipId)
      
      if (!response.students || response.students.length === 0) {
        setError('No students found for this internship track')
        return
      }

      // Define CSV headers
      const headers = [
        'Full Name',
        'User ID', 
        'Email',
        'Mobile/WhatsApp',
        'Internship Track',
        'College',
        'Year of Study',
        'Passout Year',
        'Status',
        'Registration Date',
        'Activation Date',
        'Course Completion %',
        'Certificate Unlocked',
        'Certificate Unlocked Date',
        'LOR Unlocked',
        'LOR Unlocked Date',
        'Project Status',
        'Project Completion Status'
      ]

      // Create CSV rows
      const rows = response.students.map(student => [
        student.fullName || '',
        student.user_id || '',
        student.email || '',
        student.whatsapp || '',
        response.internship_track || '',
        student.collegeName || '',
        student.yearOfStudy || '',
        student.passoutYear || '',
        student.status || '',
        student.created_at ? new Date(student.created_at).toLocaleDateString() : '',
        student.activated_at ? new Date(student.activated_at).toLocaleDateString() : '',
        student.course_completion_percentage || 0,
        student.certificate_unlocked ? 'Yes' : 'No',
        student.certificate_unlocked_at ? new Date(student.certificate_unlocked_at).toLocaleDateString() : '',
        student.lor_unlocked ? 'Yes' : 'No',
        student.lor_unlocked_at ? new Date(student.lor_unlocked_at).toLocaleDateString() : '',
        student.project_status || 'Not Assigned',
        student.project_completion_status || 'Not Started'
      ])

      // Create CSV content
      const csvContent = [headers, ...rows]
        .map(row => row.map(val => '"' + (val ?? '') + '"').join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const filename = `vedarc_students_${response.internship_track.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      saveAs(blob, filename)
      
      setError('') // Clear any previous errors
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setError(error.message || 'Failed to export CSV')
    } finally {
      setProcessing(false)
    }
  }

  if (!authService.isAuthenticated() || authService.getUserType() !== 'manager') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized Access</h2>
        <p>Please login with Internship Manager credentials to access this dashboard.</p>
      </div>
    )
  }

  return (
    <div className="internship-manager-dashboard">
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
              <FaUserTie className="header-icon" />
              <div>
                <h1>Internship Manager Dashboard</h1>
                <p>Manage Internships, Content & Announcements</p>
              </div>
            </div>
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

        {/* Navigation Tabs */}
        <motion.nav
          className="dashboard-nav"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            className={`nav-tab ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <FaCode />
            Internships ({internships.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <FaCertificate />
            Certificates
          </button>
          <button
            className={`nav-tab ${activeTab === 'student-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('student-reports')}
          >
            <FaFileAlt />
            Student Reports
          </button>
          <button
            className={`nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <FaBullhorn />
            Announcements ({announcements.length})
          </button>
        </motion.nav>

        {/* Content Sections */}
        <motion.div
          className="content-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="loading-spinner" />
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'internships' && (
                <motion.div
                  key="internships"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Manage Internships</h2>
                    <motion.button
                      className="add-btn"
                      onClick={() => setShowAddInternship(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlus />
                      Create Internship
                    </motion.button>
                  </div>

                  <div className="internships-grid">
                    {internships.map((internship, index) => (
                      <motion.div
                        key={internship._id || index}
                        className={`internship-card ${selectedInternship?._id === internship._id ? 'selected' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => {
                          setSelectedInternship(internship)
                          fetchInternshipDetails(internship._id)
                        }}
                      >
                        <div className="internship-header">
                          <h3>{internship.track_name}</h3>
                          <div className="internship-actions">
                            <motion.button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowEditInternship(true)
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteInternship(internship._id)
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
                        </div>
                        
                        <p>{internship.description}</p>
                        
                        <div className="internship-stats">
                          <span className="duration">{internship.duration}</span>
                          <span className="submission-type">
                            {getSubmissionTypeIcon(internship.submission_type)}
                            {internship.submission_type}
                          </span>
                          <span className="students">{internship.student_count || 0} students</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Selected Internship Details */}
                  {selectedInternship && (
                    <motion.div
                      className="internship-details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="details-header">
                        <h3>{selectedInternship.track_name} - Details</h3>
                        {(() => {
                          // Parse duration as number
                          const durationMatch = selectedInternship.duration && selectedInternship.duration.match(/(\d+)/)
                          const maxWeeks = durationMatch ? parseInt(durationMatch[1], 10) : null
                          const weekLimitReached = maxWeeks !== null && weeks.length >= maxWeeks
                          return weekLimitReached ? (
                            <span style={{ color: 'var(--neon-orange)', fontWeight: 600, marginLeft: 16 }}>
                              Week limit reached ({maxWeeks})
                            </span>
                          ) : (
                            <motion.button
                              className="add-week-btn"
                              onClick={() => setShowAddWeek(true)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaPlus />
                              Add Week
                            </motion.button>
                          )
                        })()}
                      </div>

                      {loadingDetails ? (
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                          <p>Loading internship details...</p>
                        </div>
                      ) : (
                        <>
                          {/* Weeks Section */}
                          <div className="weeks-section">
                            <h4>Weekly Content</h4>
                            <div className="weeks-grid">
                              {weeks.map((week, index) => {
                                const isExpanded = expandedWeekId === week._id
                                return (
                                  <motion.div
                                    key={week._id || index}
                                    className="week-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedWeekId(isExpanded ? null : week._id)}
                                  >
                                    <div className="week-header">
                                      <h5>Week {week.week_number}</h5>
                                      <div className="week-actions">
                                        <motion.button
                                          className="edit-btn"
                                          onClick={e => {
                                            e.stopPropagation()
                                            setEditWeekData(week)
                                            setShowEditWeek(true)
                                          }}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <FaEdit />
                                        </motion.button>
                                        <motion.button
                                          className="delete-btn"
                                          onClick={e => {
                                            e.stopPropagation()
                                            handleDeleteWeek(week._id)
                                          }}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <FaTrash />
                                        </motion.button>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <>
                                        <p>{week.title}</p>
                                        <p>{week.description}</p>
                                        {week.lab_task && (
                                          <div className="lab-task-table">
                                            <div className="lab-task-row">
                                              <div>Week {week.week_number}</div>
                                              <div>Lab Task:</div>
                                              <div>{week.lab_task.title}</div>
                                              <div>What to implement:</div>
                                              <div>{week.lab_task.description}</div>
                                            </div>
                                          </div>
                                        )}
                                        {/* Daily Content Preview */}
                                        {week.daily_content && week.daily_content.length > 0 ? (
                                          <div className="daily-content-preview">
                                            <h6>Daily Content ({week.daily_content.length} days):</h6>
                                            <div className="daily-preview-table">
                                              <div className="preview-header">
                                                <span>Day</span>
                                                <span>Topic</span>
                                                <span>Module</span>
                                              </div>
                                              {week.daily_content.slice(0, 3).map((day, dayIndex) => (
                                                <div key={dayIndex} className="preview-row">
                                                  <span className="day-preview">Day {day.day}</span>
                                                  <span className="topic-preview">{day.topic}</span>
                                                  <span className="module-preview">{day.module}</span>
                                                </div>
                                              ))}
                                              {week.daily_content.length > 3 && (
                                                <div className="more-days">
                                                  <span>+{week.daily_content.length - 3} more days</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="no-daily-content">
                                            <p>No daily content structure</p>
                                          </div>
                                        )}
                                        <div className="week-info">
                                          <div className="submission-type">
                                            <FaFile />
                                            <span>Submission: {week.submission_type}</span>
                                          </div>
                                          {week.resources && week.resources.length > 0 && (
                                            <div className="resources-count">
                                              <FaLink />
                                              <span>{week.resources.length} Resources</span>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Students Section */}
                          <div className="students-section">
                            <div className="students-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: studentsExpanded ? 20 : 0 }} onClick={() => setStudentsExpanded(exp => !exp)}>
                              <h4>Enrolled Students ({students.length})</h4>
                              <span style={{ fontSize: 22, color: 'var(--neon-cyan)', marginLeft: 10 }}>
                                {studentsExpanded ? '▼' : '►'}
                              </span>
                            </div>
                            {studentsExpanded && (
                              <div className="students-grid">
                                {students.map((student, index) => (
                                  <div key={student.user_id || index} className="student-card">
                                    <div className="student-info">
                                      <div className="avatar">
                                        {student.fullName?.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <h5>{student.fullName}</h5>
                                        <p>{student.user_id}</p>
                                      </div>
                                    </div>
                                    <span className="status">{student.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Submissions Section */}
                          <div className="submissions-section">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <h4>Recent Submissions ({submissions.length})</h4>
                              {submissions.some(s => s.status === 'pending') && (
                                <motion.button
                                  className="approve-all-btn"
                                  style={{ background: 'var(--neon-green)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
                                  onClick={async () => {
                                    for (const submission of submissions) {
                                      if (submission.status === 'pending') {
                                        await managerAPI.reviewSubmission(submission._id, { status: 'approved' })
                                      }
                                    }
                                    await fetchInternshipDetails(selectedInternship._id)
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Approve All Pending
                                </motion.button>
                              )}
                            </div>
                            <div className="submissions-grid">
                              {/* Group submissions by week */}
                              {Array.from(new Set(submissions.map(s => s.week))).map(weekNum => {
                                const weekSubs = submissions.filter(s => s.week === weekNum)
                                const pendingSubs = weekSubs.filter(s => s.status && s.status.toLowerCase() === 'pending')
                                const showBulkApprove = pendingSubs.length > 0
                                return (
                                  <div key={weekNum} style={{ marginBottom: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                      <span style={{ fontWeight: 700, color: 'var(--neon-cyan)', fontSize: '1.1rem' }}>Week {weekNum}</span>
                                      {showBulkApprove && (
                                        <motion.button
                                          className="bulk-approve-btn"
                                          style={{ background: 'var(--neon-green)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 0 10px var(--neon-green, #00ffae)' }}
                                          onClick={async () => {
                                            for (const submission of pendingSubs) {
                                              await managerAPI.reviewSubmission(submission._id, { status: 'approved' })
                                            }
                                            await fetchInternshipDetails(selectedInternship._id)
                                          }}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          Bulk Approve ({pendingSubs.length})
                                        </motion.button>
                                      )}
                                    </div>
                                    {weekSubs.map((submission, index) => {
                                      // Defensive: fallback key if _id is missing
                                      const submissionKey = submission._id || `${submission.user_id}-${submission.week}`;
                                      return (
                                        <div key={submissionKey} className="submission-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, background: 'rgba(22,22,38,0.7)', marginBottom: 10, flexWrap: 'wrap' }}>
                                          <div style={{ flex: 2 }}>
                                            <div className="submission-info">
                                              <h5>{submission.fullName}</h5>
                                              <p>Week {submission.week}</p>
                                              <span className="status">{submission.status}</span>
                                              <div className="link-info">
                                                <p><strong>GitHub:</strong> <a href={submission.githubLink} target="_blank" rel="noopener noreferrer">View Code</a></p>
                                                <p><strong>Live Demo:</strong> <a href={submission.deployedLink} target="_blank" rel="noopener noreferrer">View Demo</a></p>
                                                <p><strong>Type:</strong> Link Submission</p>
                                              </div>
                                            </div>
                                          </div>
                                          <span className="status" style={{ background: submission.status && submission.status.toLowerCase() === 'pending' ? 'var(--neon-orange)' : submission.status && submission.status.toLowerCase() === 'approved' ? 'var(--neon-green)' : 'var(--neon-red)', color: '#fff', borderRadius: 16, padding: '4px 16px', fontWeight: 700, fontSize: '0.95rem', marginRight: 8 }}>{submission.status}</span>
                                          <div className="submission-links" style={{ display: 'flex', gap: 8 }}>
                                            <a href={submission.githubLink} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(0,249,255,0.1)', color: 'var(--neon-magenta)', borderRadius: 10, padding: '6px 14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid var(--neon-cyan)' }}>
                                              GitHub
                                            </a>
                                            <a href={submission.deployedLink} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(0,249,255,0.1)', color: 'var(--neon-magenta)', borderRadius: 10, padding: '6px 14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid var(--neon-cyan)' }}>
                                              Live Demo
                                            </a>
                                          </div>
                                          {submission.status && submission.status.toLowerCase() === 'pending' && (
                                            <div style={{ display: 'flex', gap: 10, marginLeft: 16, flexWrap: 'wrap' }}>
                                              <motion.button
                                                style={{ background: 'var(--neon-green)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 0 10px var(--neon-green, #00ffae)' }}
                                                onClick={async () => {
                                                  if (!submission._id) {
                                                    alert('Submission ID missing! Cannot approve.');
                                                    return;
                                                  }
                                                  await managerAPI.reviewSubmission(submission._id, { status: 'approved' })
                                                  await fetchInternshipDetails(selectedInternship._id)
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                              >
                                                Approve
                                              </motion.button>
                                              <motion.button
                                                style={{ background: 'var(--neon-red)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 0 10px var(--neon-red, #ff2d55)' }}
                                                onClick={async () => {
                                                  if (!submission._id) {
                                                    alert('Submission ID missing! Cannot reject.');
                                                    return;
                                                  }
                                                  await managerAPI.reviewSubmission(submission._id, { status: 'rejected' })
                                                  await fetchInternshipDetails(selectedInternship._id)
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                              >
                                                Reject
                                              </motion.button>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )})}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Certificate Management</h2>
                    <p>Unlock certificates and LORs for eligible students</p>
                  </div>

                  {!selectedInternship ? (
                    <div className="no-internship-selected">
                      <FaCertificate style={{ fontSize: '3rem', color: 'var(--neon-cyan)', marginBottom: '1rem' }} />
                      <h3>Select an Internship</h3>
                      <p>Please select an internship from the Internships tab to manage certificates.</p>
                    </div>
                  ) : (
                    <div className="certificate-management">
                      <div className="certificate-header">
                        <h3>{selectedInternship.track_name} - Certificate Management</h3>
                        <p className="certificate-subtitle">
                          Showing {studentsWithCertificates.length} student{studentsWithCertificates.length !== 1 ? 's' : ''} with 100% course completion
                        </p>
                        <div className="certificate-controls">
                          <select
                            value={certificateType}
                            onChange={(e) => setCertificateType(e.target.value)}
                            className="certificate-type-select"
                          >
                            <option value="completion">Certificate of Completion</option>
                            <option value="lor">Letter of Recommendation (LOR)</option>
                          </select>
                          <motion.button
                            className="bulk-unlock-btn"
                            onClick={() => setShowBulkUnlockModal(true)}
                            disabled={selectedStudents.length === 0}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaUnlock />
                            Bulk Unlock ({selectedStudents.length})
                          </motion.button>
                          <motion.button
                            className="recalculate-btn"
                            onClick={async () => {
                              setProcessing(true)
                              try {
                                await managerAPI.recalculateCompletion()
                                await fetchStudentsWithCertificates(selectedInternship._id)
                                setError('')
                              } catch (error) {
                                setError(error.message || 'Failed to recalculate completion percentages')
                              } finally {
                                setProcessing(false)
                              }
                            }}
                            disabled={processing}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaSpinner className={processing ? 'spinner' : ''} />
                            Recalculate Progress
                          </motion.button>
                          <motion.button
                            className="bulk-unlock-btn"
                            style={{ background: 'var(--neon-magenta)', color: '#fff' }}
                            onClick={() => setShowProjectModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaPlus />
                            Create Project
                          </motion.button>
                        </div>
                      </div>

                      <div className="certificate-filters">
                        <motion.button
                          className="filter-btn"
                          onClick={handleSelectAllStudents}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Select All Eligible
                        </motion.button>
                        <motion.button
                          className="filter-btn"
                          onClick={handleClearSelection}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Clear Selection
                        </motion.button>
                      </div>

                      <div className="certificate-requirements-note">
                        <FaExclamationTriangle style={{ color: 'var(--neon-cyan)', marginRight: '0.5rem' }} />
                        <span>
                          <strong>Eligibility:</strong> Only students with 100% course completion are shown. 
                          For LORs, students must also have project status "Completed" or "Excellent".
                        </span>
                      </div>

                      <div className="students-certificate-grid">
                        {studentsWithCertificates.map((student, index) => {
                          const certStatus = getCertificateStatus(student, certificateType)
                          const isSelected = selectedStudents.includes(student.user_id)
                          const isEligible = certStatus.status === 'eligible'
                          
                          return (
                            <motion.div
                              key={student.user_id || index}
                              className={`student-certificate-card ${isSelected ? 'selected' : ''} ${certStatus.status}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <div className="student-certificate-header">
                                <div className="student-info">
                                  <div className="avatar">
                                    {student.fullName?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h5>{student.fullName}</h5>
                                    <p>{student.user_id}</p>
                                  </div>
                                </div>
                                <div className="certificate-status" style={{ color: certStatus.color }}>
                                  {certStatus.icon}
                                  <span>{certStatus.status.toUpperCase()}</span>
                                </div>
                              </div>

                              <div className="student-certificate-details">
                                {certificateType === 'completion' ? (
                                  <div className="completion-details">
                                    <p><strong>Course Completion:</strong> {student.course_completion_percentage || 0}%</p>
                                    {student.certificate_unlocked && (
                                      <p><strong>Unlocked:</strong> {new Date(student.certificate_unlocked_at).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="lor-details">
                                    <p><strong>Project Status:</strong> {student.project_completion_status || 'Not Started'}</p>
                                    {student.lor_unlocked && (
                                      <p><strong>Unlocked:</strong> {new Date(student.lor_unlocked_at).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="student-certificate-actions">
                                {isEligible && (
                                  <label className="select-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleStudentSelection(student.user_id)}
                                    />
                                    <span>Select for bulk unlock</span>
                                  </label>
                                )}
                                
                                {certStatus.status === 'eligible' && (
                                  <motion.button
                                    className="unlock-btn"
                                    onClick={() => handleUnlockCertificate(student.user_id, certificateType)}
                                    disabled={processing}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaUnlock />
                                    Unlock {certificateType === 'completion' ? 'Certificate' : 'LOR'}
                                  </motion.button>
                                )}
                                
                                {certStatus.status === 'generated' && (
                                  <div className="generated-status">
                                    <FaCheckCircle />
                                    <span>Generated</span>
                                  </div>
                                )}
                                
                                {certStatus.status === 'unlocked' && (
                                  <div className="unlocked-status">
                                    <FaCheckCircle />
                                    <span>Unlocked</span>
                                    <motion.button
                                      className="generate-btn"
                                      onClick={() => handleGenerateCertificate(student.user_id, certificateType)}
                                      disabled={processing}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <FaDownload />
                                      Generate
                                    </motion.button>
                                  </div>
                                )}
                                
                                {certStatus.status === 'locked' && (
                                  <div className="locked-status">
                                    <FaLock />
                                    <span>Not Eligible</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {studentsWithCertificates.length === 0 && (
                        <div className="no-students">
                          <FaUsers style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                          <p>No students with 100% course completion found for this internship track.</p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Only students who have completed 100% of their course are eligible for certificates.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'student-reports' && (
                <motion.div
                  key="student-reports"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Student Reports</h2>
                    <p>Generate reports for enrolled students</p>
                  </div>

                  {!selectedInternship ? (
                    <div className="no-internship-selected">
                      <FaCertificate style={{ fontSize: '3rem', color: 'var(--neon-cyan)', marginBottom: '1rem' }} />
                      <h3>Select an Internship</h3>
                      <p>Please select an internship from the Internships tab to generate reports.</p>
                    </div>
                  ) : (
                    <div className="student-reports">
                      <div className="report-info">
                        <div className="internship-summary">
                          <h3>Selected Internship: {selectedInternship.track_name}</h3>
                          <p><strong>Duration:</strong> {selectedInternship.duration}</p>
                          <p><strong>Description:</strong> {selectedInternship.description}</p>
                          <p><strong>Enrolled Students:</strong> {students.length}</p>
                        </div>
                        
                        <div className="report-actions">
                          <motion.button
                            className="download-csv-btn"
                            onClick={() => exportStudentsToCSV(selectedInternship._id)}
                            disabled={processing}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {processing ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              <FaDownload />
                            )}
                            Download Student Report (CSV)
                          </motion.button>
                        </div>
                      </div>

                      <div className="report-preview">
                        <h4>Report Preview</h4>
                        <p>The CSV file will include the following information for each student:</p>
                        <ul>
                          <li>Full Name, User ID, Email, Mobile/WhatsApp</li>
                          <li>Internship Track, College, Year of Study, Passout Year</li>
                          <li>Status, Registration Date, Activation Date</li>
                          <li>Course Completion Percentage</li>
                          <li>Certificate and LOR unlock status and dates</li>
                          <li>Project status and completion status</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'announcements' && (
                <motion.div
                  key="announcements"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Announcements</h2>
                    <motion.button
                      className="add-btn"
                      onClick={() => setShowAddAnnouncement(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlus />
                      Create Announcement
                    </motion.button>
                  </div>

                  <div className="announcements-grid">
                    {announcements.map((announcement, index) => (
                      <motion.div
                        key={announcement._id || index}
                        className="announcement-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="announcement-header">
                          <h3>{announcement.title}</h3>
                          <div className="announcement-actions">
                            <motion.button
                              className="edit-btn"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              className="delete-btn"
                              onClick={() => handleDeleteAnnouncement(announcement._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
                        </div>
                        
                        <p>{announcement.content}</p>
                        
                        <div className="announcement-footer">
                          <span 
                            className="priority"
                            style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                          >
                            {announcement.priority}
                          </span>
                          <span className="date">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Add Internship Modal */}
        <AnimatePresence>
          {showAddInternship && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddInternship(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Create New Internship</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAddInternship(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <form onSubmit={handleCreateInternship} className="modal-form">
                  <div className="form-group">
                    <label>Track Name *</label>
                    <input
                      type="text"
                      value={newInternship.track_name}
                      onChange={(e) => setNewInternship(prev => ({
                        ...prev,
                        track_name: e.target.value
                      }))}
                      placeholder="e.g., Advanced React Development"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration *</label>
                    <input
                      type="text"
                      value={newInternship.duration}
                      onChange={(e) => setNewInternship(prev => ({
                        ...prev,
                        duration: e.target.value
                      }))}
                      placeholder="e.g., 6 weeks"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={newInternship.description}
                      onChange={(e) => setNewInternship(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Brief description of the internship..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddInternship(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaPlus />
                      )}
                      Create Internship
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Week Modal */}
        <AnimatePresence>
          {showAddWeek && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddWeek(false)}
            >
              <motion.div
                className="modal large-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Add New Week - Tabular Structure</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAddWeek(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <form onSubmit={handleAddWeek} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Week Number *</label>
                      <input
                        type="number"
                        value={newWeek.week_number}
                        onChange={(e) => setNewWeek(prev => ({
                          ...prev,
                          week_number: e.target.value
                        }))}
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Week Title *</label>
                      <input
                        type="text"
                        value={newWeek.title}
                        onChange={(e) => setNewWeek(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="e.g., Introduction to React Hooks"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Week Description *</label>
                    <textarea
                      value={newWeek.description}
                      onChange={(e) => setNewWeek(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Week description and learning objectives..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lab Task</label>
                    <input
                      type="text"
                      value={newWeek.lab_task?.title || ''}
                      onChange={e => setNewWeek(prev => ({
                        ...prev,
                        lab_task: { ...prev.lab_task, title: e.target.value }
                      }))}
                      placeholder="Lab Task Title (e.g., Build a ToDo App)"
                    />
                    <label style={{marginTop:8}}>What to implement</label>
                    <textarea
                      value={newWeek.lab_task?.description || ''}
                      onChange={e => setNewWeek(prev => ({
                        ...prev,
                        lab_task: { ...prev.lab_task, description: e.target.value }
                      }))}
                      placeholder="Describe what students should implement..."
                      rows="3"
                      style={{resize:'vertical'}}
                    />
                  </div>

                  {/* Daily Content Table */}
                  <div className="daily-content-section">
                    <div className="section-header">
                      <h4>Daily Content Structure</h4>
                      <div className="day-controls">
                        <span className="day-count">
                          {newWeek.daily_content.length} day{newWeek.daily_content.length !== 1 ? 's' : ''} 
                          (Max: 7)
                        </span>
                        {newWeek.daily_content.length < 7 && (
                          <motion.button
                            type="button"
                            className="add-day-btn"
                            onClick={addDayToWeek}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaPlus />
                            Add Day
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <div className="daily-content-table">
                      <div className="table-header">
                        <div className="header-cell">Day</div>
                        <div className="header-cell">Topic</div>
                        <div className="header-cell">Main Learning</div>
                        <div className="header-cell">Module</div>
                        <div className="header-cell">Reference Link</div>
                        <div className="header-cell">Actions</div>
                      </div>

                      <div className="table-body">
                        {newWeek.daily_content.map((day, index) => (
                          <div key={index} className="table-row">
                            <div className="table-cell day-cell">
                              <span className="day-number">Day {day.day}</span>
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.topic}
                                onChange={(e) => updateDayContent(index, 'topic', e.target.value)}
                                placeholder="e.g., React Hooks Basics"
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.main_learning}
                                onChange={(e) => updateDayContent(index, 'main_learning', e.target.value)}
                                placeholder="e.g., Understanding useState and useEffect"
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.module}
                                onChange={(e) => updateDayContent(index, 'module', e.target.value)}
                                placeholder="e.g., React Fundamentals"
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="url"
                                value={day.reference_link}
                                onChange={(e) => updateDayContent(index, 'reference_link', e.target.value)}
                                placeholder="https://react.dev/docs/hooks"
                                required
                              />
                            </div>
                            <div className="table-cell actions-cell">
                              {newWeek.daily_content.length > 1 && (
                                <motion.button
                                  type="button"
                                  className="remove-day-btn"
                                  onClick={() => removeDayFromWeek(index)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaTrash />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Reference Resources (Optional)</label>
                    <div className="resources-input">
                      <input
                        type="text"
                        placeholder="Resource title"
                        id="resource-title"
                      />
                      <input
                        type="url"
                        placeholder="Resource URL"
                        id="resource-url"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const title = document.getElementById('resource-title').value
                          const url = document.getElementById('resource-url').value
                          if (title && url) {
                            setNewWeek(prev => ({
                              ...prev,
                              resources: [...prev.resources, { title, link: url }]
                            }))
                            document.getElementById('resource-title').value = ''
                            document.getElementById('resource-url').value = ''
                          }
                        }}
                      >
                        Add Resource
                      </button>
                    </div>
                    {newWeek.resources.length > 0 && (
                      <div className="resources-list">
                        {newWeek.resources.map((resource, index) => (
                          <div key={index} className="resource-item">
                            <span>{resource.title}</span>
                            <button
                              type="button"
                              onClick={() => setNewWeek(prev => ({
                                ...prev,
                                resources: prev.resources.filter((_, i) => i !== index)
                              }))}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddWeek(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaPlus />
                      )}
                      Add Week
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Announcement Modal */}
        <AnimatePresence>
          {showAddAnnouncement && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAnnouncement(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Create Announcement</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAddAnnouncement(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="modal-form">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      placeholder="Announcement title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Content *</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      placeholder="Announcement content..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({
                        ...prev,
                        priority: e.target.value
                      }))}
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddAnnouncement(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaPlus />
                      )}
                      Create Announcement
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Unlock Modal */}
        <AnimatePresence>
          {showBulkUnlockModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkUnlockModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Bulk Unlock {certificateType === 'completion' ? 'Certificates' : 'LORs'}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowBulkUnlockModal(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-content">
                  <div className="bulk-unlock-info">
                    <FaExclamationTriangle style={{ color: 'var(--neon-orange)', fontSize: '2rem', marginBottom: '1rem' }} />
                    <h4>Confirm Bulk Unlock</h4>
                    <p>
                      You are about to unlock {certificateType === 'completion' ? 'certificates' : 'LORs'} for {selectedStudents.length} selected students.
                    </p>
                    
                    <div className="selected-students-list">
                      <h5>Selected Students:</h5>
                      <ul>
                        {studentsWithCertificates
                          .filter(student => selectedStudents.includes(student.user_id))
                          .map(student => (
                            <li key={student.user_id}>
                              {student.fullName} ({student.user_id})
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="bulk-unlock-requirements">
                      <h5>Requirements:</h5>
                      {certificateType === 'completion' ? (
                        <ul>
                          <li>✅ 100% course completion (all students shown meet this requirement)</li>
                        </ul>
                      ) : (
                        <ul>
                          <li>✅ 100% course completion (all students shown meet this requirement)</li>
                          <li>✅ Project status: Completed or Excellent</li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowBulkUnlockModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="submit-btn"
                      onClick={handleBulkUnlockCertificates}
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaUnlock />
                      )}
                      Confirm Bulk Unlock
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Approval Required Modal */}
        <AnimatePresence>
          {showAdminApprovalModal && adminApprovalData && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminApprovalModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Admin Approval Required</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAdminApprovalModal(false)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-content">
                  <div className="admin-approval-info">
                    <FaExclamationTriangle style={{ color: 'var(--neon-orange)', fontSize: '2rem', marginBottom: '1rem' }} />
                    <h4>Admin Approval Needed</h4>
                    <p>{adminApprovalData.message}</p>
                    
                    {adminApprovalData.students && (
                      <div className="students-requiring-approval">
                        <h5>Students requiring admin approval:</h5>
                        <ul>
                          {adminApprovalData.students.map(student => (
                            <li key={student.user_id}>
                              {student.name} ({student.user_id})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="admin-approval-actions">
                      <p><strong>Action Required:</strong></p>
                      <p>Please contact the admin to grant approval for {adminApprovalData.certificate_type === 'completion' ? 'certificate' : 'LOR'} unlocks.</p>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="submit-btn"
                      onClick={() => setShowAdminApprovalModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Understood
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Week Modal */}
        <AnimatePresence>
          {showEditWeek && editWeekData && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditWeek(false)}
            >
              <motion.div
                className="modal large-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Edit Week</h3>
                  <button className="close-btn" onClick={() => setShowEditWeek(false)}>
                    <FaTimesCircle />
                  </button>
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault()
                    setProcessing(true)
                    try {
                      await managerAPI.updateWeek(selectedInternship._id, editWeekData._id, editWeekData)
                      await fetchInternshipDetails(selectedInternship._id)
                      setShowEditWeek(false)
                      setEditWeekData(null)
                    } catch (error) {
                      setError(error.message || 'Failed to update week')
                    } finally {
                      setProcessing(false)
                    }
                  }}
                  className="modal-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Week Number *</label>
                      <input
                        type="number"
                        value={editWeekData.week_number}
                        onChange={e => setEditWeekData(prev => ({ ...prev, week_number: e.target.value }))}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Week Title *</label>
                      <input
                        type="text"
                        value={editWeekData.title}
                        onChange={e => setEditWeekData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Week Description *</label>
                    <textarea
                      value={editWeekData.description}
                      onChange={e => setEditWeekData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Lab Task</label>
                    <input
                      type="text"
                      value={editWeekData.lab_task?.title || ''}
                      onChange={e => setEditWeekData(prev => ({
                        ...prev,
                        lab_task: { ...prev.lab_task, title: e.target.value }
                      }))}
                      placeholder="Lab Task Title (e.g., Build a ToDo App)"
                    />
                    <label style={{marginTop:8}}>What to implement</label>
                    <textarea
                      value={editWeekData.lab_task?.description || ''}
                      onChange={e => setEditWeekData(prev => ({
                        ...prev,
                        lab_task: { ...prev.lab_task, description: e.target.value }
                      }))}
                      placeholder="Describe what students should implement..."
                      rows="3"
                      style={{resize:'vertical'}}
                    />
                  </div>
                  {/* Daily Content Table (reuse logic as Add Week) */}
                  <div className="daily-content-section">
                    <div className="section-header">
                      <h4>Daily Content Structure</h4>
                      <div className="day-controls">
                        <span className="day-count">
                          {editWeekData.daily_content.length} day{editWeekData.daily_content.length !== 1 ? 's' : ''} (Max: 7)
                        </span>
                        {editWeekData.daily_content.length < 7 && (
                          <motion.button
                            type="button"
                            className="add-day-btn"
                            onClick={() => setEditWeekData(prev => ({
                              ...prev,
                              daily_content: [
                                ...prev.daily_content,
                                { day: prev.daily_content.length + 1, topic: '', main_learning: '', module: '', reference_link: '' }
                              ]
                            }))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaPlus />
                            Add Day
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <div className="daily-content-table">
                      <div className="table-header">
                        <div className="header-cell">Day</div>
                        <div className="header-cell">Topic</div>
                        <div className="header-cell">Main Learning</div>
                        <div className="header-cell">Module</div>
                        <div className="header-cell">Reference Link</div>
                        <div className="header-cell">Actions</div>
                      </div>
                      <div className="table-body">
                        {editWeekData.daily_content.map((day, index) => (
                          <div key={index} className="table-row">
                            <div className="table-cell day-cell">
                              <span className="day-number">Day {day.day}</span>
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.topic}
                                onChange={e => setEditWeekData(prev => ({
                                  ...prev,
                                  daily_content: prev.daily_content.map((d, i) => i === index ? { ...d, topic: e.target.value } : d)
                                }))}
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.main_learning}
                                onChange={e => setEditWeekData(prev => ({
                                  ...prev,
                                  daily_content: prev.daily_content.map((d, i) => i === index ? { ...d, main_learning: e.target.value } : d)
                                }))}
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="text"
                                value={day.module}
                                onChange={e => setEditWeekData(prev => ({
                                  ...prev,
                                  daily_content: prev.daily_content.map((d, i) => i === index ? { ...d, module: e.target.value } : d)
                                }))}
                                required
                              />
                            </div>
                            <div className="table-cell">
                              <input
                                type="url"
                                value={day.reference_link}
                                onChange={e => setEditWeekData(prev => ({
                                  ...prev,
                                  daily_content: prev.daily_content.map((d, i) => i === index ? { ...d, reference_link: e.target.value } : d)
                                }))}
                                required
                              />
                            </div>
                            <div className="table-cell actions-cell">
                              {editWeekData.daily_content.length > 1 && (
                                <motion.button
                                  type="button"
                                  className="remove-day-btn"
                                  onClick={() => setEditWeekData(prev => ({
                                    ...prev,
                                    daily_content: prev.daily_content.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
                                  }))}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaTrash />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Reference Resources (Optional)</label>
                    <div className="resources-input">
                      <input type="text" placeholder="Resource title" id="edit-resource-title" />
                      <input type="url" placeholder="Resource URL" id="edit-resource-url" />
                      <button
                        type="button"
                        onClick={() => {
                          const title = document.getElementById('edit-resource-title').value
                          const url = document.getElementById('edit-resource-url').value
                          if (title && url) {
                            setEditWeekData(prev => ({
                              ...prev,
                              resources: [...(prev.resources || []), { title, link: url }]
                            }))
                            document.getElementById('edit-resource-title').value = ''
                            document.getElementById('edit-resource-url').value = ''
                          }
                        }}
                      >
                        Add Resource
                      </button>
                    </div>
                    {editWeekData.resources && editWeekData.resources.length > 0 && (
                      <div className="resources-list">
                        {editWeekData.resources.map((resource, index) => (
                          <div key={index} className="resource-item">
                            <span>{resource.title}</span>
                            <button
                              type="button"
                              onClick={() => setEditWeekData(prev => ({
                                ...prev,
                                resources: prev.resources.filter((_, i) => i !== index)
                              }))}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowEditWeek(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? <FaSpinner className="spinner" /> : <FaEdit />} Update Week
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Project Modal */}
        <AnimatePresence>
          {showProjectModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProjectModal(false)}
            >
              <motion.div
                className="modal large-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Create Project Assignment</h3>
                  <button className="close-btn" onClick={() => {
                    setShowProjectModal(false)
                    setStudentSearchResults([])
                    setProjectStudent(null)
                  }}>
                    <FaTimesCircle />
                  </button>
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault()
                    setProjectLoading(true)
                    setProjectError('')
                    try {
                      // Assign project using template
                      await managerAPI.assignProject({
                        user_id: projectForm.userId,
                        template_id: projectForm.templateId
                      })
                      setProjectError('')
                      setProjectLoading(false)
                      alert('Project assigned!')
                      setShowProjectModal(false)
                      setProjectForm({ userId: '', templateId: '' })
                      setProjectStudent(null)
                      // Refresh project list
                      const res = await managerAPI.listProjects(selectedInternship._id)
                      setProjectList(res.projects || [])
                    } catch (err) {
                      setProjectError('Error assigning project')
                      setProjectLoading(false)
                    }
                  }}
                  className="modal-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Student User ID *</label>
                      <div className="student-id-input-container">
                        <input
                          type="text"
                          value={projectForm.userId}
                          onChange={handleStudentIdChange}
                          onKeyDown={handleStudentIdKeyDown}
                          placeholder="Enter numbers (e.g., 12345) or full ID (VEDARC-12345)"
                          required
                        />
                        {isSearching && (
                          <div className="search-spinner">
                            <FaSpinner className="spinner" />
                          </div>
                        )}
                      </div>
                      {/* Search Results Dropdown */}
                      {studentSearchResults.length > 0 && (
                        <div className="search-results-dropdown">
                          {studentSearchResults.map((student, index) => (
                            <div
                              key={student.user_id}
                              className="search-result-item"
                              data-result-index={index}
                              onClick={() => selectStudent(student)}
                            >
                              <div className="student-avatar">
                                {student.fullName?.charAt(0).toUpperCase()}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{student.fullName}</div>
                                <div className="student-id">{student.user_id}</div>
                              </div>
                              <div className="student-status">{student.status}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Project Template *</label>
                      <select
                        value={projectForm.templateId}
                        onChange={e => setProjectForm(prev => ({ ...prev, templateId: e.target.value }))}
                        required
                      >
                        <option value="">Select a project template</option>
                        {projectTemplates.map(template => (
                          <option key={template._id} value={template._id}>
                            {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {projectError && <div className="error-banner">{projectError}</div>}
                  {projectStudent && (
                    <div className="student-card" style={{ margin: '20px 0', background: 'rgba(0,249,255,0.05)' }}>
                      <div className="student-info">
                        <div className="avatar">{projectStudent.fullName?.charAt(0).toUpperCase()}</div>
                        <div>
                          <h5>{projectStudent.fullName}</h5>
                          <p>{projectStudent.user_id}</p>
                        </div>
                      </div>
                      <span className="status">{projectStudent.status}</span>
                    </div>
                  )}
                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowProjectModal(false)
                        setStudentSearchResults([])
                        setProjectStudent(null)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={projectLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {projectLoading ? <FaSpinner className="spinner" /> : <FaPlus />} Assign Project
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project List Section */}
        {selectedInternship && (
          <div className="project-list-section">
            <h3>Assigned Projects</h3>
            <div className="project-list-grid">
              {projectList.length === 0 && <p>No projects assigned yet.</p>}
              {projectList.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h4>{project.title}</h4>
                    <span className="project-status">{project.status}</span>
                  </div>
                  <p><strong>Student:</strong> {project.user_id}</p>
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Upload Link:</strong> {project.upload_link ? <a href={getSafeUrl(project.upload_link)} target="_blank" rel="noopener noreferrer">View</a> : 'Not submitted'}</p>
                  {project.status === 'Submitted' && (
                    <div className="project-actions">
                      <button onClick={async () => {
                        await managerAPI.reviewProject({ project_id: project._id, review_status: 'Approved' })
                        // Refresh both project list and studentsWithCertificates
                        const [projectsRes, studentsRes] = await Promise.all([
                          managerAPI.listProjects(selectedInternship._id),
                          managerAPI.getStudentsWithCertificates(selectedInternship._id)
                        ])
                        setProjectList(projectsRes.projects || [])
                        setStudentsWithCertificates(studentsRes.students || [])
                        alert('Project approved and LOR unlocked!')
                      }}>Approve</button>
                      <button onClick={async () => {
                        await managerAPI.reviewProject({ project_id: project._id, review_status: 'Rejected' })
                        const [projectsRes, studentsRes] = await Promise.all([
                          managerAPI.listProjects(selectedInternship._id),
                          managerAPI.getStudentsWithCertificates(selectedInternship._id)
                        ])
                        setProjectList(projectsRes.projects || [])
                        setStudentsWithCertificates(studentsRes.students || [])
                        alert('Project rejected!')
                      }}>Reject</button>
                    </div>
                  )}
                  {project.review_status && <p><strong>Review:</strong> {project.review_status} {project.review_feedback && `- ${project.review_feedback}`}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Project Templates section */}
        {selectedInternship && (
          <div className="project-templates-section">
            <div className="section-header">
              <h3>Project Templates</h3>
              <motion.button
                className="add-btn"
                onClick={() => openTemplateModal()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                Create Template
              </motion.button>
            </div>
            <div className="templates-grid">
              {projectTemplates.length === 0 && <p>No project templates created yet.</p>}
              {projectTemplates.map(template => (
                <div key={template._id} className="template-card">
                  <div className="template-header">
                    <h4>{template.title}</h4>
                    <div className="template-actions">
                      <motion.button
                        className="edit-btn"
                        onClick={() => openTemplateModal(template)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        className="delete-btn"
                        onClick={() => handleDeleteTemplate(template._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                  <p><strong>Description:</strong> {template.description}</p>
                  {template.upload_link && (
                    <p><strong>Upload Link:</strong> <a href={template.upload_link} target="_blank" rel="noopener noreferrer">View</a></p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Template Modal */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplateModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>{editingTemplate ? 'Edit Project Template' : 'Create Project Template'}</h3>
                  <button className="close-btn" onClick={() => setShowTemplateModal(false)}>
                    <FaTimesCircle />
                  </button>
                </div>
                <form
                  onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  className="modal-form"
                >
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      value={templateForm.title}
                      onChange={e => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Description *</label>
                    <textarea
                      value={templateForm.description}
                      onChange={e => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload Link (Optional)</label>
                    <input
                      type="url"
                      value={templateForm.uploadLink}
                      onChange={e => setTemplateForm(prev => ({ ...prev, uploadLink: e.target.value }))}
                    />
                  </div>
                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowTemplateModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? <FaSpinner className="spinner" /> : <FaPlus />}
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Toggle UI (Manager only) */}
        {isManager && (
          <div style={{ margin: '24px 0', padding: '16px', background: '#f6f6ff', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 600 }}>Internship Registration:</span>
            <button
              onClick={handleToggle}
              disabled={toggleLoading}
              style={{
                background: registrationEnabled ? '#4caf50' : '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '8px 20px',
                cursor: toggleLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 16
              }}
            >
              {toggleLoading ? 'Saving...' : registrationEnabled ? 'ON' : 'OFF'}
            </button>
            <span style={{ color: registrationEnabled ? '#4caf50' : '#f44336', fontWeight: 500 }}>
              {registrationEnabled ? 'Registration link is visible to users.' : 'Registration link is hidden from users.'}
            </span>
            {toggleError && <span style={{ color: '#f44336', marginLeft: 16 }}>{toggleError}</span>}
          </div>
        )}
      </div>
    </div>
  )
} 