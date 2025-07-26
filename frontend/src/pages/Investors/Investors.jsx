import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { publicAPI } from '../../services/apiService'
import './Investors.css'

export default function Investors() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    investorType: '',
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
      const response = await publicAPI.submitInvestorInquiry(formData)
      
      if (response.error) {
        setError(response.error)
      } else {
        setIsSubmitted(true)
        setFormData({
          fullName: '',
          email: '',
          company: '',
          investorType: '',
          message: ''
        })
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.')
      console.error('Investor inquiry error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const investmentHighlights = [
    'Unified AI agent ecosystem with 20+ specialized agents',
    'Subscription-based revenue model with multiple tiers',
    'Targeting $50B+ AI market with proven use cases',
    'Strategic partnerships with educational institutions',
    'Launching soon with beta access for early adopters',
    'AI agent marketplace potential for future expansion'
  ]

  return (
    <div className="investors-page">
      {/* Hero Section */}
      <section className="investors-hero">
        <div className="hero-background">
          <div className="ai-particles"></div>
          <div className="ai-particles"></div>
          <div className="ai-particles"></div>
        </div>
        
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Partner With Us to Build the Future of AI-Powered Innovation
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            VEDARC AI Suite is a unified AI agent ecosystem poised to revolutionize how businesses, educational institutions, and researchers leverage artificial intelligence. We're seeking strategic investors to accelerate our mission.
          </motion.p>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="why-invest-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Why Invest in Vedarc?</h2>
          </motion.div>

          <div className="highlights-grid">
            {investmentHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="highlight-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="highlight-icon">✓</div>
                <p className="highlight-text">{highlight}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="founder-quote"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/team" className="quote-link">
              <blockquote>
                "We're building more than just another AI platform. We're creating a comprehensive ecosystem that will democratize AI access for businesses of all sizes. Our vision is to make intelligent automation accessible, affordable, and impactful."
              </blockquote>
              <cite>- VEDARC Technologies Private Limited</cite>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How to Engage Section */}
      <section className="engage-section">
        <div className="container">
          <motion.div
            className="engage-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="engage-title">Interested in Learning More?</h2>
            <p className="engage-subtitle">
              We'd love to share our pitch deck, roadmap, and growth story — but only after getting to know you. Please fill out the form below, and we'll personally get in touch.
            </p>
            <p className="pitch-note">Pitch materials available upon request.</p>
          </motion.div>

          <motion.div
            className="contact-form-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {!isSubmitted ? (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
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
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="investorType">Type of Investor *</label>
                    <select
                      id="investorType"
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="angel">Angel Investor</option>
                      <option value="vc">Venture Capital</option>
                      <option value="strategic">Strategic Investor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Tell us about your investment interests and how we might collaborate..."
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 249, 255, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            ) : (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="success-icon">✓</div>
                <h3>Thank you for your interest!</h3>
                <p>We've received your message and will get back to you within 24 hours.</p>
                <p className="contact-info">
                  You can also reach us directly at: <a href="mailto:vedarc.tech@gmail.com">vedarc.tech@gmail.com</a>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
} 