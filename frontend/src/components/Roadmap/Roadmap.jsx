import { motion } from 'framer-motion'
import './Roadmap.css'

export default function Roadmap() {
  const scrollToSignup = () => {
    const signupForm = document.getElementById('signup-form')
    if (signupForm) {
      signupForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const milestones = [
    {
      quarter: 'Phase 1',
      title: 'Beta Launch',
      description: 'Limited beta access for early adopters and partners'
    },
    {
      quarter: 'Phase 2',
      title: 'Public Release',
      description: 'Full platform launch with comprehensive AI agent suite'
    },
    {
      quarter: 'Phase 3',
      title: 'Agent Marketplace',
      description: 'Open marketplace for custom AI agents and integrations'
    }
  ]

  return (
    <section className="roadmap-section">
      <div className="roadmap-container">
        <motion.div
          className="roadmap-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="roadmap-title">What's Next</h2>
          <p className="roadmap-subtitle">
            Our journey to revolutionize AI-powered business solutions
          </p>
        </motion.div>

        <div className="timeline-container">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                <div className="marker-line"></div>
              </div>
              
              <div className="timeline-content">
                <div className="milestone-quarter">{milestone.quarter}</div>
                <h3 className="milestone-title">{milestone.title}</h3>
                <p className="milestone-description">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="roadmap-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            className="cta-button"
            onClick={scrollToSignup}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 249, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Join Waitlist
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
} 