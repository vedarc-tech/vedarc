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
        <div className="signup-content">
          <h2 className="signup-title">Join Our Waitlist</h2>
          <p className="signup-subtitle">
            Be the first to experience VEDARC AI Suite when we launch
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {!isSubmitted ? (
            <form className="signup-form" onSubmit={handleSubmit}>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Joining...' : 'Join Waitlist'}
              </motion.button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Thank you! You're on the list.</h3>
              <p>We'll notify you when we launch.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 