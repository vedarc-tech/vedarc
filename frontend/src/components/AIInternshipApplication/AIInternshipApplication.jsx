import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaEnvelope, FaWhatsapp, FaLinkedin, FaFileUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import './AIInternshipApplication.css'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';
import OTPVerificationSuccessModal from '../OTPVerificationSuccessModal';

const areaOfInterestOptions = [
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'ai-agents', label: 'AI Agents' },
  { value: 'nlp', label: 'NLP' },
  { value: 'computer-vision', label: 'Computer Vision' },
  { value: 'full-stack-ai', label: 'Full Stack AI' },
  { value: 'general-research', label: 'General Research' }
]

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: 'rgba(0,0,0,0.85)',
    borderColor: state.isFocused ? 'var(--neon-cyan)' : 'var(--neon-cyan)',
    boxShadow: state.isFocused ? '0 0 8px var(--neon-cyan)' : 'none',
    color: 'var(--neon-cyan)',
    minHeight: 40,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  }),
  menu: provided => ({
    ...provided,
    background: 'rgba(0,0,0,0.95)',
    color: 'var(--neon-cyan)',
    borderRadius: 8,
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected
      ? 'rgba(0,255,174,0.15)'
      : state.isFocused
      ? 'rgba(0,249,255,0.08)'
      : 'transparent',
    color: 'var(--neon-cyan)',
    fontWeight: state.isSelected ? 700 : 500,
    fontSize: 14,
    cursor: 'pointer',
    padding: '8px 12px',
  }),
  singleValue: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
    fontSize: 14,
  }),
  input: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
    fontSize: 14,
  }),
  dropdownIndicator: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
  }),
  indicatorSeparator: provided => ({
    ...provided,
    background: 'var(--neon-cyan)',
  }),
}

