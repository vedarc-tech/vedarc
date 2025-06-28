import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaUser, FaLock, FaSignInAlt, FaSignOutAlt, FaGraduationCap, FaUserTie, FaUserShield, FaCrown } from 'react-icons/fa'
import { studentAPI, hrAPI, managerAPI, adminAPI, authService } from '../../services/apiService'
import './UnifiedLogin.css'

export default function UnifiedLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState('')
  const [userData, setUserData] = useState(null)

  // Check if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsLoggedIn(true)
      setUserType(authService.getUserType())
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const detectedType = authService.detectUserType(loginData.username)
    setUserType(detectedType)

    try {
      let response
      let apiMethod
      let payload = loginData

      switch (detectedType) {
        case 'student':
          apiMethod = studentAPI.login
          payload = { user_id: loginData.username, password: loginData.password }
          break
        case 'hr':
          apiMethod = hrAPI.login
          break
        case 'manager':
          apiMethod = managerAPI.login
          break
        case 'admin':
          apiMethod = adminAPI.login
          break
        default:
          throw new Error('Invalid user type')
      }

      response = await apiMethod(payload)
      
      // Set token, session ID, and user data
      authService.setToken(detectedType, response.access_token)
      if (response.session_id) {
        authService.setSessionId(response.session_id)
      }
      if (response.user) {
        setUserData(response.user)
      }
      setIsLoggedIn(true)
      
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggedIn(false)
      setUserData(null)
      setUserType('')
      setLoginData({ username: '', password: '' })
    }
  }

  const redirectToDashboard = () => {
    switch (userType) {
      case 'student':
        window.location.href = '/student-dashboard'
        break
      case 'hr':
        window.location.href = '/hr-dashboard'
        break
      case 'manager':
        window.location.href = '/internship-manager-dashboard'
        break
      case 'admin':
        window.location.href = '/admin-dashboard'
        break
    }
  }

  const getUserTypeInfo = () => {
    switch (userType) {
      case 'student':
        return {
          title: 'Student Dashboard',
          icon: <FaGraduationCap />,
          description: 'Access your internship progress and resources'
        }
      case 'hr':
        return {
          title: 'HR Dashboard',
          icon: <FaUserTie />,
          description: 'Manage pending internship registrations'
        }
      case 'manager':
        return {
          title: 'Manager Dashboard',
          icon: <FaUserShield />,
          description: 'Manage internships and review submissions'
        }
      case 'admin':
        return {
          title: 'Admin Dashboard',
          icon: <FaUserShield />,
          description: 'Super admin control panel'
        }
      default:
        return {
          title: 'Login',
          icon: <FaUser />,
          description: 'Access your dashboard'
        }
    }
  }

  if (!isLoggedIn) {
    return (
      <section id="unified-login" className="unified-login">
        <div className="login-bg">
          <div className="circuit-pattern"></div>
          <div className="neon-glow"></div>
        </div>

        <div className="login-container">
          <motion.div
            className="login-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="login-header">
              <h2 className="glitch-title" data-text="INTERNSHIP LOGIN">
                INTERNSHIP LOGIN
              </h2>
              <div className="title-underline"></div>
              <p>Access your dashboard with your credentials</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username / User ID</label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username or User ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && <div className="error-banner">{error}</div>}

              <motion.button
                type="submit"
                className="login-btn"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 25px var(--neon-magenta)" }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <>
                    <FaSignInAlt className="btn-icon" />
                    Login
                  </>
                )}
              </motion.button>
            </form>

            <div className="login-info">
              <h4>Login Credentials:</h4>
              <div className="credential-types">
                <div className="credential-type">
                  <FaGraduationCap className="type-icon" />
                  <span><strong>Students:</strong> Use your User ID (e.g., VEDARC-xxxxx)</span>
                </div>
              </div>
              
              <div className="registration-link">
                <p>New student? <Link to="/internship-registration">Register for Internship</Link></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="unified-login" className="unified-login">
      <div className="login-bg">
        <div className="circuit-pattern"></div>
        <div className="neon-glow"></div>
      </div>

      <div className="login-container">
        <motion.div
          className="logged-in-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="user-info">
            <div className="user-icon">
              {getUserTypeInfo().icon}
            </div>
            <h3>{getUserTypeInfo().title}</h3>
            <p>{getUserTypeInfo().description}</p>
            {userData && (
              <div className="user-details">
                <p><strong>Welcome:</strong> {userData.fullName || userData}</p>
                {userData.user_id && <p><strong>User ID:</strong> {userData.user_id}</p>}
              </div>
            )}
          </div>

          <div className="action-buttons">
            <motion.button
              className="dashboard-btn"
              onClick={redirectToDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCrown />
              Go to Dashboard
            </motion.button>
            
            <motion.button
              className="logout-btn"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt />
              Logout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 