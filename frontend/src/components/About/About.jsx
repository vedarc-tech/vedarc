import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaAtom, FaShieldAlt, FaLink, FaBrain, FaPaintBrush, FaRobot, FaChartLine } from 'react-icons/fa'
import { SiTensorflow, SiSolidity, SiThreedotjs } from 'react-icons/si'
import './About.css'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  // Modal state for enquiry
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  // VEDARC AI Suite Modules
  const aiModules = [
    {
      icon: <FaRobot className="tech-icon" />,
      title: "Business Solutions",
      desc: "AI Receptionist, Scheduler, CRM Agent, Invoice generation, Lead Nurturing Bots",
      features: ["24/7 client handling", "Automated onboarding", "Smart calendar management", "Email follow-ups"]
    },
    {
      icon: <FaBrain className="tech-icon" />,
      title: "Education & Learning",
      desc: "Interactive AI Teaching Assistant, Quiz Generator, Exam Evaluation, Study Plan Bot",
      features: ["Smart content summarization", "Automated evaluation", "Personalized learning paths", "Time management"]
    },
    {
      icon: <FaAtom className="tech-icon" />,
      title: "Research & Development",
      desc: "AI Literature Search, Paper Summarizer, Auto Citation, Research Progress Tracker",
      features: ["Literature analysis", "Citation management", "Progress tracking", "Data insights"]
    },
    {
      icon: <FaShieldAlt className="tech-icon" />,
      title: "Productivity Suite",
      desc: "AI Meeting Transcriber, Mail Organizer, Task Prioritization, File Finder",
      features: ["Voice transcription", "Email automation", "Smart task management", "Digital navigation"]
    },
    {
      icon: <FaChartLine className="tech-icon" />,
      title: "SEO & Digital Marketing",
      desc: "AI SEO Planner, Keyword Analyzer, Competitor Audit, Content Rewriting Assistant",
      features: ["SEO optimization", "Competitor analysis", "Content enhancement", "Performance tracking"]
    },
    {
      icon: <FaLink className="tech-icon" />,
      title: "Developer Tools",
      desc: "AI Code Explainer, Bug Detection, Boilerplate Generator, API Documentation Helper",
      features: ["Code optimization", "Bug prevention", "Documentation automation", "Development acceleration"]
    }
  ]

  // Tech stack items
  const techStack = [
    // { icon: <SiTensorflow />, name: "TensorFlow" },
    // { icon: <SiSolidity />, name: "Solidity" },
    // { icon: <SiThreedotjs />, name: "ThreeJS" },
    // { icon: <FaAtom />, name: "Qiskit" }
  ]

  return (
    <section id="about" className="about-section" ref={ref}>
      {/* Hexagonal Grid Background */}
      <div className="hex-grid">
        <div className="hex-grid__inner"></div>
      </div>

      {/* Glitch Title */}
      <motion.h2 
        className="glitch-title"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        data-text=""
      >
        UNIFIED AI AGENT ECOSYSTEM
      </motion.h2>

      {/* Animated Circuit Divider */}
      <div className="circuit-divider">
        <div className="circuit-line"></div>
        <div className="circuit-node pulse"></div>
        <div className="circuit-line"></div>
      </div>

      {/* Tagline with RGB Split */}
      <motion.p 
        className="rgb-split"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        One platform. 20+ AI agents. Unlimited possibilities for businesses, education & research
      </motion.p>

      {/* VEDARC AI Suite Modules Grid */}
      <div className="focus-grid">
        {aiModules.map((module, index) => (
          <motion.div
            key={module.title}
            className="tech-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -10 }}
            onClick={() => { setSelectedService(module); setModalOpen(true); }}
          >
            <div className="card-glow"></div>
            {module.icon}
            <h3>{module.title}</h3>
            <p>{module.desc}</p>
            <div className="module-features">
              {module.features.slice(0, 2).map((feature, idx) => (
                <span key={idx} className="feature-tag">{feature}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enquiry Modal */}
      {modalOpen && selectedService && (
        <div className="enquiry-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="enquiry-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setModalOpen(false)}>&times;</button>
            <h2>Enquire about {selectedService.title}</h2>
            <p>Interested in <b>{selectedService.title}</b>? Click below to enquire via WhatsApp!</p>
            <button
              className="enquire-btn"
              onClick={() => {
                const msg = encodeURIComponent(`Hi, I want to know more details on ${selectedService.title} service which you're offering.`);
                const number = '918897140410'; // User's WhatsApp Business number
                window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
                setModalOpen(false);
              }}
            >
              Enquire via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Tech Stack Carousel */}
      <motion.div 
        className="tech-stack"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {techStack.map((tech, index) => (
          <div key={tech.name} className="tech-badge">
            <div className="hologram-effect"></div>
            {tech.icon}
            <span>{tech.name}</span>
          </div>
        ))}
      </motion.div>

      {/* Animated Circuit Connections */}
      <svg className="circuit-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d="M10,50 Q25,20 40,50 T70,50 T90,30" 
          stroke="var(--neon-purple)" 
          strokeWidth="0.5" 
          fill="none"
          strokeDasharray="5 2"
        />
      </svg>
    </section>
  )
}