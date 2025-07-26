import { motion } from 'framer-motion'
import './GlobalBanner.css'

export default function GlobalBanner() {
  const scrollToSignup = () => {
    const signupForm = document.getElementById('signup-form')
    if (signupForm) {
      signupForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.div 
      className="global-banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="banner-content">
        <div className="banner-text">
          🚀 VEDARC AI Suite is launching soon! Join our waitlist for early access.
        </div>
        <motion.button
          className="banner-cta"
          onClick={scrollToSignup}
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 249, 255, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Join Waitlist
        </motion.button>
      </div>
    </motion.div>
  )
} 