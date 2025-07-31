import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaDownload, FaEye, FaTrash, FaQrcode, FaUser, FaCalendarAlt, FaGraduationCap, FaTrophy, FaSpinner, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'
import QRCode from 'qrcode'
import { saveAs } from 'file-saver'
import { managerAPI } from '../../services/apiService'
import './CertificateVerifier.css'

export default function CertificateVerifier() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    profilePicture: null,
    firstName: '',
    lastName: '',
    internId: '',
    institute: '',
    startDate: '',
    endDate: '',
    internshipTitle: '',
    grade: 'A'
  })

  const [previewUrl, setPreviewUrl] = useState('')

  const grades = ['O', 'E', 'A', 'B', 'C', 'D', 'P', 'F']

  // Generate Intern ID when first name changes
  useEffect(() => {
    if (formData.firstName) {
      const timestamp = Date.now().toString().slice(-6)
      const randomCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const internId = `${formData.firstName}_${timestamp}`
      setFormData(prev => ({ ...prev, internId }))
    }
  }, [formData.firstName])

  // Load interns on component mount
  useEffect(() => {
    fetchInterns()
  }, [])

  const fetchInterns = async () => {
    setLoading(true)
    try {
      const response = await managerAPI.getInternCertificates()
      setInterns(response.interns || [])
      setError('')
    } catch (error) {
      console.error('Error fetching interns:', error)
      setError('Failed to load intern certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'profilePicture' && formData[key]) {
          formDataToSend.append(key, formData[key])
        } else if (key !== 'profilePicture') {
          formDataToSend.append(key, formData[key])
        }
      })

      const response = await managerAPI.addInternCertificate(formDataToSend)
      
      // Generate QR code
      const verificationUrl = `${window.location.origin}/verify-certificate/${formData.internId}`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00f9ff',
          light: '#ffffff'
        }
      })

      // Save QR code to backend
      await managerAPI.saveQRCode(formData.internId, qrCodeDataUrl)

      // Reset form
      setFormData({
        profilePicture: null,
        firstName: '',
        lastName: '',
        internId: '',
        institute: '',
        startDate: '',
        endDate: '',
        internshipTitle: '',
        grade: 'A'
      })
      setShowAddForm(false)
      
      // Refresh interns list
      await fetchInterns()
      
      setError('')
    } catch (error) {
      console.error('Error adding intern certificate:', error)
      setError(error.message || 'Failed to add intern certificate')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = async (internId) => {
    try {
      const verificationUrl = `${window.location.origin}/verify-certificate/${internId}`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#00f9ff',
          light: '#ffffff'
        }
      })

      // Convert data URL to blob and download
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      saveAs(blob, `certificate_qr_${internId}.png`)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      setError('Failed to download QR code')
    }
  }

  const previewCertificate = async (intern) => {
    setSelectedIntern(intern)
    setShowPreview(true)
  }

  const deleteIntern = async (internId) => {
    if (!window.confirm('Are you sure you want to delete this intern certificate?')) return
    
    setLoading(true)
    try {
      await managerAPI.deleteInternCertificate(internId)
      await fetchInterns()
      setError('')
    } catch (error) {
      console.error('Error deleting intern certificate:', error)
      setError('Failed to delete intern certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="certificate-verifier">
      <div className="verifier-header">
        <h2>Certificate Verifier</h2>
        <p>Add and manage intern certificates with QR code verification</p>
        <motion.button
          className="add-intern-btn"
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus />
          Add Intern Certificate
        </motion.button>
      </div>

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

      {/* Intern History */}
      <div className="intern-history">
        <h3>Intern History ({interns.length})</h3>
        
        {loading ? (
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Loading intern certificates...</p>
          </div>
        ) : interns.length === 0 ? (
          <div className="no-interns">
            <FaUser style={{ fontSize: '3rem', color: 'var(--neon-cyan)', marginBottom: '1rem' }} />
            <p>No intern certificates found. Add your first intern certificate to get started.</p>
          </div>
        ) : (
          <div className="interns-grid">
            {interns.map((intern, index) => (
              <motion.div
                key={intern._id || index}
                className="intern-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="intern-header">
                  <div className="intern-avatar">
                    {intern.profilePicture ? (
                      <img src={intern.profilePicture} alt={intern.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {intern.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="intern-info">
                    <h4>{intern.firstName} {intern.lastName}</h4>
                    <p className="intern-id">{intern.internId}</p>
                    <p className="intern-title">{intern.internshipTitle}</p>
                  </div>
                  <div className="intern-grade">
                    <span className={`grade-badge grade-${intern.grade}`}>
                      {intern.grade}
                    </span>
                  </div>
                </div>

                <div className="intern-details">
                  <p><strong>Institute:</strong> {intern.institute}</p>
                  <p><strong>Duration:</strong> {new Date(intern.startDate).toLocaleDateString()} - {new Date(intern.endDate).toLocaleDateString()}</p>
                </div>

                <div className="intern-actions">
                  <motion.button
                    className="action-btn preview-btn"
                    onClick={() => previewCertificate(intern)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEye />
                    Preview
                  </motion.button>
                  <motion.button
                    className="action-btn download-btn"
                    onClick={() => downloadQRCode(intern.internId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaDownload />
                    QR Code
                  </motion.button>
                  <motion.button
                    className="action-btn delete-btn"
                    onClick={() => deleteIntern(intern._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Intern Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="modal large-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add Intern Certificate</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Upload Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Intern ID (Auto-generated)</label>
                    <input
                      type="text"
                      name="internId"
                      value={formData.internId}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Institute *</label>
                    <input
                      type="text"
                      name="institute"
                      value={formData.institute}
                      onChange={handleInputChange}
                      placeholder="Enter institute name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Internship Title *</label>
                    <input
                      type="text"
                      name="internshipTitle"
                      value={formData.internshipTitle}
                      onChange={handleInputChange}
                      placeholder="Enter internship title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade *</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <FaPlus />
                    )}
                    Add Intern Certificate
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedIntern && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="modal preview-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Certificate Preview</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowPreview(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>

              <div className="certificate-preview">
                <div className="certificate-content">
                  <div className="certificate-header">
                    <img src="/LOGO VEDARC.png" alt="Vedarc Logo" className="vedarc-logo" />
                    <h2>Certificate of Internship Completion</h2>
                  </div>

                  <div className="certificate-body">
                    <p>This is to certify that</p>
                    <h3>{selectedIntern.firstName} {selectedIntern.lastName}</h3>
                    <p>has successfully completed the internship program</p>
                    <h4>{selectedIntern.internshipTitle}</h4>
                    <p>at {selectedIntern.institute}</p>
                    <p>from {new Date(selectedIntern.startDate).toLocaleDateString()} to {new Date(selectedIntern.endDate).toLocaleDateString()}</p>
                    
                    <div className="grade-section">
                      <p>Grade Achieved:</p>
                      <span className={`grade-display grade-${selectedIntern.grade}`}>
                        {selectedIntern.grade}
                      </span>
                    </div>

                    <div className="verification-info">
                      <p>Certificate ID: {selectedIntern.internId}</p>
                      <p>Verification URL: {window.location.origin}/verify-certificate/{selectedIntern.internId}</p>
                    </div>
                  </div>

                  <div className="certificate-footer">
                    <div className="signature-section">
                      <div className="signature-line"></div>
                      <p>Authorized Signature</p>
                    </div>
                    <div className="date-section">
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 