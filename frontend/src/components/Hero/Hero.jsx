import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { useNavigate } from 'react-router-dom'
import './Hero.css'
import { publicAPI } from '../../services/apiService'

export default function Hero() {
  const navigate = useNavigate()
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false)
  const [registrationPopupMsg, setRegistrationPopupMsg] = useState('')
  const [registrationPopupLoading, setRegistrationPopupLoading] = useState(false)



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
      
      {/* Elegant particle effect */}
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

      {/* Elegant Overlay */}
      <div className="elegant-overlay"></div>

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
        <div className="orb-core" />
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* Professional Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-title-pro"
        >
          <span className="hero-line vedarc">VEDARC</span>
          <span className="hero-line ai-suite">AI SUITE</span>
        </motion.h1>
        <div className="coming-soon-pro">Coming Soon</div>
        {/* Removed problematic button */}
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
    </section>
  )
}