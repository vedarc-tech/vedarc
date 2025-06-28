import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaCode, FaServer, FaBrain, FaLink } from 'react-icons/fa'
import { SiTensorflow, SiThreedotjs } from 'react-icons/si'
import './Projects.css';

const projectsData = [
  {
    title: "Quantum AI Platform",
    description: "Machine learning accelerated by quantum algorithms, delivering 100x faster inference",
    tags: ["AI", "Quantum", "Python"],
    icon: <FaBrain className="project-icon" />,
    status: "Active",
    link: "#"
  },
  {
    title: "Neural Interface SDK",
    description: "Cortical modem development kit for brain-computer interfaces",
    tags: ["Neuroscience", "Embedded", "C++"],
    icon: <FaCode className="project-icon" />,
    status: "R&D",
    link: "#"
  },
  {
    title: "Edge AI Orchestrator",
    description: "Distributed AI model deployment across edge devices",
    tags: ["Kubernetes", "TensorFlow", "IoT"],
    icon: <SiTensorflow className="project-icon" />,
    status: "Beta",
    link: "#"
  }
]

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  return (
    <section id="projects" className="projects-section" ref={ref}>
      {/* Holographic Grid Background */}
      <div className="holographic-grid"></div>

      {/* Animated Title */}
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="title-decorator">//</span> OUR PROJECTS
      </motion.h2>

      {/* Interactive Project Cards */}
      <div className="projects-grid">
        {projectsData.map((project, index) => (
          <motion.div
            key={project.title}
            className="project-card"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            whileHover={{ y: -10 }}
          >
            {/* Holographic Effect */}
            <div className="card-hologram"></div>
            
            {/* Project Icon */}
            <div className="card-icon-container">
              {project.icon}
              <div className="icon-pulse"></div>
            </div>

            {/* Project Content */}
            <div className="card-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              
              {/* Tags */}
              <div className="tags-container">
                {project.tags.map(tag => (
                  <span key={tag} className="tech-tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`status-indicator ${project.status.toLowerCase()}`}>
              <div className="status-pulse"></div>
              {project.status}
            </div>

            {/* Connection Lines */}
            <svg className="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M0,50 Q25,20 50,50 T100,50" 
                stroke="rgba(123, 45, 255, 0.3)" 
                strokeWidth="1" 
                fill="none"
                strokeDasharray="5 2"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Animated View More */}
      <motion.div
        className="view-more"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <button className="glowing-btn">
          <FaLink className="link-icon" />
          VIEW ALL PROJECTS
          <span className="btn-glow"></span>
        </button>
      </motion.div>
    </section>
  )
}