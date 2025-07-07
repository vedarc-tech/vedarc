import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { useNavigate } from 'react-router-dom'
import './Hero.css'
import { publicAPI } from '../../services/apiService'

export default function Hero() {
  const neonBeam = useRef(null)
  const navigate = useNavigate()
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false)
  const [registrationPopupMsg, setRegistrationPopupMsg] = useState('')
  const [registrationPopupLoading, setRegistrationPopupLoading] = useState(false)

  const handleHover = (e) => {
    const x = e.clientX / window.innerWidth * 100
    const y = e.clientY / window.innerHeight * 100
    neonBeam.current.style.background = `radial-gradient(circle at ${x}% ${y}%, 
      rgba(255, 45, 117, 0.3), transparent 70%)`
  }

  const handleJoinUsClick = async () => {
    setRegistrationPopupLoading(true)
    try {
      const res = await publicAPI.getSystemSettings()
      if (res.internship_registration_enabled) {
        navigate('/internship-registration')
      } else {
        setRegistrationPopupMsg(
          <>
            Registrations are currently closed. Please check back later or contact support for more information.<br />
            <a href="https://wa.me/918897140410?text=Hey%20I%20want%20to%20enroll%20in%20your%20Learning%20cum%20Project%20based%20internship" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', fontWeight: 700, fontSize: 20, textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>+91 8897140410</a>
          </>
        )
        setShowRegistrationPopup(true)
      }
    } catch {
      setRegistrationPopupMsg('Unable to check registration status. Please try again later.')
      setShowRegistrationPopup(true)
    } finally {
      setRegistrationPopupLoading(false)
    }
  }

  return (
    <section id="hero" className="hero-section" onMouseMove={handleHover}>
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
      
      {/* CSS-based particle effect as temporary replacement */}
      <div className="css-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Hover Light Beam */}
      <div className="neon-beam" ref={neonBeam} hidden/>

      {/* 3D Floating Tech Orb */}
      <div className="tech-orb" hidden>
        <div className="orb-core" />
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* Glitch Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glitch-main"
        >
          <span className="glitch-line">VEDARC</span>
          <span className="glitch-line no-break">TECHNOLOGIES</span>
        </motion.h1>

        {/* Typing Subheading */}
        <TypeAnimation
          sequence={[
            'Web Development',
            2000,
            'AI & Machine Learning',
            2000,
            'Full Stack Solutions',
            2000,
            'Sustainable Tech Solutions',
            2000,
          ]}
          wrapper="h3"
          speed={50}
          repeat={Infinity}
          className="type-subtitle"
        />

        {/* CTA Buttons */}
        <div className="cta-group">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px var(--neon-magenta)" }}
            whileTap={{ scale: 0.95 }}
            className="cta-primary"
            onClick={handleJoinUsClick}
            disabled={registrationPopupLoading}
            style={{ opacity: registrationPopupLoading ? 0.6 : 1, cursor: registrationPopupLoading ? 'not-allowed' : 'pointer' }}
          >
            Join Us
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px var(--neon-cyan)" }}
            whileTap={{ scale: 0.95 }}
            className="cta-secondary"
            onClick={() => {
              const el = document.getElementById('projects');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Projects
          </motion.button>
        </div>
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

      {showRegistrationPopup && (
        <div className="hr-popup-overlay" style={{ zIndex: 9999 }}>
          <div className="hr-popup-modal" style={{ background: '#18192a', borderRadius: 18, color: 'var(--neon-cyan)', boxShadow: '0 0 40px var(--neon-magenta)', border: '2px solid var(--neon-cyan)' }}>
            <h2 className="glitch-title" style={{ color: 'var(--neon-cyan)', fontSize: 36, marginBottom: 16, marginTop: 8, textAlign: 'center', letterSpacing: 2 }}>REGISTRATION UNAVAILABLE</h2>
            <div style={{ color: '#fff', fontWeight: 400, fontSize: 18, marginBottom: 18, textAlign: 'center' }}>{registrationPopupMsg}</div>
            <button onClick={() => setShowRegistrationPopup(false)} style={{ background: 'var(--neon-cyan)', color: '#18192a', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, margin: '0 auto', display: 'block', boxShadow: '0 0 10px var(--neon-cyan)' }}>Close</button>
          </div>
        </div>
      )}
    </section>
  )
}