import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaCode, FaServer, FaBrain, FaLink, FaGraduationCap, FaStar, FaUsers, FaTrophy } from 'react-icons/fa'
import { SiTensorflow, SiThreedotjs, SiReact, SiPython, SiJavascript, SiDocker, SiKubernetes } from 'react-icons/si'
import './Projects.css';

// Hardcoded student projects
const studentProjects = [
  {
    title: "AI-Powered E-commerce Recommendation System",
    description: "Developed a machine learning model that provides personalized product recommendations, increasing sales by 35% and improving user engagement by 45%.",
    tags: ["Python", "Machine Learning", "TensorFlow", "React", "MongoDB"],
    status: "Completed",
    completion_rate: 98,
    student_name: "Priya Sharma",
    university: "IIT Delhi"
  },
  {
    title: "Blockchain-Based Supply Chain Tracker",
    description: "Built a decentralized application for tracking products through the supply chain, ensuring transparency and reducing fraud by 60%.",
    tags: ["Solidity", "Web3.js", "React", "Node.js", "IPFS"],
    status: "Completed",
    completion_rate: 95,
    student_name: "Rahul Kumar",
    university: "BITS Pilani"
  },
  {
    title: "IoT Smart Home Automation System",
    description: "Created an intelligent home automation system using IoT sensors and cloud computing, enabling remote control and energy optimization.",
    tags: ["Arduino", "Python", "AWS IoT", "React Native", "MQTT"],
    status: "Completed",
    completion_rate: 92,
    student_name: "Ananya Patel",
    university: "VIT Vellore"
  },
  {
    title: "Cybersecurity Threat Detection Platform",
    description: "Developed a real-time threat detection system using machine learning algorithms, achieving 94% accuracy in identifying malicious activities.",
    tags: ["Python", "Cybersecurity", "Machine Learning", "Docker", "Kubernetes"],
    status: "Completed",
    completion_rate: 96,
    student_name: "Vikram Singh",
    university: "NIT Trichy"
  },
  {
    title: "Cloud-Native Microservices Architecture",
    description: "Designed and implemented a scalable microservices architecture for a fintech application, reducing deployment time by 70%.",
    tags: ["Docker", "Kubernetes", "Node.js", "PostgreSQL", "Redis"],
    status: "Completed",
    completion_rate: 94,
    student_name: "Meera Iyer",
    university: "IIIT Hyderabad"
  },
  {
    title: "Data Analytics Dashboard for Healthcare",
    description: "Built a comprehensive analytics dashboard for healthcare data visualization, helping doctors make data-driven decisions.",
    tags: ["Python", "Tableau", "SQL", "Flask", "D3.js"],
    status: "Completed",
    completion_rate: 91,
    student_name: "Arjun Reddy",
    university: "Manipal Institute of Technology"
  }
];

// Hardcoded company projects
const companyProjects = [
  {
    title: "Healthcare Data Analytics Suite",
    description: "Built a HIPAA-compliant analytics dashboard for hospitals, enabling real-time patient monitoring and predictive analytics for better outcomes.",
    tags: ["Python", "Django", "Tableau", "PostgreSQL"],
    status: "Live",
    impact: "Improved patient outcomes by 20%",
    client: "MediCare Hospitals"
  },
  {
    title: "AI Document Processing Engine",
    description: "Implemented an AI-powered document processing system for a financial firm, automating 95% of manual paperwork and reducing errors.",
    tags: ["AI", "Python", "TensorFlow", "Flask"],
    status: "Production",
    impact: "95% automation, error reduction",
    client: "FinTrust Corp"
  },
  {
    title: "Ongoing Project for Tamil Nadu Cube Association",
    description: "Currently developing a comprehensive digital platform for the Tamil Nadu Cube Association To analyze the IQ of the students by using the cube and the interactive quizes.",
    tags: ["React", "Node.js", "MongoDB", "AI", "Interactive Quizes"],
    status: "Ongoing",
    impact: "Testimonial will be available after completion of the project",
    client: "Tamil Nadu Cube Association"
  },
];

