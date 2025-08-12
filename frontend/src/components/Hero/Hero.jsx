import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { useNavigate } from 'react-router-dom'
import './Hero.css'
import { publicAPI } from '../../services/apiService'

export default function Hero() {
  const navigate = useNavigate()
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false)
  const [registrationPopupMsg, setRegistrationPopupMsg] = useState('')
  const [registrationPopupLoading, setRegistrationPopupLoading] = useState(false)
  const [showInfoPopup, setShowInfoPopup] = useState(false)



  const handleJoinUsClick = () => {
    window.open('https://wa.me/918897140410?text=Hey%20I%20would%20like%20to%20know%20more%20about%20your%20services', '_blank')
  }

  return (
    <section id="hero" className="hero-section">
      {/* Particle Background */}
      {/* Temporarily disabled due to version compatibility issues */}
      {/*
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 60,
          particles: {
            number: {
              value: 50,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#ff2d75", "#00f9ff", "#7b2dff"]
            },
            shape: {
              type: "circle"
            },
            opacity: {
              value: 0.5,
              random: false
            },
            size: {
              value: 3,
              random: true
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "repulse"
              },
              onclick: {
                enable: true,
                mode: "push"
              }
            }
          },
          retina_detect: true
        }}
      />
      */}
      
      {/* Elegant Background Animations */}
      <div className="elegant-particles">
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
        <div className="elegant-particle"></div>
      </div>

      {/* Elegant Decorative Elements */}
      <div className="elegant-decorations">
        <div className="elegant-line"></div>
        <div className="elegant-line"></div>
        <div className="elegant-line"></div>
        <div className="elegant-dot"></div>
        <div className="elegant-dot"></div>
        <div className="elegant-dot"></div>
      </div>

      {/* 3D Elegant Orb */}
      <div className="elegant-orb">
        <div className="orb-core"></div>
        <div className="orb-ring orb-ring-1"></div>
        <div className="orb-ring orb-ring-2"></div>
        <div className="orb-ring orb-ring-3"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* ProX AI Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-title-pro"
        >
          <span className="hero-line prox-ai">ProX AI</span>
        </motion.h1>
        
        {/* Clear Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-subtitle-pro"
        >
          by Vedarc Technologies
        </motion.p>
        
        {/* Problem Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-description-pro"
        >
          The comprehensive AI suite platform with 30+ specialized agents for business, 
          education, personal productivity, development, and more.
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="cta-group"
        >
          <button 
            onClick={() => setShowInfoPopup(true)}
            className="cta-primary"
          >
            Want to know more?
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="chevron" />
        <div className="chevron" />
        <div className="chevron" />
      </motion.div>

      {/* Compelling Info Popup */}
      <AnimatePresence>
        {showInfoPopup && (
          <motion.div
            className="info-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfoPopup(false)}
          >
            <motion.div
              className="info-popup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="popup-close"
                onClick={() => setShowInfoPopup(false)}
              >
                ×
              </button>
              
              <div className="popup-content">
                <h2>Who is ProX AI for?</h2>
                
                <div className="popup-sections">
                  <motion.div 
                    className="popup-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3>Business Owners & Entrepreneurs</h3>
                    <p>
                      Customer support drowning your team? <strong>ProX AI</strong> AI Receptionists handle 24/7 queries while your Sales Assistants never miss a follow-up. Business Analytics AI predicts your next revenue opportunity before competitors see it.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="popup-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3>Students & Educators</h3>
                    <p>
                      Assignment deadlines overwhelming you? <strong>ProX AI</strong> Study Planners create personalized learning paths while Doubt Solvers explain complex concepts instantly. Exam Prep AI generates custom practice tests that adapt to your weak areas.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="popup-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3>Professionals & Teams</h3>
                    <p>
                      Email inbox chaos killing productivity? <strong>ProX AI</strong> Daily Schedulers sync with your calendar while Smart Reminders understand context. Productivity AI helps you focus on high-impact work instead of administrative tasks.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="popup-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3>Developers & Tech Teams</h3>
                    <p>
                      Debugging eating your development time? <strong>ProX AI</strong> Code Helper AI explains complex algorithms while Bug Detection spots issues before they reach production. Documentation Generators create comprehensive docs in minutes, not hours.
                    </p>
                  </motion.div>
                </div>

                <motion.div 
                  className="popup-cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <p className="popup-highlight">
                    <strong>30+ Specialized AI Agents</strong> working together to transform your productivity
                  </p>
                  <p className="popup-subtitle">
                    Many more domains. Many more solutions.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}