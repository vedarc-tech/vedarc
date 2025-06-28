import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home/Home'
import InternshipRegistration from './components/InternshipRegistration/InternshipRegistration'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HRDashboard from './components/HRDashboard/HRDashboard'
import StudentDashboard from './components/StudentDashboard/StudentDashboard'
import AdminDashboard from './components/AdminDashboard/AdminDashboard'
import InternshipManagerDashboard from './components/InternshipManagerDashboard/InternshipManagerDashboard'
import UnifiedLogin from './components/UnifiedLogin/UnifiedLogin'
import TermsAndConditions from './components/TermsAndConditions/TermsAndCondition'
import RefundAndCancellationPolicy from './components/RefundAndCancellationPolicy/RefundAndCancellationPolicy'
import './index.css' // Using only index.css for global styles
import { useState } from 'react'

// Page transition animation
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

export default function App() {
  const [showTerms, setShowTerms] = useState(false)
  const [showRefund, setShowRefund] = useState(false)

  console.log('App component rendered')

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Home Route */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home 
                setShowTerms={setShowTerms} 
                setShowRefund={setShowRefund}
                showTerms={showTerms}
                showRefund={showRefund}
              />
            </>
          } />
          
          {/* Internship Registration Route */}
          <Route path="/internship-registration" element={
            <>
              <Navbar />
              <InternshipRegistration />
              <Footer 
                setShowTerms={setShowTerms}
                setShowRefundAndCancellationPolicy={setShowRefund}
              />
              <TermsAndConditions
                isVisible={showTerms}
                onClose={() => setShowTerms(false)}
              />
              <RefundAndCancellationPolicy
                isVisible={showRefund}
                onClose={() => setShowRefund(false)}
              />
            </>
          } />
          
          {/* Dashboard Routes */}
          <Route path="/hr-dashboard" element={<HRDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/internship-manager-dashboard" element={<InternshipManagerDashboard />} />
          <Route path="/unified-login" element={<UnifiedLogin />} />
          
          {/* Test Route */}
          <Route path="/test" element={<div style={{padding: '100px', color: 'white'}}>Test Route Working!</div>} />
        </Routes>
      </div>
    </Router>
  )
}