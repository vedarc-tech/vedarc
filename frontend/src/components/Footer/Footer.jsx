import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { FaInstagram } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Footer.css'
import { useEffect, useState } from 'react'
import { publicAPI } from '../../services/apiService'

function scrollToSection(sectionId) {
  setTimeout(() => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100) // Wait for navigation
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    publicAPI.getSystemSettings()
      .then(res => {
        setRegistrationEnabled(res.internship_registration_enabled)
      })
      .catch(() => setRegistrationEnabled(true)) // Default to true if error
  }, [])

  const handleFooterNav = (section) => {
    if (location.pathname !== '/') {
      navigate('/')
      scrollToSection(section)
    } else {
      scrollToSection(section)
    }
  }

  return (
    <footer className="footer">
      {/* Circuit Board Top Border */}
      <div className="circuit-border">
        <svg viewBox="0 0 1200 20" preserveAspectRatio="none">
          <path 
            d="M0,10 Q300,20 600,10 T1200,10" 
            stroke="var(--neon-purple)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="10 5"
          />
        </svg>
      </div>

      <div className="footer-container">
        {/* Company Info */}
        <motion.div 
          className="footer-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="footer-heading">
            <span className="highlight">VEDARC</span> TECHNOLOGIES
          </h3>
          <p className="footer-text">
            Building the future with cutting-edge technology solutions and innovative digital experiences.
          </p>
          <div className="social-links">
            <motion.a 
              href="https://www.linkedin.com/company/vedarc-technologies-private-limited" 
              target="_blank"
              whileHover={{ y: -3, color: 'var(--neon-cyan)' }}
            >
              <FaLinkedin />
            </motion.a>
            <motion.a
              href="https://www.instagram.com/vedarc.tech?igsh=bmYxcTZuZndncHB1&utm_source=qr"
              target="_blank"
              whileHover={{ y: -3, color: '#E1306C' }}
              style={{ marginLeft: '8px' }}
            >
              <FaInstagram />
            </motion.a>
          </div>

        <br />
        <br />
        <br />

                {/* Contact Info */}
        <motion.div 
          className="footer-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="footer-heading">CONTACT US</h3>
          <ul className="contact-info">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <span>
                Flat No 102, Moon Rock, Placido,<br />
                Sri Ram Nagar, Manikonda,<br />
                Hyderabad, Telangana – 500089
              </span>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a>
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" />
              <a href="tel:+918897140410">+91 8897140410</a>
            </li>
          </ul>
        </motion.div>

        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className="footer-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="footer-heading">QUICK LINKS</h3>
          <ul className="footer-links">
            <li>
              <motion.a 
                href="#about"
                whileHover={{ x: 5, color: 'var(--neon-cyan)' }}
                onClick={e => { e.preventDefault(); handleFooterNav('about'); }}
              >
                About Us
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#projects"
                whileHover={{ x: 5, color: 'var(--neon-cyan)' }}
                onClick={e => { e.preventDefault(); handleFooterNav('projects'); }}
              >
                Our Projects
              </motion.a>
            </li>
            {registrationEnabled && (
              <li>
                <motion.div whileHover={{ x: 5, color: 'var(--neon-cyan)' }}>
                  <Link 
                    to="/internship-registration"
                    className="footer-link"
                    onClick={() => console.log('Internship Registration clicked')}
                  >
                    Internship Registration
                  </Link>
                </motion.div>
              </li>
            )}
            <li>
              <motion.div whileHover={{ x: 5, color: 'var(--neon-cyan)' }}>
                <Link 
                  to="/airole-apply"
                  className="footer-link"
                  onClick={() => console.log('AI Engineer Application clicked')}
                >
                  AI Engineer Application
                </Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ x: 5, color: 'var(--neon-cyan)' }}>
                <Link 
                  to="/unified-login"
                  className="footer-link"
                  onClick={() => console.log('Internship Login clicked')}
                >
                  Internship Login
                </Link>
              </motion.div>
            </li>
            <li>
              <motion.a 
                href="#contact"
                whileHover={{ x: 5, color: 'var(--neon-cyan)' }}
                onClick={e => { e.preventDefault(); handleFooterNav('contact'); }}
              >
                Contact
              </motion.a>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <a href="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
        <span> | </span>
        <a href="/refund-policy" target="_blank" rel="noopener noreferrer">Refund and Cancellation Policy</a>
        <span> | </span>
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <div className="circuit-line"></div>
        <div className="footer-links">
          <p>
            &copy; {currentYear} VEDARC TECHNOLOGIES PRIVATE LIMITED. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}