import { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import Hero from '../../components/Hero/Hero'
import SignupForm from '../../components/SignupForm/SignupForm'
import Roadmap from '../../components/Roadmap/Roadmap'
import CaseStudies from '../../components/CaseStudies/CaseStudies'
import FAQ from '../../components/FAQ/FAQ'
import TermsAndConditions from '../../components/TermsAndConditions/TermsAndCondition';
import RefundAndCancellationPolicy from '../../components/RefundAndCancellationPolicy/RefundAndCancellationPolicy.jsx';
import PrivacyPolicy from '../../components/PrivacyPolicy/PrivacyPolicy.jsx';
import Footer from '../../components/Footer/Footer.jsx'

import './Home.css'

export default function Home({ setShowTerms, setShowRefund, setShowPrivacyPolicy, showTerms, showRefund, showPrivacyPolicy }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end']
  })

  return (
    <motion.main 
      className="home-container"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Scroll progress indicator (tech-style) */}
      <motion.div 
        className="scroll-progress" 
        style={{ scaleX: scrollYProgress, zIndex: 1000 }}
      />

      {/* Sections */}
      <section id="hero">
        <Hero />
      </section>

      <section id="signup-form">
        <SignupForm />
      </section>

      <section id="roadmap">
        <Roadmap />
      </section>

      <section id="case-studies">
        <CaseStudies />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <section id="footer">
        <Footer 
        setShowTerms={setShowTerms}
        setShowRefundAndCancellationPolicy={setShowRefund}
        setShowPrivacyPolicy={setShowPrivacyPolicy}
        />
      </section>

      <TermsAndConditions
        isVisible={showTerms}
        onClose={() => setShowTerms(false)}
      />

      <RefundAndCancellationPolicy
        isVisible={showRefund}
        onClose={() => setShowRefund(false)}
      />

      <PrivacyPolicy
        isVisible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      {/* Tech-style decorative elements */}
      <div className="grid-overlay" aria-hidden="true" />
      <div className="corner-lights" aria-hidden="true" />
    </motion.main>
  )
}