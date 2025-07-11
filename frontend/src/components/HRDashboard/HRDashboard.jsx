import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUserTie, FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter, FaSearch, FaEnvelope, FaWhatsapp, FaGraduationCap, FaCalendarAlt, FaCode, FaCreditCard, FaChartBar, FaUsers, FaUserCheck, FaClock, FaFileUpload } from 'react-icons/fa'
import { hrAPI, authService } from '../../services/apiService'
import './HRDashboard.css'

export default function HRDashboard() {
  const [registrations, setRegistrations] = useState([])
  const [availableTracks, setAvailableTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    track: '',
    date: '',
    status: 'pending'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [passwordResetUserId, setPasswordResetUserId] = useState('')
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  
  // User management state
  const [selectedUser, setSelectedUser] = useState(null)

  // Deactivate modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  // Statistics state
  const [statistics, setStatistics] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Payment details state
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  
  // Add last refresh timestamp
  const [lastRefresh, setLastRefresh] = useState(null)

  // Add bulk enable state
  const [bulkEnabling, setBulkEnabling] = useState(false)
  const [bulkEnableMessage, setBulkEnableMessage] = useState('')

  // Add bulk disable state
  const [bulkDisabling, setBulkDisabling] = useState(false)
  const [bulkDisableMessage, setBulkDisableMessage] = useState('')

  // Internship applications state
  const [applications, setApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [applicationsTotal, setApplicationsTotal] = useState(0)
  const [applicationsPages, setApplicationsPages] = useState(0)
  const [activeTab, setActiveTab] = useState('registrations') // 'registrations' or 'applications'

  useEffect(() => {
    fetchRegistrations()
    fetchStatistics()
    fetchPayments()
    fetchAvailableTracks()
    fetchApplications()
    
    // Set up auto-refresh every 30 seconds
    const autoRefreshInterval = setInterval(() => {
      fetchRegistrations()
      fetchStatistics()
      fetchPayments()
      if (activeTab === 'applications') {
        fetchApplications()
      }
    }, 30000) // 30 seconds
    
    return () => clearInterval(autoRefreshInterval)
  }, [filters, activeTab, applicationsPage])

  const fetchRegistrations = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const data = await hrAPI.getAllUsers()
      setRegistrations(data.registrations || [])
      setLastRefresh(new Date().toISOString())
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setStatsLoading(true)
    try {
      const data = await hrAPI.getStatistics()
      setStatistics(data.statistics)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchAvailableTracks = async () => {
    try {
      const data = await hrAPI.getAvailableTracks()
      setAvailableTracks(data.tracks || [])
    } catch (error) {
      console.error('Error fetching available tracks:', error)
    }
  }

  const fetchPayments = async () => {
    setPaymentsLoading(true)
    try {
      const data = await hrAPI.getPayments()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setPaymentsLoading(false)
    }
  }

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    try {
      const data = await hrAPI.getInternshipApplications(applicationsPage, 10)
      setApplications(data.applications || [])
      setApplicationsTotal(data.total || 0)
      setApplicationsPages(data.pages || 0)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
    } finally {
      setApplicationsLoading(false)
    }
  }

  const handleDownloadResume = async (applicationId) => {
    try {
      const response = await hrAPI.downloadResume(applicationId)
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume_${applicationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
      setError('Failed to download resume')
    }
  }

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }
    
    try {
      await hrAPI.deleteApplication(applicationId)
      await fetchApplications()
      setError('')
    } catch (error) {
      console.error('Error deleting application:', error)
      setError('Failed to delete application')
    }
  }

  const handleToggleStatus = async (userData) => {
    // Check if user is still in the current registrations list
    const isStillInList = registrations.some(reg => reg.user_id === userData.user_id)
    
    if (!isStillInList) {
      setError('This user is no longer in the list. Refreshing data...')
      await fetchRegistrations(true)
      return
    }
    
    setProcessing(true)
    setError('')
    
    try {
      if (userData.status === 'Active') {
        // Show deactivate modal for active users
        setSelectedUser(userData)
        setDeactivateReason('')
        setShowDeactivateModal(true)
      } else if (userData.status === 'Disabled') {
        // Enable disabled users directly
        await hrAPI.enableUser({ user_id: userData.user_id })
        await fetchRegistrations(true)
        await fetchStatistics()
      } else {
        setError(`Cannot toggle user from status: ${userData.status}`)
      }
    } catch (error) {
      setError(error.message || 'Failed to update user status')
    } finally {
      setProcessing(false)
    }
  }



  const handleDeactivateSubmit = async (e) => {
    e.preventDefault()
    if (!deactivateReason.trim()) {
      setError('Reason is required')
      return
    }
    
    setProcessing(true)
    setError('')
    try {
      await hrAPI.disableUser({
        user_id: selectedUser.user_id,
        reason: deactivateReason.trim()
      })
      
      // Close modal and refresh the list and statistics
      setShowDeactivateModal(false)
      setSelectedUser(null)
      setDeactivateReason('')
      await fetchRegistrations(true) // Force refresh
      await fetchStatistics()
    } catch (error) {
      setError(error.message || 'Failed to disable user')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteUser = async (userData) => {
    // Check if user is still in the current registrations list
    const isStillInList = registrations.some(reg => reg.user_id === userData.user_id)
    
    if (!isStillInList) {
      setError('This user is no longer in the list. Refreshing data...')
      await fetchRegistrations(true)
      return
    }
    
    // Show delete modal
    setSelectedUser(userData)
    setDeleteReason('')
    setShowDeleteModal(true)
  }

  const handleDeleteSubmit = async (e) => {
    e.preventDefault()
    if (!deleteReason.trim()) {
      setError('Reason is required for account deletion')
      return
    }
    
    setProcessing(true)
    setError('')
    try {
      await hrAPI.deleteUser({
        user_id: selectedUser.user_id,
        reason: deleteReason.trim()
      })
      
      // Close modal and refresh the list and statistics
      setShowDeleteModal(false)
      setSelectedUser(null)
      setDeleteReason('')
      await fetchRegistrations(true) // Force refresh
      await fetchStatistics()
    } catch (error) {
      setError(error.message || 'Failed to delete user')
    } finally {
      setProcessing(false)
    }
  }



  const closeDeactivateModal = () => {
    setShowDeactivateModal(false)
    setSelectedUser(null)
    setDeactivateReason('')
    setError('')
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedUser(null)
    setDeleteReason('')
    setError('')
  }

  const handleLogout = () => {
    authService.clearTokens()
    window.location.href = '/'
  }

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getTrackColor = (track) => {
    // Predefined colors for known tracks
    const predefinedColors = {
      'Basic Frontend': 'var(--neon-cyan)',
      'Advanced Frontend': 'var(--neon-magenta)',
      'Full Stack': 'var(--neon-purple)',
      'Backend': 'var(--neon-orange)'
    }
    
    // If track has a predefined color, use it
    if (predefinedColors[track]) {
      return predefinedColors[track]
    }
    
    // Generate a consistent color based on track name for dynamic tracks
    const colors = [
      'var(--neon-cyan)',
      'var(--neon-magenta)', 
      'var(--neon-purple)',
      'var(--neon-orange)',
      '#00ff88', // neon green
      '#ff0088', // neon pink
      '#8800ff', // neon violet
      '#ff8800', // neon amber
      '#00ffff', // cyan
      '#ff00ff'  // magenta
    ]
    
    // Simple hash function to get consistent color for track name
    let hash = 0
    for (let i = 0; i < track.length; i++) {
      hash = track.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  // Add bulk enable handler
  const handleBulkEnable = async () => {
    setBulkEnabling(true)
    setBulkEnableMessage('')
    try {
      const result = await hrAPI.bulkEnable()
      setBulkEnableMessage(`Bulk enabled ${result.updated} students.`)
      await fetchRegistrations(true)
    } catch (error) {
      setBulkEnableMessage(error.message || 'Bulk enable failed')
    } finally {
      setBulkEnabling(false)
    }
  }

  // Add bulk disable handler
  const handleBulkDisable = async () => {
    setBulkDisabling(true)
    setBulkDisableMessage('')
    try {
      const result = await hrAPI.bulkDisable()
      setBulkDisableMessage(`Bulk disabled ${result.updated} students.`)
      await fetchRegistrations(true)
    } catch (error) {
      setBulkDisableMessage(error.message || 'Bulk disable failed')
    } finally {
      setBulkDisabling(false)
    }
  }



  if (!authService.isAuthenticated() || authService.getUserType() !== 'hr') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized Access</h2>
        <p>Please login with HR credentials to access this dashboard.</p>
      </div>
    )
  }

  return (
    <div className="hr-dashboard">
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
                <h1>HR Dashboard</h1>
                <p>Manage Internship Registrations</p>
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

        {/* Statistics Section */}
        <motion.div
          className="statistics-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="section-header">
            <h2>Dashboard Statistics</h2>
          </div>

          {statsLoading ? (
            <div className="stats-loading">
              <FaSpinner className="spinner" />
              <p>Loading statistics...</p>
            </div>
          ) : statistics ? (
            <>
              <div className="stats-grid">
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="stat-icon">
                    <FaUserCheck />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.activated_accounts}</h3>
                    <p>Active Accounts</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <div className="stat-icon">
                    <FaTimesCircle />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.disabled_accounts}</h3>
                    <p>Disabled Accounts</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.pending_registrations}</h3>
                    <p>Pending Registrations</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.today_activations}</h3>
                    <p>Today's Activations</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="stat-icon">
                    <FaChartBar />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.recent_activations_7_days}</h3>
                    <p>Last 7 Days</p>
                  </div>
                </motion.div>
              </div>

              {statistics.track_breakdown && (
                <motion.div
                  className="track-breakdown"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h3>Track-wise Breakdown</h3>
                  <div className="track-stats-grid">
                    {Object.entries(statistics.track_breakdown).map(([track, stats]) => (
                      <div key={track} className="track-stat-card">
                        <h4>{track}</h4>
                        <div className="track-numbers">
                          <div className="track-stat">
                            <span className="stat-number active">{stats.active}</span>
                            <span className="stat-label">Active</span>
                          </div>
                          <div className="track-stat">
                            <span className="stat-number pending">{stats.pending}</span>
                            <span className="stat-label">Pending</span>
                          </div>
                          <div className="track-stat">
                            <span className="stat-number disabled">{stats.disabled}</span>
                            <span className="stat-label">Disabled</span>
                          </div>
                          <div className="track-stat">
                            <span className="stat-number total">{stats.total}</span>
                            <span className="stat-label">Total</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="stats-error">
              <FaTimesCircle />
              <p>Failed to load statistics</p>
            </div>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
                {availableTracks.map((track, index) => (
                  <option key={index} value={track.track_name || track}>
                    {track.track_name || track}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaCalendarAlt />
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              />
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="search-group">
              <label>
                <FaSearch />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

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

        {/* Password Reset Section */}
        <motion.div
          className="password-reset-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3>Reset Student Password</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setProcessing(true)
              setError('')
              setPasswordResetMessage('')
              try {
                await hrAPI.resetStudentPassword(passwordResetUserId)
                setPasswordResetMessage('Password reset instructions sent to student email.')
                setPasswordResetUserId('')
              } catch (err) {
                setError(err.message || 'Failed to reset password')
              } finally {
                setProcessing(false)
              }
            }}
            className="password-reset-form"
          >
            <input
              type="text"
              placeholder="Enter Student User ID"
              value={passwordResetUserId}
              onChange={e => setPasswordResetUserId(e.target.value)}
              required
              style={{ marginRight: 10 }}
            />
            <motion.button
              type="submit"
              className="reset-btn"
              disabled={processing || !passwordResetUserId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {processing ? <FaSpinner className="spinner" /> : <FaCheckCircle />} Reset Password
            </motion.button>
          </form>
          {passwordResetMessage && (
            <div className="success-banner">{passwordResetMessage}</div>
          )}
        </motion.div>

        {/* Debug Section */}
        <motion.div
          className="debug-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Database Debug Tools</h3>
          <div className="debug-actions">
            <motion.button
              className="debug-btn"
              onClick={async () => {
                setProcessing(true)
                setError('')
                try {
                  const result = await hrAPI.fixInconsistentUsers()
                  setError(`Database fix completed: ${result.message}`)
                  await fetchRegistrations(true)
                  await fetchStatistics()
                } catch (err) {
                  setError(err.message || 'Failed to fix database inconsistencies')
                } finally {
                  setProcessing(false)
                }
              }}
              disabled={processing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {processing ? <FaSpinner className="spinner" /> : <FaCheckCircle />} Fix Database Inconsistencies
            </motion.button>
          </div>
        </motion.div>

        {/* Payment Details Section */}
        <motion.div
          className="payment-details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3>
            <FaCreditCard />
            Payment Details & Transaction IDs
          </h3>
          
          {paymentsLoading ? (
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <p>Loading payment details...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="payments-table-container">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Track</th>
                    <th>Amount</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .filter(payment => payment.user_id) // Only show completed payments with user_id
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((payment, index) => (
                      <tr key={index} className="payment-row">
                        <td className="user-id-cell">{payment.user_id}</td>
                        <td className="name-cell">{payment.registration_data?.fullName || 'N/A'}</td>
                        <td className="email-cell">{payment.registration_data?.email || 'N/A'}</td>
                        <td className="track-cell">
                          <span className={`track-badge ${getTrackColor(payment.registration_data?.track)}`}>
                            {payment.registration_data?.track || 'N/A'}
                          </span>
                        </td>
                        <td className="amount-cell">₹{payment.amount}</td>
                        <td className="transaction-cell">
                          <span className="transaction-id">{payment.payment_id || 'N/A'}</span>
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${payment.status === 'completed' ? 'completed' : 'pending'}`}>
                            {payment.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="date-cell">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-payments">
              <FaCreditCard />
              <p>No payment records found</p>
            </div>
          )}
        </motion.div>

        {/* Bulk Enable Section */}
        <motion.div
          className="bulk-enable-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button className="bulk-enable-btn" onClick={handleBulkEnable} disabled={bulkEnabling}>
            {bulkEnabling ? 'Enabling...' : 'Bulk Enable All Paid Students'}
          </button>
          <button className="bulk-disable-btn" onClick={handleBulkDisable} disabled={bulkDisabling}>
            {bulkDisabling ? 'Disabling...' : 'Bulk Disable All Enabled Students'}
          </button>
          {bulkEnableMessage && <div className="bulk-enable-message">{bulkEnableMessage}</div>}
          {bulkDisableMessage && <div className="bulk-disable-message">{bulkDisableMessage}</div>}
        </motion.div>



        {/* Deactivate Modal */}
        <AnimatePresence>
          {showDeactivateModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeactivateModal}
            >
              <motion.div
                className="deactivate-modal"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>
                    <FaTimesCircle />
                    Deactivate Registration
                  </h2>
                  <button className="close-btn" onClick={closeDeactivateModal}>
                    <FaTimesCircle />
                  </button>
                </div>

                {selectedUser && (
                  <div className="user-info-modal">
                    <div className="user-details">
                      <h3>{selectedUser.fullName}</h3>
                      <p className="user-id">{selectedUser.user_id}</p>
                      <p className="track-info">{selectedUser.track}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleDeactivateSubmit} className="deactivate-form">
                  <div className="form-group">
                    <label htmlFor="deactivateReason">
                      <FaTimesCircle />
                      Reason for Deactivation *
                    </label>
                    <textarea
                      id="deactivateReason"
                      placeholder="Please provide a reason for deactivating this registration..."
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      required
                      rows="4"
                      autoFocus
                    />
                    <small style={{ color: '#ff4f4f', fontWeight: 'bold' }}>
                      ⚠️ WARNING: This reason will be sent to the student via email. Please provide a clear and professional explanation.
                    </small>
                  </div>

                  {error && (
                    <div className="error-message">
                      <FaTimesCircle />
                      {error}
                    </div>
                  )}

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={closeDeactivateModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="deactivate-submit-btn"
                      disabled={processing || !deactivateReason.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaTimesCircle />
                      )}
                      Deactivate Registration
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
            >
              <motion.div
                className="deactivate-modal" // Reusing deactivate-modal class
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>
                    <FaTimesCircle />
                    Delete Registration
                  </h2>
                  <button className="close-btn" onClick={closeDeleteModal}>
                    <FaTimesCircle />
                  </button>
                </div>

                {selectedUser && (
                  <div className="user-info-modal">
                    <div className="user-details">
                      <h3>{selectedUser.fullName}</h3>
                      <p className="user-id">{selectedUser.user_id}</p>
                      <p className="track-info">{selectedUser.track}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleDeleteSubmit} className="deactivate-form">
                  <div className="form-group">
                    <label htmlFor="deleteReason">
                      <FaTimesCircle />
                      Reason for Deletion *
                    </label>
                    <textarea
                      id="deleteReason"
                      placeholder="Please provide a reason for deleting this registration..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      required
                      rows="4"
                      autoFocus
                    />
                    <small style={{ color: '#ff4f4f', fontWeight: 'bold' }}>
                      ⚠️ WARNING: This reason will be sent to the student via email. This action will permanently delete the account and cannot be undone.
                    </small>
                  </div>

                  {error && (
                    <div className="error-message">
                      <FaTimesCircle />
                      {error}
                    </div>
                  )}

                  <div className="modal-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={closeDeleteModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="deactivate-submit-btn"
                      disabled={processing || !deleteReason.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaTimesCircle />
                      )}
                      Delete Registration
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.div
          className="tab-navigation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <button
            className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <FaUsers />
            Internship Registrations
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <FaUserTie />
            AI Internship Applications
            {applicationsTotal > 0 && <span className="badge">{applicationsTotal}</span>}
          </button>
        </motion.div>

        {/* Applications Section */}
        {activeTab === 'applications' && (
          <motion.div
            className="applications-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="section-header">
              <div className="header-left">
                <h2>AI Internship Applications</h2>
                <span className="count">{applicationsTotal} applications</span>
              </div>
              <motion.button
                className="refresh-btn"
                onClick={() => fetchApplications()}
                disabled={applicationsLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {applicationsLoading ? <FaSpinner className="spinner" /> : <FaSearch />}
                Refresh
              </motion.button>
            </div>

            {applicationsLoading ? (
              <div className="loading-container">
                <FaSpinner className="loading-spinner" />
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <FaUserTie />
                <h3>No applications found</h3>
                <p>There are no AI internship applications yet.</p>
              </div>
            ) : (
              <div className="applications-list-container">
                <table className="applications-list-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Area of Interest</th>
                      <th>LinkedIn</th>
                      <th>AI Experience</th> {/* NEW COLUMN */}
                      <th>Submitted</th>
                      <th>Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application, index) => (
                      <tr key={application._id}>
                        <td>{index + 1}</td>
                        <td>{application.fullName}</td>
                        <td>{application.email}</td>
                        <td>{application.phoneNumber}</td>
                        <td>
                          <span className="area-badge">{application.areaOfInterest}</span>
                        </td>
                        <td>
                          <a 
                            href={application.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="linkedin-link"
                          >
                            View Profile
                          </a>
                        </td>
                        <td>
                          {typeof application.aiExperience === 'number' ? (
                            <div className="ai-exp-bar-container">
                              <div className="ai-exp-bar-bg">
                                <div className="ai-exp-bar-fill" style={{width: `${application.aiExperience}%`}}></div>
                              </div>
                              <span className="ai-exp-label">{application.aiExperience}%</span>
                            </div>
                          ) : (
                            <span className="ai-exp-label">N/A</span>
                          )}
                        </td>
                        <td>{new Date(application.submittedAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="download-btn"
                            onClick={() => handleDownloadResume(application._id)}
                            title="Download Resume"
                          >
                            <FaFileUpload />
                            Download
                          </button>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteApplication(application._id)}
                            title="Delete Application"
                          >
                            <FaTimesCircle />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {applicationsPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setApplicationsPage(prev => Math.max(1, prev - 1))}
                      disabled={applicationsPage === 1}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {applicationsPage} of {applicationsPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => setApplicationsPage(prev => Math.min(applicationsPages, prev + 1))}
                      disabled={applicationsPage === applicationsPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Registrations List */}
        <motion.div
          className="registrations-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: activeTab === 'registrations' ? 'block' : 'none' }}
        >
          <div className="section-header">
            <div className="header-left">
              <h2>All Users</h2>
              <span className="count">{filteredRegistrations.length} users</span>
              {lastRefresh && (
                <span className="last-refresh">
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                </span>
              )}
            </div>
            <motion.button
              className="refresh-btn"
              onClick={() => fetchRegistrations(true)}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
              Refresh
            </motion.button>
          </div>

          {loading ? (
            <div className="loading-container">
              <FaSpinner className="loading-spinner" />
              <p>Loading users...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <FaUserTie />
              <h3>No users found</h3>
              <p>There are no users matching your criteria.</p>
            </div>
          ) : (
            <div className="registrations-list-container">
              <table className="registrations-list-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>User ID</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>College</th>
                    <th>Track</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Enable/Disable</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration, index) => (
                    <tr key={registration.user_id || index}>
                      <td>{index + 1}</td>
                      <td>{registration.fullName}</td>
                      <td>{registration.user_id}</td>
                      <td>{registration.email}</td>
                      <td>{registration.whatsapp}</td>
                      <td>{registration.collegeName}</td>
                      <td>{registration.track}</td>
                      <td>{registration.yearOfStudy} / {registration.passoutYear}</td>
                      <td>
                        <span className={`status-badge ${registration.status === 'Active' ? 'completed' : 'pending'}`}>{registration.status}</span>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={registration.status === 'Active'}
                            onChange={() => handleToggleStatus(registration)}
                            disabled={processing}
                          />
                          <span className="slider"></span>
                        </label>
                        <span className="toggle-label">{registration.status === 'Active' ? 'Enabled' : 'Disabled'}</span>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(registration)}
                          disabled={processing}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTimesCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 