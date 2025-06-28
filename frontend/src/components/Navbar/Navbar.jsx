import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import { RiArrowLeftRightLine } from 'react-icons/ri'
import logo from "./../../assets/LOGO VEDARC.png";
import './Navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('home')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50)
  })

  const navLinks = [
    { name: 'Home', to: 'hero' },
    { name: 'About', to: 'about' },
    { name: 'Projects', to: 'projects' },
    { name: 'Contact', to: 'contact' }
  ]

  const handleSetActive = (to) => {
    setActiveLink(to)
  }

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.6, 0.05, -0.01, 0.9] }}
    >
      {/* Animated Tech Border */}
      <div className="tech-border"></div>

      <div className="navbar-container">
        {/* Logo with Glitch Effect */}
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="hero" 
            smooth={true}
            onSetActive={() => handleSetActive('hero')}
          >
            <span id='logo-container'>
            <span className="glitch" data-text=""> <img src={logo} alt="" /> VEDARC</span>
            </span>
          </Link>
          {/* <RiArrowLeftRightLine className="connection-icon" /> */}
        </motion.div>

        {/* Desktop Menu */}
        <ul className="nav-menu">
          {navLinks.map((link) => (
            <motion.li 
              key={link.to}
              whileHover={{ 
                y: -3,
                transition: { type: 'spring', stiffness: 300 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={link.to}
                smooth={true}
                duration={500}
                spy={true}
                onSetActive={() => handleSetActive(link.to)}
                className={activeLink === link.to ? 'active-link' : ''}
              >
                {link.name}
                <div className="link-underline"></div>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
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
      </div>

      {/* Mobile Menu */}
      {isOpen && (
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
                transition={{ 
                  duration: 0.3,
                  delay: 0.1 * navLinks.indexOf(link)
                }}
                onClick={() => setIsOpen(false)}
              >
                <Link
                  to={link.to}
                  smooth={true}
                  duration={500}
                  spy={true}
                  onSetActive={() => handleSetActive(link.to)}
                  className={activeLink === link.to ? 'active-link' : ''}
                >
                  {link.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.nav>
  )
}