import { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import Hero from '../../components/Hero/Hero'
import About from '../../components/About/About'
import Projects from '../../components/Projects/Projects.jsx'
import TermsAndConditions from '../../components/TermsAndConditions/TermsAndCondition';
import RefundAndCancellationPolicy from '../../components/RefundAndCancellationPolicy/RefundAndCancellationPolicy.jsx';
import PrivacyPolicy from '../../components/PrivacyPolicy/PrivacyPolicy.jsx';
// import Contact from '../../components/Contact/Contact'
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

      <section id="about">
        <About />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="contact">
        {/* <Contact /> */}
      {/* </section>

      <section id="footer"> */}
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