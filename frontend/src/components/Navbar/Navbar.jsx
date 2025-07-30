import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from "./../../assets/LOGO VEDARC.png";
import './Navbar.css'

function scrollToSection(sectionId) {
  setTimeout(() => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('home')
  const [isLogoOnly, setIsLogoOnly] = useState(false)
  const lastScrollY = useRef(window.scrollY)
  const ticking = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { name: 'Home', to: 'hero' },
    { name: 'Recognition', to: 'recognition' },
    { name: 'Roadmap', to: 'roadmap' },
    { name: 'Case Studies', to: 'case-studies' },
    { name: 'Testimonials', to: 'testimonials' },
    { name: 'FAQ', to: 'faq' },
    { name: 'Investors', to: '/investors' },
    { name: 'Team', to: '/team' },
    { name: 'Contact', to: '/contact' }
  ]

  const handleNavClick = (section) => {
    setActiveLink(section)
    if (section.startsWith('/')) {
      // External route
      navigate(section)
    } else if (location.pathname !== '/') {
      navigate('/')
      scrollToSection(section)
    } else {
      scrollToSection(section)
    }
    setIsOpen(false)
  }

  // Show only logo when scrolling down, show full navbar when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setIsLogoOnly(true) // scrolling down
          } else {
            setIsLogoOnly(false) // scrolling up
          }
          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      className={`navbar${isLogoOnly ? ' logo-only' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.6, 0.05, -0.01, 0.9] }}
    >
      {/* Elegant Border */}
      <div className="elegant-border"></div>
      <div className="navbar-container">
        {/* Logo with Elegant Styling */}
        <motion.div 
          className={`logo${isLogoOnly ? ' logo-center' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button 
            onClick={() => handleNavClick('hero')} 
            className="logo-btn"
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <span id='logo-container'>
              <span className="elegant-logo">
                <img src={logo} alt="Vedarc Technologies" />
              </span>
              <span className="brand-text">AgentX</span>
            </span>
          </button>
        </motion.div>
        <AnimatePresence>
          {!isLogoOnly && (
            <motion.ul 
              className="nav-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          {navLinks.map((link) => (
            <motion.li 
              key={link.to}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300 } }}
              whileTap={{ scale: 0.95 }}
            >
                  <button
                    onClick={() => handleNavClick(link.to)}
                    className={activeLink === link.to ? 'active-link nav-btn' : 'nav-btn'}
                    style={{ background: 'none', border: 'none', padding: '0 18px', cursor: 'pointer' }}
              >
                {link.name}
                <div className="link-underline"></div>
                  </button>
            </motion.li>
          ))}
            </motion.ul>
          )}
        </AnimatePresence>
        
        {/* Right spacer for balance */}
        {!isLogoOnly && (
          <div className="nav-spacer" style={{ width: '200px', flexShrink: 0 }}></div>
        )}
        {/* Mobile Menu Button (hidden in logo-only mode) */}
        {!isLogoOnly && (
        <motion.div 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? (
            <FaTimes className="menu-icon" />
          ) : (
            <FaBars className="menu-icon" />
          )}
        </motion.div>
        )}
      </div>
      {/* Mobile Menu */}
      {!isLogoOnly && isOpen && (
        <motion.div 
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mobile-menu-bg"></div>
          <ul className="mobile-nav-menu">
            {navLinks.map((link) => (
              <motion.li 
                key={link.to}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * navLinks.indexOf(link) }}
                onClick={() => setIsOpen(false)}
              >
                <button
                  onClick={() => handleNavClick(link.to)}
                  className={activeLink === link.to ? 'active-link nav-btn' : 'nav-btn'}
                  style={{ background: 'none', border: 'none', padding: '0 16px', cursor: 'pointer' }}
                >
                  {link.name}
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.nav>
  )
}