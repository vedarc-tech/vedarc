import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaAtom, FaShieldAlt, FaLink, FaBrain } from 'react-icons/fa'
import { SiTensorflow, SiSolidity, SiThreedotjs } from 'react-icons/si'
import './About.css'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  // Tech focus areas
  const focusAreas = [
      {
          icon: <FaLink className="tech-icon" />,
          title: "Web Development",
          desc: "Building scalable, secure, and high-performance web applications"
        },
        {
            icon: <FaAtom className="tech-icon" />,
            title: "Full Stack Designs",
            desc: "End-to-end solutions from frontend to backend with cutting-edge technologies"
        },
        {
          icon: <FaBrain className="tech-icon" />,
          title: "AI & ML",
          desc: "Transforming industries with advanced neural networks and deep learning"
        },
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
        BUILDING THE FUTURE OF TECH
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
        Merging bleeding-edge research with scalable enterprise solutions
      </motion.p>

      {/* Focus Areas Grid */}
      <div className="focus-grid">
        {focusAreas.map((area, index) => (
          <motion.div
            key={area.title}
            className="tech-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -10 }}
          >
            <div className="card-glow"></div>
            {area.icon}
            <h3>{area.title}</h3>
            <p>{area.desc}</p>
          </motion.div>
        ))}
      </div>

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