// Technology icon mapping
const getTechIcon = (tech) => {
  const iconMap = {
    'Python': <SiPython className="tech-icon" />,
    'React': <SiReact className="tech-icon" />,
    'JavaScript': <SiJavascript className="tech-icon" />,
    'Docker': <SiDocker className="tech-icon" />,
    'Kubernetes': <SiKubernetes className="tech-icon" />,
    'TensorFlow': <SiTensorflow className="tech-icon" />,
    'Machine Learning': <FaBrain className="tech-icon" />,
    'Node.js': <FaServer className="tech-icon" />,
    'default': <FaCode className="tech-icon" />
  };
  return iconMap[tech] || iconMap['default'];
};

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })
  const [tab, setTab] = useState('company')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  // Stats for trust-building
  const stats = {
    totalProjects: studentProjects.length,
    avgCompletion: Math.round(studentProjects.reduce((sum, p) => sum + (p.completion_rate || 95), 0) / studentProjects.length),
    topUniversities: new Set(studentProjects.map(p => p.university)).size,
    successRate: 96
  }

  const handleTabChange = (tab) => {
    console.log('Tab changed to:', tab);
    setTab(tab);
  }
  const handleCardClick = (project) => {
    setSelectedProject(project)
    setModalOpen(true)
  }
  const handleCloseModal = () => setModalOpen(false)

  const displayedProjects = tab === 'student' ? studentProjects : companyProjects

  return (
    <section id="projects" className="projects-section" ref={ref}>
      <div className="holographic-grid"></div>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="title-decorator">//</span> FEATURED PROJECTS
      </motion.h2>
      <motion.div
        className="trust-stats"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalProjects}+</h3>
            <p>Projects Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.avgCompletion}%</h3>
            <p>Avg. Completion Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <FaGraduationCap className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.topUniversities}</h3>
            <p>Top Universities</p>
          </div>
        </div>
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.successRate}%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </motion.div>
      <div className="projects-tabs">
        <button
          className={tab === 'company' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => handleTabChange('company')}
          type="button"
        >
          Company Projects
        </button>
        <button
          className={tab === 'student' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => handleTabChange('student')}
          type="button"
        >
          Student Projects
        </button>
      </div>
      <div className="projects-grid">
        {displayedProjects.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1', fontSize: '1.2rem', padding: '40px 0' }}>
            No projects to display in this category yet.
          </div>
        )}
        {displayedProjects.map((project, index) => (
          <motion.div
            key={project.title + (project.student_name || project.client || '')}
            className="project-card"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            whileHover={{ y: -10 }}
            onClick={() => handleCardClick(project)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-hologram"></div>
            <div className="project-header">
              <div className="project-icon-container">
                {getTechIcon(project.tags[0])}
                <div className="icon-pulse"></div>
              </div>
              {project.completion_rate && (
                <div className="completion-badge">
                  <span className="completion-rate">{project.completion_rate}%</span>
                  <span className="completion-label">Complete</span>
                </div>
              )}
              {project.impact && (
                <div className="completion-badge">
                  <span className="completion-rate">{project.impact}</span>
                  <span className="completion-label">Impact</span>
                </div>
              )}
            </div>
            <div className="card-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.student_name && (
                <div className="student-info">
                  <FaGraduationCap className="student-icon" />
                  <div className="student-details">
                    <span className="student-name">{project.student_name}</span>
                    <span className="university">{project.university}</span>
                  </div>
                </div>
              )}
              {project.client && (
                <div className="student-info">
                  <FaUsers className="student-icon" />
                  <div className="student-details">
                    <span className="student-name">{project.client}</span>
                    <span className="university">{project.year}</span>
                  </div>
                </div>
              )}
              <div className="tags-container">
                {project.tags.map(tag => (
                  <span key={tag} className="tech-tag">
                    {getTechIcon(tag)}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={`status-indicator ${project.status?.toLowerCase().replace('&', '-')}`}>
              <div className="status-pulse"></div>
              {project.status}
            </div>
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
      {/* Modal for Project Details */}
      {modalOpen && selectedProject && (
        <div className="project-modal-overlay" onClick={handleCloseModal}>
          <div className="project-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            {selectedProject.student_name && (
              <div className="modal-info">
                <strong>Student:</strong> {selectedProject.student_name} <br />
                <strong>University:</strong> {selectedProject.university}
              </div>
            )}
            {selectedProject.client && (
              <div className="modal-info">
                <strong>Client:</strong> {selectedProject.client} <br />
                <strong>Year:</strong> {selectedProject.year}
              </div>
            )}
            {selectedProject.impact && (
              <div className="modal-info">
                <strong>Impact:</strong> {selectedProject.impact}
              </div>
            )}
            {selectedProject.completion_rate && (
              <div className="modal-info">
                <strong>Completion Rate:</strong> {selectedProject.completion_rate}%
              </div>
            )}
            <div className="modal-tags">
              {selectedProject.tags.map(tag => (
                <span key={tag} className="tech-tag">
                  {getTechIcon(tag)}
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <motion.div
        className="cta-section"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="cta-content">
          <h3>Ready to Build Your Own Success Story?</h3>
          <p>Join thousands of students who have transformed their careers with our industry-focused projects</p>
          <div className="cta-buttons">
            <a href="https://www.vedarc.co.in/internship-registration" className="glowing-btn primary" target="_blank" rel="noopener noreferrer">
              <FaLink className="link-icon" />
              START YOUR INTERNSHIP
              <span className="btn-glow"></span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}