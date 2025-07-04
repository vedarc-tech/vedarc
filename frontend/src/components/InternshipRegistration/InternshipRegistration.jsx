import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaEnvelope, FaWhatsapp, FaGraduationCap, FaCalendarAlt, FaCode, FaCheckCircle, FaTimesCircle, FaSpinner, FaCreditCard, FaLock } from 'react-icons/fa'
import { publicAPI } from '../../services/apiService'
import './InternshipRegistration.css'
import Select from 'react-select'
import ReactCountryFlag from 'react-country-flag'

const topCountryCodes = [
  { value: '+91', label: 'India', countryCode: 'IN' },
  { value: '+1', label: 'USA/Canada', countryCode: 'US' },
  { value: '+44', label: 'UK', countryCode: 'GB' },
  { value: '+61', label: 'Australia', countryCode: 'AU' },
  { value: '+971', label: 'UAE', countryCode: 'AE' },
  { value: 'other', label: 'Other', countryCode: null }
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
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.2s',
    width: 85,
    minWidth: 85,
  }),
  menu: provided => ({
    ...provided,
    background: 'rgba(0,0,0,0.95)',
    color: 'var(--neon-cyan)',
    borderRadius: 8,
    zIndex: 20,
    width: 120,
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
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    cursor: 'pointer',
    padding: '6px 8px',
  }),
  singleValue: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
  }),
  input: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
    fontSize: 12,
  }),
  dropdownIndicator: provided => ({
    ...provided,
    color: 'var(--neon-cyan)',
    padding: '0 4px',
  }),
  indicatorSeparator: provided => ({
    ...provided,
    background: 'var(--neon-cyan)',
  }),
}

