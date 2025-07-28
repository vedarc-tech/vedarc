import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import UnifiedLogin from './components/UnifiedLogin/UnifiedLogin'
import TermsAndConditions from './components/TermsAndConditions/TermsAndCondition'
import RefundAndCancellationPolicy from './components/RefundAndCancellationPolicy/RefundAndCancellationPolicy'
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy'
import NotFound from './components/NotFound/NotFound'
import './index.css'
import { useState } from 'react'
import ScrollToTop from './components/ScrollToTop'

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home/Home'))
const UseCases = lazy(() => import('./pages/UseCases/UseCases'))
const Investors = lazy(() => import('./pages/Investors/Investors'))
const Team = lazy(() => import('./pages/Team/Team'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const InternshipRegistration = lazy(() => import('./components/InternshipRegistration/InternshipRegistration'))
const AIInternshipApplication = lazy(() => import('./components/AIInternshipApplication/AIInternshipApplication'))
const HRDashboard = lazy(() => import('./components/HRDashboard/HRDashboard'))
const StudentDashboard = lazy(() => import('./components/StudentDashboard/StudentDashboard'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard/AdminDashboard'))
const InternshipManagerDashboard = lazy(() => import('./components/InternshipManagerDashboard/InternshipManagerDashboard'))
const TermsConditions = lazy(() => import('./pages/TermsConditions/TermsConditions'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy/RefundPolicy'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage/PrivacyPolicyPage'))

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--bg-dark)',
    color: 'var(--primary-gold)',
    fontSize: '1.2rem',
    fontFamily: 'Inter, sans-serif'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-light)',
        borderTop: '3px solid var(--primary-gold)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p>Loading...</p>
    </div>
  </div>
)

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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Main Home Route */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home 
                  setShowTerms={setShowTerms} 
                  setShowRefund={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                  showTerms={showTerms}
                  showRefund={showRefund}
                  showPrivacyPolicy={showPrivacyPolicy}
                />
              </>
            } />
            
            {/* Use Cases Route */}
            <Route path="/use-cases" element={
              <>
                <Navbar />
                <UseCases />
                <Footer 
                  setShowTerms={setShowTerms}
                  setShowRefundAndCancellationPolicy={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                />
              </>
            } />
            
            {/* Investors Route */}
            <Route path="/investors" element={
              <>
                <Navbar />
                <Investors />
                <Footer 
                  setShowTerms={setShowTerms}
                  setShowRefundAndCancellationPolicy={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                />
              </>
            } />
            
            {/* Team Route */}
            <Route path="/team" element={
              <>
                <Navbar />
                <Team />
                <Footer 
                  setShowTerms={setShowTerms}
                  setShowRefundAndCancellationPolicy={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                />
              </>
            } />
            
            {/* Contact Route */}
            <Route path="/contact" element={
              <>
                <Navbar />
                <Contact />
                <Footer 
                  setShowTerms={setShowTerms}
                  setShowRefundAndCancellationPolicy={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
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
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                />
              </>
            } />
            
            {/* AI Internship Application Route */}
            <Route path="/airole-apply" element={
              <>
                <Navbar />
                <AIInternshipApplication />
                <Footer 
                  setShowTerms={setShowTerms}
                  setShowRefundAndCancellationPolicy={setShowRefund}
                  setShowPrivacyPolicy={setShowPrivacyPolicy}
                />
              </>
            } />
            
            {/* Dashboard Routes */}
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/internship-manager-dashboard" element={<InternshipManagerDashboard />} />
            
            {/* Login Route */}
            <Route path="/unified-login" element={<UnifiedLogin />} />
            
            {/* Policy Routes */}
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        {/* Modal Components */}
        <AnimatePresence>
          {showTerms && (
            <TermsAndConditions 
              onClose={() => setShowTerms(false)} 
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showRefund && (
            <RefundAndCancellationPolicy 
              onClose={() => setShowRefund(false)} 
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showPrivacyPolicy && (
            <PrivacyPolicy 
              onClose={() => setShowPrivacyPolicy(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  )
}