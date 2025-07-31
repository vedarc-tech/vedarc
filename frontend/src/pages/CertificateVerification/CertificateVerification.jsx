import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner, FaQrcode, FaUser, FaCalendarAlt, FaGraduationCap, FaTrophy, FaShieldAlt } from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'
import { publicAPI } from '../../services/apiService'
import './CertificateVerification.css'

export default function CertificateVerification() {
  const { internId } = useParams()
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState(internId || '')
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (internId) {
      verifyCertificate(internId)
    }
  }, [internId])

  const verifyCertificate = async (id) => {
    if (!id.trim()) {
      setError('Please enter an Intern ID')
      return
    }

    setLoading(true)
    setError('')
    setCertificate(null)
    setVerified(false)

    try {
      const response = await publicAPI.verifyCertificate(id)
      setCertificate(response.certificate)
      setVerified(true)
      setError('')
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setError(error.message || 'Certificate not found or invalid')
      setVerified(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    verifyCertificate(searchId)
  }

  const handleNewSearch = () => {
    setCertificate(null)
    setVerified(false)
    setError('')
    setSearchId('')
    navigate('/verify-certificate')
  }

  return (
    <div className="certificate-verification-page">
      <div className="verification-bg">
        <div className="circuit-pattern"></div>
        <div className="neon-glow"></div>
      </div>

      <div className="verification-container">
        {/* Header */}
        <motion.div
          className="verification-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <img src="/LOGO VEDARC.png" alt="Vedarc Logo" className="vedarc-logo" />
            <h1>Certificate Verification</h1>
            <p>Verify the authenticity of Vedarc Technologies internship certificates</p>
          </div>
        </motion.div>

        {/* Search Section */}
        {!certificate && (
          <motion.div
            className="search-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="search-card">
              <div className="search-icon">
                <FaShieldAlt />
              </div>
              <h2>Verify Your Certificate</h2>
              <p>Enter the Intern ID to verify the authenticity of your internship certificate</p>

              <form onSubmit={handleSearch} className="search-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Intern ID (e.g., John_123456)"
                    className="search-input"
                    required
                  />
                  <motion.button
                    type="submit"
                    className="search-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <FaSearch />
                    )}
                    Verify
                  </motion.button>
                </div>
              </form>

              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FaTimesCircle />
                  {error}
                </motion.div>
              )}

              <div className="search-info">
                <h3>How to find your Intern ID?</h3>
                <ul>
                  <li>Check your certificate QR code</li>
                  <li>Look for the ID in the format: FirstName_######</li>
                  <li>Contact your internship coordinator if you can't find it</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Certificate Display */}
        {certificate && (
          <motion.div
            className="certificate-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="verification-status">
              <motion.div
                className={`status-badge ${verified ? 'verified' : 'invalid'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {verified ? (
                  <>
                    <FaCheckCircle />
                    <span>Certificate Verified</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    <span>Invalid Certificate</span>
                  </>
                )}
              </motion.div>
            </div>

            <div className="certificate-card">
              <div className="certificate-header">
                <img src="/LOGO VEDARC.png" alt="Vedarc Logo" className="cert-logo" />
                <h2>Certificate of Internship Completion</h2>
                <div className="verification-badge">
                  <FaShieldAlt />
                  <span>Verified by Vedarc Technologies</span>
                </div>
              </div>

              <div className="certificate-body">
                <div className="intern-info-section">
                  <div className="intern-avatar">
                    {certificate.profilePicture ? (
                      <img src={certificate.profilePicture} alt={certificate.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {certificate.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="intern-details">
                    <h3>{certificate.firstName} {certificate.lastName}</h3>
                    <p className="intern-id">Intern ID: {certificate.internId}</p>
                    <p className="internship-title">{certificate.internshipTitle}</p>
                  </div>
                </div>

                <div className="certificate-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaGraduationCap className="detail-icon" />
                      <div>
                        <label>Institute</label>
                        <span>{certificate.institute}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <div>
                        <label>Duration</label>
                        <span>
                          {new Date(certificate.startDate).toLocaleDateString()} - {new Date(certificate.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grade-section">
                    <div className="grade-display">
                      <FaTrophy className="grade-icon" />
                      <div>
                        <label>Grade Achieved</label>
                        <span className={`grade grade-${certificate.grade}`}>
                          {certificate.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="verification-details">
                    <h4>Verification Details</h4>
                    <div className="verification-info">
                      <p><strong>Certificate ID:</strong> {certificate.internId}</p>
                      <p><strong>Verification Date:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>Status:</strong> <span className="status-verified">Verified ✓</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="certificate-footer">
                <div className="security-note">
                  <FaShieldAlt />
                  <p>This certificate has been digitally verified and is authentic</p>
                </div>
                
                <motion.button
                  className="new-search-btn"
                  onClick={handleNewSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSearch />
                  Verify Another Certificate
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div
          className="features-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Why Verify Certificates?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Authenticity</h3>
              <p>Ensure the certificate is genuine and issued by Vedarc Technologies</p>
            </div>
            
            <div className="feature-card">
              <FaQrcode className="feature-icon" />
              <h3>Quick Verification</h3>
              <p>Instant verification using QR codes or Intern ID</p>
            </div>
            
            <div className="feature-card">
              <FaUser className="feature-icon" />
              <h3>Complete Details</h3>
              <p>View all certificate details including grades and duration</p>
            </div>
            
            <div className="feature-card">
              <FaCheckCircle className="feature-icon" />
              <h3>Trusted System</h3>
              <p>Built on secure blockchain-like verification technology</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="contact-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="contact-card">
            <h3>Need Help?</h3>
            <p>If you're having trouble verifying your certificate or have questions, contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> tech@vedarc.co.in</p>
              <p><strong>Phone:</strong> +91 8897140410</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 