export default function AIInternshipApplication() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    linkedinUrl: '',
    areaOfInterest: '',
    whyJoin: '',
    portfolioLinks: '',
    aiExperience: 0 // NEW FIELD
  })
  
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  
  // OTP states
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const navigate = useNavigate();
  const [showOTPSuccess, setShowOTPSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid 10-digit number'
    }
    
    if (!resumeFile) {
      newErrors.resume = 'Resume upload is required'
    } else if (resumeFile.size > 2 * 1024 * 1024) {
      newErrors.resume = 'File size must be less than 2MB. Please use a PDF compressor.'
    } else if (resumeFile.type !== 'application/pdf') {
      newErrors.resume = 'Only PDF files are allowed'
    }
    
    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = 'LinkedIn URL is required'
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn profile URL'
    }
    
    if (!formData.areaOfInterest) {
      newErrors.areaOfInterest = 'Please select an area of interest'
    }
    
    if (!formData.whyJoin.trim()) {
      newErrors.whyJoin = 'Please tell us why you want to join this internship'
    } else if (formData.whyJoin.length < 50) {
      newErrors.whyJoin = 'Please provide a more detailed response (at least 50 characters)'
    }
    
    // No required validation for aiExperience (optional)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, resume: 'Only PDF files are allowed' }))
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: 'File size must be less than 2MB. Please use a PDF compressor.' }))
        return
      }
      setResumeFile(file)
      setErrors(prev => ({ ...prev, resume: '' }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      areaOfInterest: selectedOption
    }))
    if (errors.areaOfInterest) {
      setErrors(prev => ({ ...prev, areaOfInterest: '' }))
    }
  }

  const handleSliderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      aiExperience: Number(e.target.value)
    }))
  }

  const sendOtp = async () => {
    if (!validateForm()) {
      return
    }

    setOtpLoading(true)
    setOtpError('')
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('fullName', formData.fullName)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.vedarc.co.in/api'}/internship-application/send-otp`, {
        method: 'POST',
        body: formDataToSend
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setOtpSent(true)
        setShowOtpForm(true)
        setSuccess('OTP sent successfully! Please check your email. (If Not Visible, Check Spam Folder)')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setOtpError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setOtpError('Failed to send OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyOtpAndSubmit = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP')
      return
    }

    setSubmitting(true)
    setOtpError('')
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phoneNumber', formData.phoneNumber)
      formDataToSend.append('linkedinUrl', formData.linkedinUrl)
      formDataToSend.append('areaOfInterest', formData.areaOfInterest.value)
      formDataToSend.append('whyJoin', formData.whyJoin)
      formDataToSend.append('portfolioLinks', formData.portfolioLinks)
      formDataToSend.append('aiExperience', formData.aiExperience) // NEW FIELD
      formDataToSend.append('otp', otp)
      formDataToSend.append('resume', resumeFile)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.vedarc.co.in/api'}/internship-application/submit`, {
        method: 'POST',
        body: formDataToSend
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setShowOTPSuccess(true);
        resetForm()
      } else {
        setOtpError(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      setOtpError('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      linkedinUrl: '',
      areaOfInterest: '',
      whyJoin: '',
      portfolioLinks: '',
      aiExperience: 0 // RESET
    })
    setResumeFile(null)
    setOtp('')
    setShowOtpForm(false)
    setOtpSent(false)
    setErrors({})
    setOtpError('')
  }

  if (showOTPSuccess) {
    return <OTPVerificationSuccessModal onClose={() => navigate('/')} />;
  }

  return (
    <div className="ai-internship-application">
      <div className="application-container">
        <motion.div
          className="application-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="application-title">
            <span className="highlight">AI</span> Internship Application
          </h1>
          <p className="application-subtitle">
            Join our cutting-edge AI research and development team
          </p>
        </motion.div>

        <motion.div
          className="application-form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {!showOtpForm ? (
            <form className="application-form" onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
              <div className="form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="label-icon" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    <FaEnvelope className="label-icon" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label className="form-label">
                    <FaWhatsapp className="label-icon" />
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="Enter your 10-digit phone number"
                    maxLength="10"
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>

                {/* LinkedIn URL */}
                <div className="form-group">
                  <label className="form-label">
                    <FaLinkedin className="label-icon" />
                    LinkedIn Profile URL *
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className={`form-input ${errors.linkedinUrl ? 'error' : ''}`}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.linkedinUrl && <span className="error-message">{errors.linkedinUrl}</span>}
                </div>

                {/* Area of Interest */}
                <div className="form-group">
                  <label className="form-label">
                    Area of Interest *
                  </label>
                  <Select
                    value={formData.areaOfInterest}
                    onChange={handleSelectChange}
                    options={areaOfInterestOptions}
                    styles={customStyles}
                    placeholder="Select your area of interest"
                    isSearchable={false}
                    className={errors.areaOfInterest ? 'error' : ''}
                  />
                  {errors.areaOfInterest && <span className="error-message">{errors.areaOfInterest}</span>}
                </div>

                {/* Resume Upload */}
                <div className="form-group">
                  <label className="form-label">
                    <FaFileUpload className="label-icon" />
                    Resume Upload (PDF only, max 2MB) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`file-input ${errors.resume ? 'error' : ''}`}
                  />
                  {resumeFile && (
                    <div className="file-info">
                      <span className="file-name">{resumeFile.name}</span>
                      <span className="file-size">({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                  {errors.resume && <span className="error-message">{errors.resume}</span>}
                </div>
              </div>

              {/* Why Join */}
              <div className="form-group full-width">
                <label className="form-label">
                  Why do you want to join this internship? *
                </label>
                <textarea
                  name="whyJoin"
                  value={formData.whyJoin}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.whyJoin ? 'error' : ''}`}
                  placeholder="Tell us about your motivation, goals, and what you hope to achieve..."
                  rows="4"
                />
                {errors.whyJoin && <span className="error-message">{errors.whyJoin}</span>}
              </div>

              {/* Portfolio Links */}
              <div className="form-group full-width">
                <label className="form-label">
                  Portfolio/Project Links (Optional)
                </label>
                <textarea
                  name="portfolioLinks"
                  value={formData.portfolioLinks}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="GitHub, personal website, project demos, etc. (one per line)"
                  rows="3"
                />
              </div>

              {/* Experience on AI */}
              <div className="form-group full-width">
                <label className="form-label">
                  Experience on AI (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={formData.aiExperience}
                  onChange={e => {
                    let val = Number(e.target.value);
                    if (val === 100) val = 99;
                    setFormData(prev => ({ ...prev, aiExperience: val }));
                  }}
                  className="slider-input"
                />
                <div className="slider-value">{formData.aiExperience}%</div>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={otpLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {otpLoading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP & Continue'
                )}
              </motion.button>
            </form>
          ) : (
            <div className="otp-form">
              <div className="otp-header">
                <h3>Verify Your Email</h3>
                <p>We've sent a verification code to <strong>{formData.email}</strong></p>
              </div>
              
              <div className="otp-input-group">
                <label className="form-label">Enter OTP</label>
                <div className="otp-input-container">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="otp-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <button
                    type="button"
                    className="otp-toggle-btn"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {otpError && <span className="error-message">{otpError}</span>}
              </div>

              <div className="otp-actions">
                <motion.button
                  type="button"
                  className="submit-btn"
                  onClick={verifyOtpAndSubmit}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </motion.button>
                
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setShowOtpForm(false)}
                  disabled={submitting}
                >
                  Back to Form
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="message success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FaCheckCircle />
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div
              className="message error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FaTimesCircle />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 