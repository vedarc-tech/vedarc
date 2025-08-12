import { motion } from 'framer-motion'
import './Recognition.css'

export default function Recognition() {
  const recognitions = [
    {
      name: 'Startup India',
      description: 'Recognized by Government of India',
      delay: 0.1
    },
    {
      name: 'AICTE',
      description: 'All India Council for Technical Education',
      delay: 0.2
    }
  ]

  return (
    <section id="recognition" className="recognition-section">
      {/* Background Elements */}
      <div className="recognition-bg">
        <div className="recognition-overlay"></div>
        <div className="recognition-particles">
          <div className="recognition-particle"></div>
          <div className="recognition-particle"></div>
          <div className="recognition-particle"></div>
        </div>
      </div>

      <div className="recognition-container">
        <motion.div
          className="recognition-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <h2 className="recognition-title">
            <span className="title-line">Recognized</span>
            <span className="title-line">By</span>
          </h2>
          <p className="recognition-subtitle">
            Trusted by leading government institutions
          </p>
        </motion.div>

        <div className="recognition-horizontal">
          {recognitions.map((recognition, index) => (
            <motion.div
              key={recognition.name}
              className="recognition-item"
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: recognition.delay,
                ease: 'easeOut'
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="recognition-icon">
                <div className="icon-glow"></div>
              </div>
              
              <div className="recognition-content">
                <h3 className="recognition-name">{recognition.name}</h3>
                <p className="recognition-description">{recognition.description}</p>
              </div>

              <div className="recognition-border">
                <div className="border-line"></div>
                <div className="border-corner top-left"></div>
                <div className="border-corner top-right"></div>
                <div className="border-corner bottom-left"></div>
                <div className="border-corner bottom-right"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="recognition-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="recognition-trust">
            Building the future with government-backed innovation and excellence
          </p>
        </motion.div>
      </div>
    </section>
  )
} 