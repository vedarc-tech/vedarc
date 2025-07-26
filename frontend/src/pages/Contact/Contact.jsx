import { useState } from 'react'
import { motion } from 'framer-motion'
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
      setError('Failed to submit form. Please try again.')
      console.error('Contact form error:', err)
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
    },
    {
      icon: '📱',
      title: 'WhatsApp',
      details: '+91 8897140410',
      description: 'Quick responses and instant support',
      action: 'https://wa.me/918897140410?text=Hello%20VEDARC%20Team!%20I%20am%20interested%20in%20learning%20more%20about%20VEDARC%20AI%20Suite.%20Can%20you%20help%20me%20with%20more%20information?'
    }
  ]

  const officeLocations = [
    {
      city: 'Hyderabad',
      address: 'Hyderabad, Telangana, India',
      type: 'Headquarters'
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
            Ready to transform your business with AI? Let's discuss how VEDARC AI Suite can help you achieve your goals.
          </p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Methods */}
          <motion.div
            className="contact-methods"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="section-title">Contact Methods</h2>
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
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
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

          {/* Contact Form */}
          <motion.div
            className="contact-form-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="section-title">Send Us a Message</h2>
            
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
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 249, 255, 0.4)" }}
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

          {/* Office Locations */}
          <motion.div
            className="office-locations"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="section-title">Our Offices</h2>
            <div className="locations-grid">
              {officeLocations.map((location, index) => (
                <motion.div
                  key={index}
                  className="location-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <div className="location-type">{location.type}</div>
                  <h3 className="location-city">{location.city}</h3>
                  <p className="location-address">{location.address}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="additional-info"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="info-card">
              <h3>Response Time</h3>
              <p>We typically respond to all inquiries within 24 hours during business days.</p>
            </div>
            
            <div className="info-card">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
            </div>
            
            <div className="info-card">
              <h3>Follow Us</h3>
                          <div className="social-links">
              <a href="https://www.linkedin.com/company/vedarc-technologies-private-limited" target="_blank" rel="noopener noreferrer" className="social-link">
                LinkedIn
              </a>
              <a href="https://www.instagram.com/vedarc.tech?igsh=bmYxcTZuZndncHB1&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-link">
                Instagram
              </a>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 