export default function InternshipRegistration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    countryCode: '+91',
    collegeName: '',
    track: '',
    yearOfStudy: '',
    passoutYear: ''
  })
  
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [userId, setUserId] = useState("")
  const [customCountryCode, setCustomCountryCode] = useState('')
  
  // Payment states
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [paymentId, setPaymentId] = useState('')

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(window.Razorpay)
          return
        }
        
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          setRazorpayLoaded(true)
          resolve(window.Razorpay)
        }
        script.onerror = () => {
          console.error('Failed to load Razorpay script')
          resolve(null)
        }
        document.body.appendChild(script)
      })
    }
    
    loadRazorpay()
  }, [])

  // Fetch available internships on component mount
  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    setLoading(true)
    try {
      const data = await publicAPI.getInternships()
      setInternships(data.internships || [])
    } catch (error) {
      console.error('Error fetching internships:', error)
      setError('Failed to load internship tracks')
    } finally {
      setLoading(false)
    }
  }

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
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required'
    } else if (!/^[0-9]{10}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Enter a valid 10-digit number'
    }
    
    if (formData.countryCode === 'other' && !customCountryCode.trim()) {
      newErrors.countryCode = 'Enter country code'
    }
    
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required'
    }
    
    if (!formData.track) {
      newErrors.track = 'Please select an internship track'
    }
    
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Please select your year of study'
    }
    
    if (!formData.passoutYear) {
      newErrors.passoutYear = 'Please select your passout year'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const fullWhatsapp = (formData.countryCode === 'other' ? customCountryCode : formData.countryCode) + formData.whatsapp
      const submitData = { ...formData, whatsapp: fullWhatsapp }
      const response = await publicAPI.registerStudent(submitData)
      
      if (response.payment_order) {
        // Payment required
        setPaymentOrder(response.payment_order)
        setShowPayment(true)
      } else {
        // Direct success (fallback)
        setSuccess(true)
        resetForm()
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      countryCode: '+91',
      collegeName: '',
      track: '',
      yearOfStudy: '',
      passoutYear: ''
    })
    setCustomCountryCode('')
  }

  const handlePayment = async () => {
    if (!razorpayLoaded || !paymentOrder) {
      setError('Payment system not ready. Please refresh and try again.')
      return
    }

    setPaymentProcessing(true)
    setError('')

    try {
      const options = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount * 100, // Razorpay expects amount in paise
        currency: paymentOrder.currency,
        name: 'VEDARC Technologies',
        description: 'Internship Program Registration',
        order_id: paymentOrder.order_id,
        handler: async function (response) {
          try {
            // Verify payment with backend
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
            
            const verificationResponse = await publicAPI.verifyPayment(verificationData)
            
            // Payment successful - show user ID and transaction details
            setShowPayment(false)
            setPaymentOrder(null)
            setUserId(verificationResponse.user_id)
            setPaymentId(verificationResponse.payment_id)
            setSuccess(true)
            resetForm()
            
          } catch (error) {
            setError('Payment verification failed. Please contact support.')
            setPaymentProcessing(false)
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.whatsapp
        },
        theme: {
          color: '#00f9ff'
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (error) {
      setError('Failed to initiate payment. Please try again.')
      setPaymentProcessing(false)
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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (name === 'countryCode') {
      setFormData(prev => ({ ...prev, countryCode: value }))
      setCustomCountryCode('')
      if (errors.countryCode) setErrors(prev => ({ ...prev, countryCode: '' }))
      return
    }
    if (name === 'customCountryCode') {
      setCustomCountryCode(value)
      if (errors.countryCode) setErrors(prev => ({ ...prev, countryCode: '' }))
      return
    }
  }

  const yearOptions = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year <= currentYear + 3; year++) {
    yearOptions.push(year)
  }

  if (success) {
    return (
      <section className="internship-registration">
        <div className="registration-bg">
          <div className="circuit-pattern"></div>
          <div className="neon-glow"></div>
        </div>

        <div className="registration-container">
          <div className="success-modal-overlay">
            <motion.div
              className="success-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h2>Registration & Payment Successful!</h2>
              <p>Thank you for registering for the VEDARC Internship Program.</p>
              {userId && (
                <div className="user-id-display">
                  <span>Your User ID:</span>
                  <span className="user-id">{userId}</span>
                </div>
              )}
              {paymentId && (
                <div className="transaction-details">
                  <span>Transaction ID:</span>
                  <span className="transaction-id">{paymentId}</span>
                </div>
              )}
              <div className="transaction-details">
                <p><strong>Payment Status:</strong> Completed</p>
                <p><strong>Amount:</strong> ₹299</p>
              </div>
              <div className="screenshot-instruction">
                <p style={{ color: '#fbbf24', fontWeight: 600, marginTop: 16 }}>
                  📸 Please take a screenshot of this page, including your Transaction ID, and share it with the HR when they contact you via WhatsApp.
                </p>
              </div>
              <p>Your payment has been processed successfully. Your account is now pending HR approval. You will receive login credentials via WhatsApp once approved.</p>
              
              <motion.button
                className="register-again-btn"
                onClick={() => { setSuccess(false); setUserId(""); setPaymentId(""); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register Another Student
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  if (showPayment) {
    return (
      <section className="internship-registration">
        <div className="registration-bg">
          <div className="circuit-pattern"></div>
          <div className="neon-glow"></div>
        </div>

        <div className="registration-container">
          <div className="payment-modal-overlay">
            <motion.div
              className="payment-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="payment-header">
                <FaCreditCard className="payment-icon" />
                <h2>Complete Payment</h2>
                <p>Registration successful! Please complete the payment to activate your account.</p>
              </div>

              {userId && (
                <div className="user-id-display">
                  <span>Your User ID:</span>
                  <span className="user-id">{userId}</span>
                </div>
              )}

              <div className="payment-details">
                <div className="payment-amount">
                  <span>Amount:</span>
                  <span className="amount">₹{paymentOrder?.amount || 999}</span>
                </div>
                <div className="payment-description">
                  <p>VEDARC Internship Program Registration</p>
                  <p>Duration: 4 weeks</p>
                  <p>Includes: Course materials, mentorship, certificate</p>
                </div>
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

              <div className="payment-actions">
                <motion.button
                  className="payment-btn"
                  onClick={handlePayment}
                  disabled={paymentProcessing || !razorpayLoaded}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {paymentProcessing ? (
                    <>
                      <FaSpinner className="spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      Pay Securely with Razorpay
                    </>
                  )}
                </motion.button>

                <motion.button
                  className="cancel-btn"
                  onClick={() => { setShowPayment(false); setPaymentOrder(null); }}
                  disabled={paymentProcessing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>

              <div className="payment-security">
                <p>
                  <FaLock /> Your payment is secured by Razorpay
                </p>
                <p>You will receive a confirmation email after successful payment.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="internship-registration">
      <div className="registration-bg">
        <div className="circuit-pattern"></div>
        <div className="neon-glow"></div>
      </div>

      <div className="registration-container">
        <motion.div
          className="registration-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="registration-header">
            <h2 className="glitch-title" data-text="INTERNSHIP REGISTRATION">
              INTERNSHIP REGISTRATION
            </h2>
            <div className="title-underline"></div>
            <p>Join VEDARC's internship program and kickstart your tech career</p>
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

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">
                  <FaUser className="input-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope className="input-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="whatsapp">
                  <FaWhatsapp className="input-icon" />
                  WhatsApp Number *
                </label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Select
                    classNamePrefix="country-select"
                    options={topCountryCodes}
                    value={topCountryCodes.find(opt => opt.value === formData.countryCode)}
                    onChange={opt => {
                      setFormData(prev => ({ ...prev, countryCode: opt.value }))
                      setCustomCountryCode('')
                      if (errors.countryCode) setErrors(prev => ({ ...prev, countryCode: '' }))
                    }}
                    isSearchable={false}
                    styles={customStyles}
                    formatOptionLabel={opt => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {opt.countryCode ? (
                          <ReactCountryFlag countryCode={opt.countryCode} svg style={{ width: 16, height: 12, borderRadius: 1 }} />
                        ) : (
                          <span role="img" aria-label="Other" style={{ fontSize: 12 }}>🌐</span>
                        )}
                        <span style={{ fontSize: 11 }}>{opt.value}</span>
                      </div>
                    )}
                  />
                  {formData.countryCode === 'other' && (
                    <input
                      type="text"
                      name="customCountryCode"
                      value={customCountryCode}
                      onChange={handleInputChange}
                      placeholder="+XXX"
                      style={{ width: 60, height: 40, fontSize: 12 }}
                      maxLength={5}
                    />
                  )}
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                      handleInputChange({ target: { name: 'whatsapp', value: val } })
                    }}
                    placeholder="Enter your WhatsApp number"
                    className={errors.whatsapp ? 'error' : ''}
                    style={{ flex: 1, height: 40, fontSize: 14 }}
                    maxLength={10}
                  />
                </div>
                {errors.countryCode && <span className="error-text">{errors.countryCode}</span>}
                {errors.whatsapp && <span className="error-text">{errors.whatsapp}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="collegeName">
                  <FaGraduationCap className="input-icon" />
                  College/University Name *
                </label>
                <input
                  type="text"
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="Enter your college/university name"
                  className={errors.collegeName ? 'error' : ''}
                />
                {errors.collegeName && <span className="error-text">{errors.collegeName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="track">
                  <FaCode className="input-icon" />
                  Internship Track *
                </label>
                <select
                  id="track"
                  name="track"
                  value={formData.track}
                  onChange={handleInputChange}
                  className={errors.track ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select an internship track</option>
                  {internships.map((internship, index) => (
                    <option key={index} value={internship.track_name}>
                      {internship.track_name} - {internship.duration}
                    </option>
                  ))}
                </select>
                {loading && <FaSpinner className="loading-spinner" />}
                {errors.track && <span className="error-text">{errors.track}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="yearOfStudy">
                  <FaCalendarAlt className="input-icon" />
                  Year of Study *
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  className={errors.yearOfStudy ? 'error' : ''}
                >
                  <option value="">Select your year of study</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
                {errors.yearOfStudy && <span className="error-text">{errors.yearOfStudy}</span>}
              </div>
            </div>

            <div className="form-row single-field">
              <div className="form-group">
                <label htmlFor="passoutYear">
                  <FaCalendarAlt className="input-icon" />
                  Passout Year *
                </label>
                <select
                  id="passoutYear"
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleInputChange}
                  className={errors.passoutYear ? 'error' : ''}
                >
                  <option value="">Select your passout year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.passoutYear && <span className="error-text">{errors.passoutYear}</span>}
              </div>
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={submitting || loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px var(--neon-magenta)" }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <div className="loading-spinner">
                  <FaSpinner />
                  <span>Registering...</span>
                </div>
              ) : (
                <>
                  <FaCheckCircle />
                  Register for Internship
                </>
              )}
            </motion.button>
          </form>

          <div className="registration-info">
            <h4>Registration Process:</h4>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Submit Registration</h5>
                  <p>Fill out the form above with your details</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Review Process</h5>
                  <p>Our HR team will review your application and contact you soon via whatsapp</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Payment & Activation</h5>
                  <p>Complete the payment of ₹299 to activate your account</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Start Learning</h5>
                  <p>Access your dashboard and begin your internship</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 