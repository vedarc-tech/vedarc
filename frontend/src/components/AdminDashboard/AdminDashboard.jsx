import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaCode, FaCalendarAlt, FaCheckCircle, FaTimes, FaSignInAlt, FaSignOutAlt, FaBook, FaUpload, FaDownload, FaLink, FaEye, FaPlus, FaEdit, FaTrash, FaFilter, FaChartBar, FaUserShield, FaSpinner, FaTimesCircle, FaTrophy, FaCertificate, FaSearch, FaKey, FaArrowsAlt, FaFont, FaPalette } from 'react-icons/fa'
import { adminAPI, authService } from '../../services/apiService'
import './AdminDashboard.css'
import { Rnd } from 'react-rnd'
import { Tooltip } from 'react-tooltip'
import CertificateTemplateEditor from './CertificateTemplateEditor'
import { saveAs } from 'file-saver'

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [users, setUsers] = useState([])
  const [internships, setInternships] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [availableTracks, setAvailableTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [filters, setFilters] = useState({
    track: '',
    status: '',
    search: ''
  })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [certificateLink, setCertificateLink] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showAddWeek, setShowAddWeek] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [userTypes, setUserTypes] = useState([])
  const [passwordResetData, setPasswordResetData] = useState({
    user_id: '',
    user_type: ''
  })
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    user_type: '',
    username: '',
    password: ''
  })
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [createUserMessage, setCreateUserMessage] = useState('')
  const [newInternship, setNewInternship] = useState({
    track_name: '',
    duration: '',
    description: ''
  })
  const [newWeek, setNewWeek] = useState({
    week_number: '',
    title: '',
    description: '',
    track: '',
    resources: []
  })
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false)
  const [certificateData, setCertificateData] = useState({
    type: 'completion',
    student_id: '',
    student_name: '',
    track_name: '',
    completion_date: '',
    manager_name: '',
    custom_text: ''
  })
  const [certificateTemplate, setCertificateTemplate] = useState({
    background_color: '#0a0a12',
    text_color: '#00f9ff',
    border_color: '#7b2dff',
    logo_url: '',
    signature_url: '',
    font_family: 'Arial',
    font_size: '16px'
  })

  // Certificate approval states
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [selectedApprovalStudents, setSelectedApprovalStudents] = useState([])
  const [approvalCertificateType, setApprovalCertificateType] = useState('completion')

  // Font and gradient options
  const FONT_OPTIONS = [
    { label: 'Montserrat (Modern)', value: 'Montserrat, sans-serif' },
    { label: 'Roboto (Modern)', value: 'Roboto, sans-serif' },
    { label: 'Helvetica (Modern)', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Arial (Modern)', value: 'Arial, sans-serif' },
    { label: 'Times New Roman (Classic)', value: 'Times New Roman, serif' },
    { label: 'Georgia (Classic)', value: 'Georgia, serif' },
    { label: 'Garamond (Classic)', value: 'Garamond, serif' },
    { label: 'Playfair Display (Rich)', value: 'Playfair Display, serif' },
    { label: 'Merriweather (Rich)', value: 'Merriweather, serif' },
    { label: 'Lora (Rich)', value: 'Lora, serif' },
    { label: 'Pacifico (Authentic)', value: 'Pacifico, cursive' },
    { label: 'Dancing Script (Authentic)', value: 'Dancing Script, cursive' },
    { label: 'Great Vibes (Authentic)', value: 'Great Vibes, cursive' },
  ]
  const GRADIENT_OPTIONS = [
    { label: 'Solid Color', value: 'solid' },
    { label: 'Blue to Purple', value: 'linear-gradient(90deg, #00c6ff 0%, #7b2ff7 100%)' },
    { label: 'Gold', value: 'linear-gradient(90deg, #ffd700 0%, #ffb347 100%)' },
    { label: 'Teal to Green', value: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' },
    { label: 'Sunset', value: 'linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)' },
    { label: 'Royal', value: 'linear-gradient(90deg, #141e30 0%, #243b55 100%)' },
    { label: 'Rose', value: 'linear-gradient(90deg, #f857a6 0%, #ff5858 100%)' },
  ]
  // Add state for save type and confirmation
  const [saveType, setSaveType] = useState('completion')
  const [saveMessage, setSaveMessage] = useState('')

  // Add state for template status and proxy preview
  const [templateStatus, setTemplateStatus] = useState({ completion: false, lor: false, offer: false })
  const [showProxyModal, setShowProxyModal] = useState(false)
  const [proxyType, setProxyType] = useState('completion')
  const [proxyData, setProxyData] = useState({ studentName: '', trackName: '', completionDate: '' })
  const [proxyTemplate, setProxyTemplate] = useState(null)
  const [proxyPreviewReady, setProxyPreviewReady] = useState(false)
  const [proxyLoading, setProxyLoading] = useState(false)
  const [proxyError, setProxyError] = useState('')

  // Template management state
  const [templateEditor, setTemplateEditor] = useState({
    header_image: '',
    placeholders: {},
    orientation: 'portrait'
  })

  const [templatePreviewData, setTemplatePreviewData] = useState({
    studentName: 'John Doe',
    trackName: 'React Development',
    completionDate: '2024-06-01'
  })

  // Certificate Template Editor state
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [currentTemplateType, setCurrentTemplateType] = useState('completion')
  const [currentTemplate, setCurrentTemplate] = useState(null)

  // Fetch template status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const types = ['completion', 'lor', 'offer']
      const status = {}
      for (let t of types) {
        try {
          await adminAPI.getCertificateTemplate(t)
          status[t] = true
        } catch {
          status[t] = false
        }
      }
      setTemplateStatus(status)
    }
    fetchStatus()
  }, [])

  // Add API call in adminAPI
  // adminAPI.getCertificateTemplate = (type) => apiRequest(`/admin/certificate-template?type=${type}`)

  // Proxy generator logic
  const handleOpenProxy = async (type) => {
    setProxyType(type)
    setProxyData({ studentName: '', trackName: '', completionDate: '' })
    setProxyPreviewReady(false)
    setProxyError('')
    setShowProxyModal(true)
    setProxyLoading(true)
    try {
      const res = await adminAPI.getCertificateTemplate(type)
      setProxyTemplate(res.template)
      setProxyLoading(false)
    } catch {
      setProxyTemplate(null)
      setProxyLoading(false)
      setProxyError('No template set for this type.')
    }
  }
  const handleProxyInput = (field, value) => {
    setProxyData(prev => ({ ...prev, [field]: value }))
  }
  const handleGenerateProxyPreview = (e) => {
    e.preventDefault()
    setProxyPreviewReady(true)
  }
  const isProxyFormValid = proxyData.studentName && proxyData.trackName && proxyData.completionDate

  const renderProxyPreview = () => {
    if (!proxyTemplate) return <div style={{ color: 'red', padding: 24 }}>No template set for this type.</div>
    // Use the same renderCertificatePreview logic, but with proxyTemplate and proxyData
    const t = proxyTemplate
    const isPortrait = t.orientation === 'portrait'
    const certWidth = isPortrait ? 500 : 700
    const certHeight = isPortrait ? 700 : 500
    let previewText = t.defaultText
      .replace('{Student Name}', proxyData.studentName || 'John Doe')
      .replace('{Track Name}', proxyData.trackName || 'Demo Track')
      .replace('{Completion Date}', proxyData.completionDate || '2024-06-01')
    return (
      <div style={{
        background: t.backgroundColor,
        color: t.textColor,
        border: `4px solid ${t.borderColor}`,
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        width: certWidth,
        height: certHeight,
        margin: '0 auto',
        position: 'relative',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        padding: 40,
        overflow: 'hidden',
        backgroundImage: t.borderImageUrl ? `url(${t.borderImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Heading */}
        <Rnd
          size={{ width: t.headingWidth, height: t.headingHeight }}
          position={{ x: t.headingX, y: t.headingY }}
          disableDragging
          enableResizing={false}
          style={{ zIndex: 10 }}
        >
          <div style={{
            fontFamily: t.headingFont,
            fontSize: t.headingFontSize,
            fontWeight: t.headingFontWeight,
            fontStyle: t.headingFontStyle,
            textAlign: t.headingAlign,
            color: t.headingColorType === 'solid' ? t.headingColor : undefined,
            background: t.headingColorType === 'gradient' ? t.headingGradient : undefined,
            WebkitBackgroundClip: t.headingColorType === 'gradient' ? 'text' : undefined,
            WebkitTextFillColor: t.headingColorType === 'gradient' ? 'transparent' : undefined,
            MozBackgroundClip: t.headingColorType === 'gradient' ? 'text' : undefined,
            MozTextFillColor: t.headingColorType === 'gradient' ? 'transparent' : undefined,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: t.headingAlign,
            userSelect: 'none',
            border: '1px dashed #bbb',
            cursor: 'default',
          }}>{t.headingText}</div>
        </Rnd>
        {/* Main Text */}
        <Rnd
          size={{ width: t.textWidth, height: t.textHeight }}
          position={{ x: t.textX, y: t.textY }}
          disableDragging
          enableResizing={false}
          style={{ zIndex: 9 }}
        >
          <div style={{
            fontFamily: t.textFont,
            fontSize: t.textFontSize,
            fontWeight: t.textFontWeight,
            fontStyle: t.textFontStyle,
            textAlign: t.textAlign,
            color: t.textColorType === 'solid' ? t.textColor : undefined,
            background: t.textColorType === 'gradient' ? t.textGradient : undefined,
            WebkitBackgroundClip: t.textColorType === 'gradient' ? 'text' : undefined,
            WebkitTextFillColor: t.textColorType === 'gradient' ? 'transparent' : undefined,
            MozBackgroundClip: t.textColorType === 'gradient' ? 'text' : undefined,
            MozTextFillColor: t.textColorType === 'gradient' ? 'transparent' : undefined,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: t.textAlign,
            userSelect: 'none',
            border: '1px dashed #bbb',
            cursor: 'default',
            whiteSpace: 'pre-line',
          }}>{previewText}</div>
        </Rnd>
        {/* Logo */}
        {t.logoUrl && (
          <Rnd
            size={{ width: t.logoWidth, height: t.logoHeight }}
            position={{ x: t.logoX, y: t.logoY }}
            disableDragging
            enableResizing={false}
            style={{ zIndex: 11 }}
          >
            <img src={t.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </Rnd>
        )}
        {/* Signature */}
        {t.signatureUrl && (
          <Rnd
            size={{ width: t.signatureWidth, height: t.signatureHeight }}
            position={{ x: t.signatureX, y: t.signatureY }}
            disableDragging
            enableResizing={false}
            style={{ zIndex: 12 }}
          >
            <img src={t.signatureUrl} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </Rnd>
        )}
      </div>
    )
  }

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (authService.isAuthenticated() && authService.getUserType() === 'admin') {
      fetchDashboardData()
      fetchUserTypes()
      fetchAvailableTracks()
    }
  }, [filters])

  useEffect(() => {
    // Fetch pending approvals when users data changes
    if (users.length > 0) {
      fetchPendingApprovals()
    }
  }, [users])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [usersData, internshipsData, submissionsData] = await Promise.all([
        adminAPI.getUsers(filters),
        adminAPI.getInternships(),
        adminAPI.getSubmissions()
      ])
      
      setUsers(usersData.users || [])
      setInternships(internshipsData.internships || [])
      setSubmissions(submissionsData.submissions || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTypes = async () => {
    try {
      const data = await adminAPI.getUserTypes()
      setUserTypes(data.user_types || [])
    } catch (error) {
      console.error('Error fetching user types:', error)
    }
  }

  const fetchAvailableTracks = async () => {
    try {
      const data = await adminAPI.getInternships()
      // Extract track names from internships array
      const trackNames = data.internships ? data.internships.map(internship => internship.track_name) : []
      setAvailableTracks(trackNames)
    } catch (error) {
      console.error('Error fetching available tracks:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await adminAPI.login(loginData)
      
      // Set token using authService for consistency
      authService.setToken('admin', response.access_token)
      setIsLoggedIn(true)
      fetchDashboardData()
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.clearTokens()
    setIsLoggedIn(false)
    setUsers([])
    setInternships([])
    setSubmissions([])
  }

  const handleAddInternship = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await adminAPI.addInternship(newInternship)
      await fetchDashboardData()
      setShowAddInternship(false)
      setNewInternship({ track_name: '', duration: '', description: '' })
    } catch (error) {
      setError(error.message || 'Failed to add internship')
    } finally {
      setProcessing(false)
    }
  }

  const handleAddWeek = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await adminAPI.addWeek(newWeek)
      await fetchDashboardData()
      setShowAddWeek(false)
      setNewWeek({ week_number: '', title: '', description: '', track: '', resources: [] })
    } catch (error) {
      setError(error.message || 'Failed to add week')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateSubmission = async (submissionId, status) => {
    setProcessing(true)
    try {
      await adminAPI.updateSubmission(submissionId, status)
      await fetchDashboardData()
    } catch (error) {
      setError(error.message || 'Failed to update submission')
    } finally {
      setProcessing(false)
    }
  }

  const handleUploadCertificate = async (userId) => {
    setProcessing(true)
    try {
      await adminAPI.uploadCertificate({ user_id: userId })
      await fetchDashboardData()
    } catch (error) {
      setError(error.message || 'Failed to upload certificate')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'var(--neon-cyan)'
      case 'pending':
        return 'var(--neon-orange)'
      case 'completed':
        return 'var(--neon-green)'
      case 'approved':
        return 'var(--neon-green)'
      case 'rejected':
        return 'var(--neon-red)'
      default:
        return 'var(--text-secondary)'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.user_id?.toLowerCase().includes(filters.search.toLowerCase())
    const matchesTrack = !filters.track || user.track === filters.track
    const matchesStatus = !filters.status || user.status === filters.status
    
    return matchesSearch && matchesTrack && matchesStatus
  })

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError('')
    setPasswordResetMessage('')
    
    try {
      await adminAPI.resetUserPassword(passwordResetData)
      setPasswordResetMessage('Password reset instructions sent to user email.')
      setPasswordResetData({ user_id: '', user_type: '' })
    } catch (error) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setCreateUserMessage('')
    
    try {
      await adminAPI.createUser(newUser)
      await fetchDashboardData()
      setShowCreateUser(false)
      setNewUser({ fullName: '', email: '', user_type: '', username: '', password: '' })
      setCreateUserMessage('User created successfully!')
    } catch (error) {
      setCreateUserMessage(error.message || 'Failed to create user')
    } finally {
      setProcessing(false)
    }
  }

  const handleGenerateCertificate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      const response = await adminAPI.generateCertificate({
        user_id: certificateData.student_id,
        certificate_type: certificateData.type,
        student_name: certificateData.student_name,
        track_name: certificateData.track_name,
        completion_date: certificateData.completion_date,
        manager_name: certificateData.manager_name,
        custom_text: certificateData.custom_text,
        template: certificateTemplate
      })
      
      // Create download link for the generated certificate
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${certificateData.type}-certificate-${certificateData.student_name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setShowCertificateGenerator(false)
      setCertificateData({
        type: 'completion',
        student_id: '',
        student_name: '',
        track_name: '',
        completion_date: '',
        manager_name: '',
        custom_text: ''
      })
      
    } catch (error) {
      setError(error.message || 'Failed to generate certificate')
    } finally {
      setProcessing(false)
    }
  }

  const handleReleaseCertificate = async (studentId, certificateType) => {
    setProcessing(true)
    try {
      await adminAPI.releaseCertificate(studentId, certificateType)
      await fetchDashboardData()
    } catch (error) {
      setError(error.message || 'Failed to release certificate')
    } finally {
      setProcessing(false)
    }
  }

  // Certificate approval functions
  const fetchPendingApprovals = async () => {
    try {
      // Filter users who need admin approval for certificates
      const certificateApprovals = users.filter(user => 
        user.course_completion_percentage >= 100 && !user.admin_certificate_approval
      )
      const lorApprovals = users.filter(user => 
        ['Completed', 'Excellent'].includes(user.project_completion_status) && !user.admin_lor_approval
      )
      
      setPendingApprovals({
        completion: certificateApprovals,
        lor: lorApprovals
      })
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
    }
  }

  const handleApproveCertificate = async (userId, certificateType) => {
    setProcessing(true)
    try {
      await adminAPI.approveCertificate({
        user_id: userId,
        certificate_type: certificateType,
        approved: true
      })
      await fetchDashboardData()
      await fetchPendingApprovals()
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.message || 'Failed to approve certificate')
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkApproveCertificates = async () => {
    if (selectedApprovalStudents.length === 0) {
      setError('Please select at least one student')
      return
    }

    setProcessing(true)
    try {
      await adminAPI.bulkApproveCertificates({
        user_ids: selectedApprovalStudents,
        certificate_type: approvalCertificateType,
        approved: true
      })
      await fetchDashboardData()
      await fetchPendingApprovals()
      setSelectedApprovalStudents([])
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.message || 'Failed to bulk approve certificates')
    } finally {
      setProcessing(false)
    }
  }

  const handleStudentApprovalSelection = (userId) => {
    setSelectedApprovalStudents(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAllApprovals = () => {
    const currentApprovals = pendingApprovals[approvalCertificateType] || []
    setSelectedApprovalStudents(currentApprovals.map(s => s.user_id))
  }

  const handleClearApprovalSelection = () => {
    setSelectedApprovalStudents([])
  }

  const handleTemplateInput = (field, value) => {
    setTemplateEditor(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setTemplateEditor(prev => ({ ...prev, logoUrl: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setTemplateEditor(prev => ({ ...prev, signatureUrl: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBorderImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setTemplateEditor(prev => ({ ...prev, borderImageUrl: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Template management functions
  const handleTemplateImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setProcessing(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await adminAPI.uploadTemplateImage(formData)
      
      setTemplateEditor(prev => ({
        ...prev,
        header_image: response.image_path
      }))

      setSaveMessage('Image uploaded successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(`Error uploading image: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const addPlaceholder = () => {
    const newId = Date.now().toString()
    setTemplateEditor(prev => ({
      ...prev,
      placeholders: {
        ...prev.placeholders,
        [newId]: {
          text: '',
          x: 50,
          y: 50,
          font_size: 12,
          font_name: 'Helvetica',
          color: '#000000'
        }
      }
    }))
  }

  const removePlaceholder = (id) => {
    setTemplateEditor(prev => {
      const newPlaceholders = { ...prev.placeholders }
      delete newPlaceholders[id]
      return {
        ...prev,
        placeholders: newPlaceholders
      }
    })
  }

  const updatePlaceholder = (id, field, value) => {
    setTemplateEditor(prev => ({
      ...prev,
      placeholders: {
        ...prev.placeholders,
        [id]: {
          ...prev.placeholders[id],
          [field]: value
        }
      }
    }))
  }

  const handleSaveTemplate = async () => {
    try {
      setProcessing(true)
      setSaveMessage('')

      // Validate template
      if (!templateEditor.header_image) {
        setSaveMessage('Please upload a header image')
        return
      }

      if (Object.keys(templateEditor.placeholders).length === 0) {
        setSaveMessage('Please add at least one text placeholder')
        return
      }

      // Save template
      await adminAPI.setCertificateTemplate(saveType, templateEditor)
      
      // Update status
      setTemplateStatus(prev => ({
        ...prev,
        [saveType]: true
      }))

      setSaveMessage('Template saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(`Error saving template: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePreviewTemplate = async () => {
    try {
      setProcessing(true)
      
      // Create sample student data
      const sampleData = {
        fullName: templatePreviewData.studentName,
        track: templatePreviewData.trackName,
        completion_date: templatePreviewData.completionDate,
        manager_name: 'Sample Manager',
        user_id: 'preview'
      }

      // Generate preview using the template
      const response = await adminAPI.generateCertificate({
        user_id: 'preview',
        certificate_type: saveType,
        student_name: templatePreviewData.studentName,
        track_name: templatePreviewData.trackName,
        completion_date: templatePreviewData.completionDate,
        manager_name: 'Sample Manager',
        template: templateEditor
      })

      // Create download link for the preview
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `preview-${saveType}-template.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      setSaveMessage(`Error generating preview: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const getTextStyle = (type) => {
    if (type === 'heading') {
      const style = {
        fontFamily: templateEditor.headingFont,
        fontSize: templateEditor.headingFontSize,
        fontWeight: templateEditor.headingFontWeight,
        fontStyle: templateEditor.headingFontStyle,
        textAlign: templateEditor.headingAlign,
        color: templateEditor.headingColorType === 'solid' ? templateEditor.headingColor : undefined,
        background: templateEditor.headingColorType === 'gradient' ? templateEditor.headingGradient : undefined,
        WebkitBackgroundClip: templateEditor.headingColorType === 'gradient' ? 'text' : undefined,
        WebkitTextFillColor: templateEditor.headingColorType === 'gradient' ? 'transparent' : undefined,
        MozBackgroundClip: templateEditor.headingColorType === 'gradient' ? 'text' : undefined,
        MozTextFillColor: templateEditor.headingColorType === 'gradient' ? 'transparent' : undefined,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: templateEditor.headingAlign,
        userSelect: 'none',
        border: '1px dashed #bbb',
        cursor: 'move',
      }
      return style
    } else {
      const style = {
        fontFamily: templateEditor.textFont,
        fontSize: templateEditor.textFontSize,
        fontWeight: templateEditor.textFontWeight,
        fontStyle: templateEditor.textFontStyle,
        textAlign: templateEditor.textAlign,
        color: templateEditor.textColorType === 'solid' ? templateEditor.textColor : undefined,
        background: templateEditor.textColorType === 'gradient' ? templateEditor.textGradient : undefined,
        WebkitBackgroundClip: templateEditor.textColorType === 'gradient' ? 'text' : undefined,
        WebkitTextFillColor: templateEditor.textColorType === 'gradient' ? 'transparent' : undefined,
        MozBackgroundClip: templateEditor.textColorType === 'gradient' ? 'text' : undefined,
        MozTextFillColor: templateEditor.textColorType === 'gradient' ? 'transparent' : undefined,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: templateEditor.textAlign,
        userSelect: 'none',
        border: '1px dashed #bbb',
        cursor: 'move',
        whiteSpace: 'pre-line',
      }
      return style
    }
  }

  const renderCertificatePreview = () => {
    let previewText = templateEditor.defaultText
      .replace('{Student Name}', templatePreviewData.studentName)
      .replace('{Track Name}', templatePreviewData.trackName)
      .replace('{Completion Date}', templatePreviewData.completionDate)
    const isPortrait = templateEditor.orientation === 'portrait'
    const certWidth = isPortrait ? 500 : 700
    const certHeight = isPortrait ? 700 : 500
    return (
      <div style={{
        background: templateEditor.backgroundColor,
        color: templateEditor.textColor,
        border: `4px solid ${templateEditor.borderColor}`,
        fontFamily: templateEditor.fontFamily,
        fontSize: templateEditor.fontSize,
        width: certWidth,
        height: certHeight,
        margin: '0 auto',
        position: 'relative',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        padding: 40,
        overflow: 'hidden',
        backgroundImage: templateEditor.borderImageUrl ? `url(${templateEditor.borderImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Draggable/Resizable Heading */}
        <Rnd
          size={{ width: templateEditor.headingWidth, height: templateEditor.headingHeight }}
          position={{ x: templateEditor.headingX, y: templateEditor.headingY }}
          onDragStop={(e, d) => setTemplateEditor(prev => ({ ...prev, headingX: d.x, headingY: d.y }))}
          onResizeStop={(e, direction, ref, delta, position) => setTemplateEditor(prev => ({
            ...prev,
            headingWidth: parseInt(ref.style.width),
            headingHeight: parseInt(ref.style.height),
            headingX: position.x,
            headingY: position.y
          }))}
          bounds="parent"
          style={{ zIndex: 10 }}
        >
          <div style={getTextStyle('heading')}>{templateEditor.headingText}</div>
        </Rnd>
        {/* Draggable/Resizable Main Text */}
        <Rnd
          size={{ width: templateEditor.textWidth, height: templateEditor.textHeight }}
          position={{ x: templateEditor.textX, y: templateEditor.textY }}
          onDragStop={(e, d) => setTemplateEditor(prev => ({ ...prev, textX: d.x, textY: d.y }))}
          onResizeStop={(e, direction, ref, delta, position) => setTemplateEditor(prev => ({
            ...prev,
            textWidth: parseInt(ref.style.width),
            textHeight: parseInt(ref.style.height),
            textX: position.x,
            textY: position.y
          }))}
          bounds="parent"
          style={{ zIndex: 9 }}
        >
          <div style={getTextStyle('text')}>{previewText}</div>
        </Rnd>
        {/* Draggable/Resizable Logo */}
        {templateEditor.logoUrl && (
          <Rnd
            size={{ width: templateEditor.logoWidth, height: templateEditor.logoHeight }}
            position={{ x: templateEditor.logoX, y: templateEditor.logoY }}
            onDragStop={(e, d) => setTemplateEditor(prev => ({ ...prev, logoX: d.x, logoY: d.y }))}
            onResizeStop={(e, direction, ref, delta, position) => setTemplateEditor(prev => ({
              ...prev,
              logoWidth: parseInt(ref.style.width),
              logoHeight: parseInt(ref.style.height),
              logoX: position.x,
              logoY: position.y
            }))}
            bounds="parent"
            style={{ zIndex: 11 }}
          >
            <img src={templateEditor.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </Rnd>
        )}
        {/* Draggable/Resizable Signature */}
        {templateEditor.signatureUrl && (
          <Rnd
            size={{ width: templateEditor.signatureWidth, height: templateEditor.signatureHeight }}
            position={{ x: templateEditor.signatureX, y: templateEditor.signatureY }}
            onDragStop={(e, d) => setTemplateEditor(prev => ({ ...prev, signatureX: d.x, signatureY: d.y }))}
            onResizeStop={(e, direction, ref, delta, position) => setTemplateEditor(prev => ({
              ...prev,
              signatureWidth: parseInt(ref.style.width),
              signatureHeight: parseInt(ref.style.height),
              signatureX: position.x,
              signatureY: position.y
            }))}
            bounds="parent"
            style={{ zIndex: 12 }}
          >
            <img src={templateEditor.signatureUrl} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </Rnd>
        )}
      </div>
    )
  }

  // Template Editor Functions
  const handleOpenTemplateEditor = async (templateType) => {
    setCurrentTemplateType(templateType)
    setShowTemplateEditor(true)
    
    try {
      // Try to load existing template
      const response = await adminAPI.getCertificateTemplate(templateType)
      setCurrentTemplate(response.template)
    } catch (error) {
      // No existing template, start with empty one
      setCurrentTemplate({
        background_image: '',
        orientation: 'portrait',
        placeholders: {},
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderColor: '#cccccc',
        fontFamily: 'Arial',
        fontSize: '16px'
      })
    }
  }

  const handleSaveTemplateEditor = async (template) => {
    try {
      setProcessing(true)
      setSaveMessage('')

      // Enhanced validation with detailed error messages
      if (!template) {
        setSaveMessage('Template data is missing')
        return
      }

      if (!template.orientation) {
        setSaveMessage('Please select an orientation (portrait or landscape)')
        return
      }

      if (!template.placeholders || Object.keys(template.placeholders).length === 0) {
        setSaveMessage('Please add at least one text element or signature')
        return
      }

      // Ensure template has all required fields with defaults if missing
      const validatedTemplate = {
        orientation: template.orientation,
        placeholders: template.placeholders || {},
        backgroundColor: template.backgroundColor || '#ffffff',
        borderColor: template.borderColor || '#cccccc',
        background_image: template.background_image || '',
        ...template // Include any other fields that might be present
      }

      console.log('Saving template:', validatedTemplate) // Debug log

      // Save template
      const response = await adminAPI.setCertificateTemplate(currentTemplateType, validatedTemplate)
      
      // Update status
      setTemplateStatus(prev => ({
        ...prev,
        [currentTemplateType]: true
      }))

      setSaveMessage('Template saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
      
      // Close editor
      setShowTemplateEditor(false)
    } catch (error) {
      console.error('Template save error:', error) // Debug log
      
      // Enhanced error handling to show backend errors
      let errorMessage = 'Error saving template'
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setSaveMessage(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const handlePreviewTemplateEditor = async (template, previewData) => {
    setProcessing(true)
    setSaveMessage('')
    
    try {
      // Generate preview using the template
      const response = await adminAPI.generateCertificatePreview({
        template: template,
        preview_data: previewData,
        certificate_type: currentTemplateType
      })

      // Create download link for the preview
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `preview-${currentTemplateType}-template.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      setSaveMessage(`Error generating preview: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleCloseTemplateEditor = () => {
    setShowTemplateEditor(false)
    setCurrentTemplate(null)
    setCurrentTemplateType('completion')
  }

  // CSV export helper
  function exportUsersToCSV(users) {
    if (!users || users.length === 0) return
    const headers = [
      'Full Name', 'User ID', 'Email', 'Mobile/WhatsApp', 'Track', 'College', 'Year', 'Passout Year', 'Status'
    ]
    const rows = users.map(user => [
      user.fullName,
      user.user_id,
      user.email,
      user.whatsapp,
      user.track,
      user.collegeName,
      user.yearOfStudy,
      user.passoutYear,
      user.status
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => '"' + (val ?? '') + '"').join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'vedarc_users.csv')
  }

  if (!authService.isAuthenticated() || authService.getUserType() !== 'admin') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized Access</h2>
        <p>Please login with admin credentials to access this dashboard.</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
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
              <FaUserShield className="header-icon" />
              <div>
                <h1>Admin Dashboard</h1>
                <p>Super Admin Control Panel</p>
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
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUser />
            Users ({users.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'password-reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('password-reset')}
          >
            <FaKey />
            Password Reset
          </button>
          <button
            className={`nav-tab ${activeTab === 'create-user' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-user')}
          >
            <FaPlus />
            Create User
          </button>
          <button
            className={`nav-tab ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <FaCode />
            Internships ({internships.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <FaTrophy />
            Submissions ({submissions.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <FaCertificate />
            Certificates
          </button>
          <button
            className={`nav-tab ${activeTab === 'certificate-approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate-approvals')}
          >
            <FaCheckCircle />
            Certificate Approvals ({Object.values(pendingApprovals).flat().length})
          </button>
        </motion.nav>

        {/* Filters */}
        <motion.div
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="filters-row">
            <div className="filter-group">
              <label>
                <FaFilter />
                Track
              </label>
              <select
                value={filters.track}
                onChange={(e) => setFilters(prev => ({ ...prev, track: e.target.value }))}
              >
                <option value="">All Tracks</option>
                {availableTracks.map(track => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaFilter />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="search-group search-bar-hightech">
              <label>
                <span className="search-icon-animated"><FaSearch /></span>
                <span className="search-label-text">Search</span>
              </label>
              <input
                type="text"
                className="search-input-hightech"
                placeholder="Search users, emails, or IDs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onFocus={e => e.target.parentNode.classList.add('focused')}
                onBlur={e => e.target.parentNode.classList.remove('focused')}
              />
            </div>
          </div>
        </motion.div>

        {/* Password Reset Section */}
        {activeTab === 'password-reset' && (
          <motion.div
            className="password-reset-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="section-header">
              <h2>Reset User Password</h2>
              <p>Reset password for any user type (Student, HR, Manager, Admin)</p>
            </div>
            
            <form onSubmit={handlePasswordReset} className="password-reset-form">
              <div className="form-row">
                <div className="form-group">
                  <label>User ID / Username *</label>
                  <input
                    type="text"
                    value={passwordResetData.user_id}
                    onChange={(e) => setPasswordResetData(prev => ({
                      ...prev,
                      user_id: e.target.value
                    }))}
                    placeholder="Enter User ID or Username"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>User Type *</label>
                  <select
                    value={passwordResetData.user_type}
                    onChange={(e) => setPasswordResetData(prev => ({
                      ...prev,
                      user_type: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select User Type</option>
                    <option value="student">Student</option>
                    <option value="hr">HR</option>
                    <option value="manager">Internship Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <motion.button
                type="submit"
                className="reset-btn"
                disabled={processing || !passwordResetData.user_id || !passwordResetData.user_type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processing ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <FaKey />
                )}
                Reset Password
              </motion.button>
            </form>
            
            {passwordResetMessage && (
              <div className="success-banner">{passwordResetMessage}</div>
            )}
          </motion.div>
        )}

        {/* Create User Section */}
        {activeTab === 'create-user' && (
          <motion.div
            className="create-user-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="section-header">
              <h2>Create New User Account</h2>
              <p>Create accounts for HR, Internship Manager, or Co-Admin</p>
            </div>
            
            <form onSubmit={handleCreateUser} className="create-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>User Type *</label>
                  <select
                    value={newUser.user_type}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      user_type: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select User Type</option>
                    <option value="hr">HR</option>
                    <option value="manager">Internship Manager</option>
                    <option value="admin">Co-Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <motion.button
                type="submit"
                className="create-btn"
                disabled={processing || !newUser.fullName || !newUser.email || !newUser.username || !newUser.user_type || !newUser.password}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processing ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <FaPlus />
                )}
                Create User Account
              </motion.button>
            </form>
            
            {createUserMessage && (
              <div className="success-banner">{createUserMessage}</div>
            )}
          </motion.div>
        )}

        {/* Content Sections */}
        <motion.div
          className="content-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="loading-spinner" />
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2>All Users</h2>
                      <span className="count">{filteredUsers.length} users</span>
                    </div>
                    <button
                      className="download-csv-btn"
                      onClick={() => exportUsersToCSV(filteredUsers)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gradient-diagonal)', color: 'var(--text-glowing)', border: 'none', borderRadius: 20, padding: '10px 22px', fontWeight: 600, fontFamily: 'Rajdhani', cursor: 'pointer', fontSize: 16 }}
                    >
                      <FaDownload /> Download CSV
                    </button>
                  </div>
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>User ID</th>
                          <th>Email</th>
                          <th>Mobile/WhatsApp</th>
                          <th>Track</th>
                          <th>College</th>
                          <th>Year</th>
                          <th>Passout</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => (
                          <tr key={user.user_id || index}>
                            <td>{user.fullName}</td>
                            <td>{user.user_id}</td>
                            <td>{user.email}</td>
                            <td>{user.whatsapp}</td>
                            <td>{user.track}</td>
                            <td>{user.collegeName}</td>
                            <td>{user.yearOfStudy}</td>
                            <td>{user.passoutYear}</td>
                            <td>
                              <span className="status-badge" style={{ backgroundColor: getStatusColor(user.status) }}>{user.status || 'Active'}</span>
                            </td>
                            <td>
                              {user.status === 'Completed' && !user.certificate && (
                                <motion.button
                                  className="certificate-btn"
                                  onClick={() => handleUploadCertificate(user.user_id)}
                                  disabled={processing}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <FaCertificate /> Generate Certificate
                                </motion.button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'internships' && (
                <motion.div
                  key="internships"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Internship Tracks</h2>
                    <motion.button
                      className="add-btn"
                      onClick={() => setShowAddInternship(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlus />
                      Add Internship
                    </motion.button>
                  </div>

                  <div className="internships-grid">
                    {internships.map((internship, index) => (
                      <motion.div
                        key={internship.track_name || index}
                        className="internship-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="internship-header">
                          <h3>{internship.track_name}</h3>
                          <span className="duration">{internship.duration}</span>
                        </div>
                        <p>{internship.description}</p>
                        <div className="internship-stats">
                          <span>{internship.student_count || 0} students</span>
                          <span>{internship.week_count || 0} weeks</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'submissions' && (
                <motion.div
                  key="submissions"
                  className="tab-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="section-header">
                    <h2>Assignment Submissions</h2>
                    <motion.button
                      className="add-btn"
                      onClick={() => setShowAddWeek(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlus />
                      Add Week
                    </motion.button>
                  </div>

                  <div className="submissions-grid">
                    {submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id || index}
                        className="submission-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="submission-header">
                          <h3>{submission.student_name}</h3>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(submission.status) }}
                          >
                            {submission.status}
                          </span>
                        </div>

                        <div className="submission-details">
                          <p><strong>Week:</strong> {submission.week_number}</p>
                          <p><strong>Track:</strong> {submission.track}</p>
                          <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleDateString()}</p>
                        </div>

                        <div className="submission-links">
                          <a href={submission.github_link} target="_blank" rel="noopener noreferrer">
                            GitHub
                          </a>
                          <a href={submission.deployed_link} target="_blank" rel="noopener noreferrer">
                            Live Demo
                          </a>
                        </div>

                        <div className="submission-actions">
                          {submission.status === 'Pending' && (
                            <>
                              <motion.button
                                className="approve-btn"
                                onClick={() => handleUpdateSubmission(submission.id, 'Approved')}
                                disabled={processing}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaCheckCircle />
                                Approve
                              </motion.button>
                              <motion.button
                                className="reject-btn"
                                onClick={() => handleUpdateSubmission(submission.id, 'Rejected')}
                                disabled={processing}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaTimesCircle />
                                Reject
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  className="certificate-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="section-header">
                    <h2><FaCertificate /> Advanced Certificate Template Editor</h2>
                    <p>Create and customize professional certificate templates with drag-and-drop functionality, live preview, and advanced styling options</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', marginTop: 24, flexWrap: 'wrap' }}>
                    {/* Template Management */}
                    <div style={{ flex: 2, minWidth: 380 }}>
                      <div className="certificate-generator">
                        <h3>Template Types</h3>
                        
                        <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
                          {/* Certificate of Completion */}
                        <div style={{ 
                            border: '1px solid rgba(123, 45, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: 'rgba(22, 22, 38, 0.4)',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                              <div>
                                <h4 style={{ color: 'var(--neon-cyan)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                                  Certificate of Completion
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                  Professional completion certificates for students
                                </p>
                              </div>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                                backgroundColor: templateStatus.completion ? '#00ff00' : '#ff0000',
                                boxShadow: templateStatus.completion ? '0 0 10px #00ff00' : '0 0 10px #ff0000'
                            }}></div>
                          </div>
                            
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleOpenTemplateEditor('completion')}
                                style={{ flex: 1, minWidth: '120px' }}
                              >
                                <FaEdit /> {templateStatus.completion ? 'Edit Template' : 'Create Template'}
                              </button>
                              {templateStatus.completion && (
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleOpenProxy('completion')}
                                  style={{ flex: 1, minWidth: '120px' }}
                                >
                                  <FaEye /> Preview
                                </button>
                              )}
                            </div>
                        </div>

                          {/* Letter of Recommendation */}
                          <div style={{
                            border: '1px solid rgba(123, 45, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: 'rgba(22, 22, 38, 0.4)',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                              <div>
                                <h4 style={{ color: 'var(--neon-cyan)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                                  Letter of Recommendation (LOR)
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                  Professional recommendation letters for students
                                </p>
                              </div>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: templateStatus.lor ? '#00ff00' : '#ff0000',
                                boxShadow: templateStatus.lor ? '0 0 10px #00ff00' : '0 0 10px #ff0000'
                              }}></div>
                        </div>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleOpenTemplateEditor('lor')}
                                style={{ flex: 1, minWidth: '120px' }}
                              >
                                <FaEdit /> {templateStatus.lor ? 'Edit Template' : 'Create Template'}
                              </button>
                              {templateStatus.lor && (
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleOpenProxy('lor')}
                                  style={{ flex: 1, minWidth: '120px' }}
                                >
                                  <FaEye /> Preview
                                </button>
                              )}
                            </div>
                        </div>

                          {/* Offer Letter */}
                          <div style={{ 
                            border: '1px solid rgba(123, 45, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: 'rgba(22, 22, 38, 0.4)',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                              <div>
                                <h4 style={{ color: 'var(--neon-cyan)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                                  Offer Letter
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                  Professional offer letters for employment
                                </p>
                              </div>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: templateStatus.offer ? '#00ff00' : '#ff0000',
                                boxShadow: templateStatus.offer ? '0 0 10px #00ff00' : '0 0 10px #ff0000'
                              }}></div>
                          </div>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                                className="btn btn-primary"
                                onClick={() => handleOpenTemplateEditor('offer')}
                                style={{ flex: 1, minWidth: '120px' }}
                              >
                                <FaEdit /> {templateStatus.offer ? 'Edit Template' : 'Create Template'}
                          </button>
                              {templateStatus.offer && (
                                  <button
                                  className="btn btn-secondary"
                                  onClick={() => handleOpenProxy('offer')}
                                  style={{ flex: 1, minWidth: '120px' }}
                                >
                                  <FaEye /> Preview
                                  </button>
                              )}
                                </div>
                                  </div>
                                </div>
                                
                        {/* Features List */}
                        <div style={{ marginTop: 30 }}>
                          <h4 style={{ color: 'var(--neon-cyan)', marginBottom: 15 }}>Advanced Features</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaUpload style={{ color: 'var(--neon-cyan)' }} />
                              <span>Background Image Upload</span>
                                  </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaArrowsAlt style={{ color: 'var(--neon-cyan)' }} />
                              <span>Drag & Drop Text Elements</span>
                                  </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaFont style={{ color: 'var(--neon-cyan)' }} />
                              <span>Custom Fonts & Sizes</span>
                                  </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaPalette style={{ color: 'var(--neon-cyan)' }} />
                              <span>Color Picker</span>
                                </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaEye style={{ color: 'var(--neon-cyan)' }} />
                              <span>Live Preview</span>
                              </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FaDownload style={{ color: 'var(--neon-cyan)' }} />
                              <span>PDF Export</span>
                          </div>
                        </div>
                          </div>
                      </div>
                    </div>

                    {/* Template Preview */}
                    <div style={{ flex: 1, minWidth: 320 }}>
                      <div className="certificate-template">
                        <h3>Template Status Overview</h3>
                        <div style={{ 
                          border: '1px solid #ddd', 
                          borderRadius: '8px', 
                          padding: '16px',
                          backgroundColor: '#f9f9f9'
                        }}>
                          <div style={{ marginBottom: 20 }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Available Placeholders</h4>
                            <div style={{ 
                              backgroundColor: '#fff', 
                              padding: '12px', 
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              border: '1px solid #ddd'
                            }}>
                              <div><strong>{'{student_name}'}</strong> - Student's full name</div>
                              <div><strong>{'{track_name}'}</strong> - Internship track name</div>
                              <div><strong>{'{completion_date}'}</strong> - Completion date</div>
                              <div><strong>{'{current_date}'}</strong> - Current date</div>
                              <div><strong>{'{manager_name}'}</strong> - Manager's name</div>
                              <div><strong>{'{company_name}'}</strong> - Company name</div>
                              <div><strong>{'{user_id}'}</strong> - Student's user ID</div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: 20 }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Template Status</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Certificate of Completion:</span>
                                <span style={{ 
                                  color: templateStatus.completion ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold'
                                }}>
                                  {templateStatus.completion ? '✓ Configured' : '✗ Not Configured'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Letter of Recommendation:</span>
                                <span style={{ 
                                  color: templateStatus.lor ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold'
                                }}>
                                  {templateStatus.lor ? '✓ Configured' : '✗ Not Configured'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Offer Letter:</span>
                                <span style={{ 
                                  color: templateStatus.offer ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold'
                                }}>
                                  {templateStatus.offer ? '✓ Configured' : '✗ Not Configured'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {saveMessage && (
                            <div style={{
                              padding: '12px',
                              borderRadius: '6px',
                              backgroundColor: saveMessage.includes('Error') ? '#f8d7da' : '#d4edda',
                              color: saveMessage.includes('Error') ? '#721c24' : '#155724',
                              border: `1px solid ${saveMessage.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
                              marginTop: 15
                            }}>
                              {saveMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificate-approvals' && (
                <motion.div
                  className="certificate-approvals-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="section-header">
                    <h2><FaCheckCircle /> Certificate Approvals</h2>
                    <p>Approve certificate and LOR unlocks for eligible students</p>
                  </div>

                  <div className="approval-controls">
                    <div className="approval-type-selector">
                      <select
                        value={approvalCertificateType}
                        onChange={(e) => setApprovalCertificateType(e.target.value)}
                        className="approval-type-select"
                      >
                        <option value="completion">Certificate of Completion</option>
                        <option value="lor">Letter of Recommendation (LOR)</option>
                      </select>
                    </div>
                    
                    <div className="approval-actions">
                      <motion.button
                        className="select-all-btn"
                        onClick={handleSelectAllApprovals}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Select All
                      </motion.button>
                      <motion.button
                        className="clear-selection-btn"
                        onClick={handleClearApprovalSelection}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Clear Selection
                      </motion.button>
                      <motion.button
                        className="bulk-approve-btn"
                        onClick={handleBulkApproveCertificates}
                        disabled={selectedApprovalStudents.length === 0 || processing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {processing ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Bulk Approve ({selectedApprovalStudents.length})
                      </motion.button>
                    </div>
                  </div>

                  <div className="approval-requirements">
                    <h3>Requirements for {approvalCertificateType === 'completion' ? 'Certificate' : 'LOR'} Approval:</h3>
                    {approvalCertificateType === 'completion' ? (
                      <ul>
                        <li>✅ 100% course completion</li>
                        <li>✅ All assignments approved</li>
                      </ul>
                    ) : (
                      <ul>
                        <li>✅ Project status: Completed or Excellent</li>
                        <li>✅ Outstanding performance demonstrated</li>
                      </ul>
                    )}
                  </div>

                  <div className="pending-approvals-grid">
                    {(pendingApprovals[approvalCertificateType] || []).map((student, index) => {
                      const isSelected = selectedApprovalStudents.includes(student.user_id)
                      const isEligible = approvalCertificateType === 'completion' 
                        ? student.course_completion_percentage >= 100
                        : ['Completed', 'Excellent'].includes(student.project_completion_status)
                      
                      return (
                        <motion.div
                          key={student.user_id || index}
                          className={`approval-card ${isSelected ? 'selected' : ''} ${isEligible ? 'eligible' : 'not-eligible'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="approval-card-header">
                            <div className="student-info">
                              <div className="avatar">
                                {student.fullName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5>{student.fullName}</h5>
                                <p>{student.user_id}</p>
                                <p className="track">{student.track}</p>
                              </div>
                            </div>
                            <div className="approval-status">
                              {isEligible ? (
                                <span className="status eligible">Eligible</span>
                              ) : (
                                <span className="status not-eligible">Not Eligible</span>
                              )}
                            </div>
                          </div>

                          <div className="approval-details">
                            {approvalCertificateType === 'completion' ? (
                              <div className="completion-details">
                                <p><strong>Course Completion:</strong> {student.course_completion_percentage || 0}%</p>
                                <p><strong>Status:</strong> {student.status}</p>
                                <p><strong>Track:</strong> {student.track}</p>
                              </div>
                            ) : (
                              <div className="lor-details">
                                <p><strong>Project Status:</strong> {student.project_completion_status || 'Not Started'}</p>
                                <p><strong>Status:</strong> {student.status}</p>
                                <p><strong>Track:</strong> {student.track}</p>
                              </div>
                            )}
                          </div>

                          <div className="approval-actions">
                            {isEligible && (
                              <label className="select-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleStudentApprovalSelection(student.user_id)}
                                />
                                <span>Select for approval</span>
                              </label>
                            )}
                            
                            {isEligible && (
                              <motion.button
                                className="approve-btn"
                                onClick={() => handleApproveCertificate(student.user_id, approvalCertificateType)}
                                disabled={processing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaCheckCircle />
                                Approve {approvalCertificateType === 'completion' ? 'Certificate' : 'LOR'}
                              </motion.button>
                            )}
                            
                            {!isEligible && (
                              <div className="not-eligible-message">
                                <FaTimesCircle />
                                <span>Requirements not met</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {(pendingApprovals[approvalCertificateType] || []).length === 0 && (
                    <div className="no-pending-approvals">
                      <FaCheckCircle style={{ fontSize: '3rem', color: 'var(--neon-green)', marginBottom: '1rem' }} />
                      <h3>No Pending Approvals</h3>
                      <p>All eligible students have been approved for {approvalCertificateType === 'completion' ? 'certificates' : 'LORs'}.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

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
                <h3>Add New Internship Track</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddInternship(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>

              <form onSubmit={handleAddInternship} className="modal-form">
                <div className="form-group">
                  <label>Track Name *</label>
                  <input
                    type="text"
                    value={newInternship.track_name}
                    onChange={(e) => setNewInternship(prev => ({
                      ...prev,
                      track_name: e.target.value
                    }))}
                    placeholder="e.g., Advanced React"
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
                    placeholder="Brief description of the internship track..."
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
                    Add Internship
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
              className="modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Week</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddWeek(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>

              <form onSubmit={handleAddWeek} className="modal-form">
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
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newWeek.title}
                    onChange={(e) => setNewWeek(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Track *</label>
                  <select
                    value={newWeek.track}
                    onChange={(e) => setNewWeek(prev => ({
                      ...prev,
                      track: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select Track</option>
                    {internships.map(internship => (
                      <option key={internship.track_name} value={internship.track_name}>
                        {internship.track_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description *</label>
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

      {/* Proxy Preview Modal */}
      <AnimatePresence>
        {showProxyModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProxyModal(false)}
            style={{ zIndex: 1000 }}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 1000, width: '96vw', padding: 36 }}
            >
              <div className="modal-header">
                <h3 style={{ fontWeight: 700, fontSize: 22 }}>Preview {proxyType === 'completion' ? 'Certificate of Completion' : proxyType === 'lor' ? 'LOR' : 'Offer Letter'}</h3>
                <button className="close-btn" onClick={() => setShowProxyModal(false)}>
                  <FaTimesCircle />
                </button>
              </div>
              <div style={{ marginBottom: 16, color: '#555', fontSize: 15 }}>
                Enter sample data below to see a live preview of the certificate. All fields are required.
              </div>
              <form onSubmit={handleGenerateProxyPreview} style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
                  <label>Student Name:</label>
                  <input type="text" value={proxyData.studentName} onChange={e => handleProxyInput('studentName', e.target.value)} style={{ width: '100%', marginBottom: 10, borderColor: !proxyData.studentName && proxyPreviewReady ? 'var(--neon-red)' : '#ccc' }} required />
                  <label>Track Name:</label>
                  <input type="text" value={proxyData.trackName} onChange={e => handleProxyInput('trackName', e.target.value)} style={{ width: '100%', marginBottom: 10, borderColor: !proxyData.trackName && proxyPreviewReady ? 'var(--neon-red)' : '#ccc' }} required />
                  <label>Completion Date:</label>
                  <input type="date" value={proxyData.completionDate} onChange={e => handleProxyInput('completionDate', e.target.value)} style={{ width: '100%', marginBottom: 10, borderColor: !proxyData.completionDate && proxyPreviewReady ? 'var(--neon-red)' : '#ccc' }} required />
                  <motion.button
                    type="submit"
                    className="generate-btn"
                    disabled={proxyLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    {proxyLoading ? <FaSpinner className="spinner" /> : 'Generate Preview'}
                  </motion.button>
                  {proxyError && <div style={{ color: 'var(--neon-red)', marginTop: 8 }}>{proxyError}</div>}
                </div>
                <div style={{ flex: 2, minWidth: 340, maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: 720, overflow: 'auto', background: '#f7f7fa', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: 12 }}>
                  <label style={{ fontWeight: 600, marginBottom: 8 }}>Live Preview:</label>
                  {proxyPreviewReady && renderProxyPreview()}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Template Editor Modal */}
      <AnimatePresence>
        {showTemplateEditor && (
          <CertificateTemplateEditor
            templateType={currentTemplateType}
            onSave={handleSaveTemplateEditor}
            onPreview={handlePreviewTemplateEditor}
            initialTemplate={currentTemplate}
            onClose={handleCloseTemplateEditor}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 