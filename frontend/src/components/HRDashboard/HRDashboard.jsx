import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUserTie, FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter, FaSearch, FaEnvelope, FaWhatsapp, FaGraduationCap, FaCalendarAlt, FaCode, FaCreditCard, FaChartBar, FaUsers, FaUserCheck, FaClock } from 'react-icons/fa'
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
  
  // Payment ID modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [paymentId, setPaymentId] = useState('')

  // Deactivate modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')

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

  useEffect(() => {
    fetchRegistrations()
    fetchStatistics()
    fetchPayments()
    fetchAvailableTracks()
    
    // Set up auto-refresh every 30 seconds
    const autoRefreshInterval = setInterval(() => {
      fetchRegistrations()
      fetchStatistics()
      fetchPayments()
    }, 30000) // 30 seconds
    
    return () => clearInterval(autoRefreshInterval)
  }, [filters])

  const fetchRegistrations = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const data = await hrAPI.getAllUsers()
      setRegistrations(data.users || [])
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

  const handleActivateUser = async (userData) => {
    // Check if user is still in the current registrations list
    const isStillPending = registrations.some(reg => reg.user_id === userData.user_id)
    
    if (!isStillPending) {
      setError('This user is no longer in the pending list. Refreshing data...')
      await fetchRegistrations(true)
      return
    }
    
    // Show payment modal instead of directly activating
    setSelectedUser(userData)
    setPaymentId('')
    setShowPaymentModal(true)
  }

  const handleDeactivateUser = async (userData) => {
    // Check if user is still in the current registrations list
    const isStillPending = registrations.some(reg => reg.user_id === userData.user_id)
    
    if (!isStillPending) {
      setError('This user is no longer in the pending list. Refreshing data...')
      await fetchRegistrations(true)
      return
    }
    
    // Show deactivate modal
    setSelectedUser(userData)
    setDeactivateReason('')
    setShowDeactivateModal(true)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentId.trim()) {
      setError('Payment ID is required')
      return
    }
    
    setProcessing(true)
    setError('')
    try {
      await hrAPI.activateUser({
        user_id: selectedUser.user_id,
        payment_id: paymentId.trim()
      })
      
      // Close modal and refresh the list and statistics
      setShowPaymentModal(false)
      setSelectedUser(null)
      setPaymentId('')
      await fetchRegistrations(true) // Force refresh
      await fetchStatistics()
    } catch (error) {
      // Handle specific "User is not pending" error
      if (error.message.includes('User is not pending')) {
        // setError('This user has already been activated or their status has changed. Refreshing the list...')
        setError(error.message)
        // Force refresh the list to get updated data
        await fetchRegistrations(true)
        await fetchStatistics()
        // Close the modal after a short delay
        setTimeout(() => {
          setShowPaymentModal(false)
          setSelectedUser(null)
          setPaymentId('')
          setError('')
        }, 2000)
      } else if (error.message.includes('has already been activated with payment ID')) {
        setError('This user has already been activated with a payment ID. Refreshing the list...')
        // Force refresh the list to get updated data
        await fetchRegistrations(true)
        await fetchStatistics()
        // Close the modal after a short delay
        setTimeout(() => {
          setShowPaymentModal(false)
          setSelectedUser(null)
          setPaymentId('')
          setError('')
        }, 2000)
      } else {
        setError(error.message || 'Failed to activate user')
      }
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
      await hrAPI.deactivateUser({
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
      // Handle specific "User is not pending" error
      if (error.message.includes('User is not pending')) {
        setError(error.message)
        // Force refresh the list to get updated data
        await fetchRegistrations(true)
        await fetchStatistics()
        // Close the modal after a short delay
        setTimeout(() => {
          setShowDeactivateModal(false)
          setSelectedUser(null)
          setDeactivateReason('')
          setError('')
        }, 2000)
      } else {
        setError(error.message || 'Failed to deactivate user')
      }
    } finally {
      setProcessing(false)
    }
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedUser(null)
    setPaymentId('')
    setError('')
  }

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false)
    setSelectedUser(null)
    setDeactivateReason('')
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

  // Add toggle handler
  const handleToggleStatus = async (user) => {
    setProcessing(true)
    setError('')
    try {
      if (user.status === 'Active') {
        await hrAPI.deactivateUser({ user_id: user.user_id, reason: 'Disabled by HR' })
      } else {
        await hrAPI.enableUser({ user_id: user.user_id })
      }
      await fetchRegistrations(true)
    } catch (error) {
      setError(error.message || 'Failed to update user status')
    } finally {
      setProcessing(false)
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
                    <p>Activated Accounts</p>
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

        {/* Payment ID Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              className="payment-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePaymentModal}
            >
              <motion.div
                className="payment-modal"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>
                    <FaCreditCard />
                    Enter Payment ID
                  </h2>
                  <button className="close-btn" onClick={closePaymentModal}>
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

                <form onSubmit={handlePaymentSubmit} className="payment-form">
                  <div className="form-group">
                    <label htmlFor="paymentId">
                      <FaCreditCard />
                      Payment ID *
                    </label>
                    <input
                      id="paymentId"
                      type="text"
                      placeholder="Enter the student's payment ID..."
                      value={paymentId}
                      onChange={(e) => setPaymentId(e.target.value)}
                      required
                      autoFocus
                    />
                    <small>Enter the payment reference ID provided by the student</small>
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
                      onClick={closePaymentModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="activate-btn"
                      disabled={processing || !paymentId.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {processing ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      Activate Account
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <small>This action will permanently delete the registration. Please provide a clear reason.</small>
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

        {/* Registrations List */}
        <motion.div
          className="registrations-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="section-header">
            <div className="header-left">
              <h2>Pending Registrations</h2>
              <span className="count">{filteredRegistrations.length} registrations</span>
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
              <p>Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <FaUserTie />
              <h3>No registrations found</h3>
              <p>There are no pending registrations matching your criteria.</p>
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