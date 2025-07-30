import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaInstagram } from 'react-icons/fa'
import { publicAPI } from '../../services/apiService'
import './Contact.css'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await publicAPI.submitContactForm(formData)
      
      if (response.error) {
        setError(response.error)
      } else {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', company: '', subject: '', message: '' })
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (err) {
      console.error('Contact form error:', err)
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (err.status === 400) {
        setError(err.message || 'Please check your input and try again.')
      } else {
        setError('Failed to submit form. Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      details: 'tech@vedarc.co.in',
      description: 'For all inquiries and support',
      action: 'mailto:tech@vedarc.co.in?subject=VEDARC AI Suite Inquiry&body=Hello VEDARC Team,%0D%0A%0D%0AI am interested in learning more about VEDARC AI Suite.%0D%0A%0D%0ABest regards,'
    }
  ]

  return (
    <section className="contact-section">
      <div className="contact-container">
        {/* Header */}
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">
            Ready to transform your business with AI? Let's discuss how our AgentX - VEDARC AI Suite can help you achieve your goals.
          </p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Form */}
          <motion.div
            className="contact-form-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="section-title">Send Us a Message</h2>
            
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="error-icon">⚠</div>
                <p>{error}</p>
              </motion.div>
            )}
            
            {!isSubmitted ? (
              <motion.form 
                className="contact-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company/Organization</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="investment">Investment Discussion</option>
                      <option value="beta-access">Beta Access Request</option>
                      <option value="support">Technical Support</option>
                      <option value="demo">Request Demo</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="form-textarea"
                    placeholder="Tell us about your needs and how we can help..."
                  />
                </div>
                
                <motion.button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="success-icon">✓</div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            className="contact-methods"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="section-title">Email Us</h2>
            <div className="methods-grid">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={index}
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="method-card clickable"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="method-icon">{method.icon}</div>
                  <h3 className="method-title">{method.title}</h3>
                  <p className="method-details">{method.details}</p>
                  <p className="method-description">{method.description}</p>
                  <div className="click-indicator">Click to contact →</div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="social-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="section-title">Follow Us</h2>
            <div className="social-links">
              <motion.a 
                href="https://www.linkedin.com/company/vedarc-technologies-private-limited" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link linkedin"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLinkedin className="social-icon" />
                <span>LinkedIn</span>
              </motion.a>
              <motion.a 
                href="https://www.instagram.com/vedarc.tech?igsh=bmYxcTZuZndncHB1&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaInstagram className="social-icon" />
                <span>Instagram</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 