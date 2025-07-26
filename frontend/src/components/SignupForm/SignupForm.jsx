import { useState } from 'react'
import { motion } from 'framer-motion'
import { publicAPI } from '../../services/apiService'
import './SignupForm.css'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
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
      const response = await publicAPI.subscribeToWaitlist(formData)
      
      if (response.error) {
        setError(response.error)
      } else {
        setIsSubmitted(true)
        setFormData({ name: '', email: '' })
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
      console.error('Waitlist subscription error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="signup-form" className="signup-section">
      <div className="signup-container">
        <motion.div
          className="signup-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="signup-title">Join Our Waitlist</h2>
          <p className="signup-subtitle">
            Be the first to experience VEDARC AI Suite when we launch
          </p>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          {!isSubmitted ? (
            <motion.form 
              className="signup-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 249, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Joining...' : 'Join Waitlist'}
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
              <h3>Thank you! You're on the list.</h3>
              <p>We'll notify you when we launch.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
} 