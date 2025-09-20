import { motion } from 'framer-motion'
import { FaLinkedin } from 'react-icons/fa'
import './Team.css'

export default function Team() {
  const mainFounder = {
    name: 'Pothana Likith Prabhu',
    role: 'Founder & CEO',
    company: 'Vedarc Technologies Private Limited',
    bio: 'Likith Prabhu is a young entrepreneur and technologist with a vision to make next-gen technology accessible, scalable, and impactful for businesses, institutions, and individuals. As the Founder and CEO of Vedarc Technologies, he is leading a team that\'s committed to building intelligent digital solutions powered by AI, cloud, and full-stack innovation.\n\nFrom conceptualizing smart websites and enterprise platforms to building a unified AI Suite with domain-specific AI agents, Likith is on a mission to transform how people interact with technology. His leadership style blends innovation with empathy & ensuring every project delivers real value to users.\n\nUnder his direction, Vedarc has not only become Startup India and AICTE Recognized, but is also gaining trust across domains through smart solutions and collaborative product development.\n\nLikith believes in empowering students, researchers, startups, and organizations with tools that are both futuristic and practical. His startup journey stands as a testimony to what\'s possible when ambition meets purpose building in India, for the world.',
    linkedin: 'https://www.linkedin.com/in/likith-prabhu-739460296/',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQH75Emp9xwRaw/profile-displayphoto-scale_400_400/B56ZloVF0eJwAk-/0/1758391983942?e=1761177600&v=beta&t=MKqDw9T8Pz0_ij5LnNfdEgKJxf8gjHYsSQJ4Jwvrx-s'
  }

  const leadershipTeam = [
    {
      name: 'Srinivas Charan Koppolu',
      role: 'CTO',
      bio: 'Technical visionary with deep expertise in AI systems, cloud architecture, and scalable engineering solutions. Leading our technology strategy and product development with a focus on innovation and reliability.',
      linkedin: 'https://www.linkedin.com/in/srinivascharank/',
      image: 'https://i.ibb.co/Q3Wj103M/Whats-App-Image-2025-07-30-at-07-53-33-c3330b0c.jpg'
    },
    {
      name: 'Krishna Saran NC',
      role: 'CHRO',
      bio: 'Strategic HR leader with experience in building high-performing teams and fostering inclusive workplace cultures. Driving talent acquisition, development, and organizational growth at Vedarc Technologies.',
      linkedin: 'https://www.linkedin.com/in/krishna-saran-nc-2b53342b3/',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQHCfcfO_lvMoA/profile-displayphoto-scale_400_400/B56Zi5CLafHcAk-/0/1755451014614?e=1758758400&v=beta&t=Cp9RazexGne55uHEoppeLwXS4lCp4Zhg17WADYYF99o'
    },
    {
      name: 'Ashraf Shaik Mohammed',
      role: 'CCO',
      bio: 'Chief Communications Officer with expertise in strategic communications, public relations, and stakeholder engagement. Leading our external communications strategy and building strong relationships with partners, clients, and the broader community.',
      linkedin: 'https://www.linkedin.com/in/ashraf-shaik-mohammed-713524315/',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQEJuj3Veu_RNw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731507159330?e=1758153600&v=beta&t=t2dgY5fvTi_fRNirt0fpBaJn_XH76DCiJOzWLY7-gSg'
    },
    {
      name: 'Pothana Krishna Kanthi',
      role: 'CFO',
      bio: 'Chief Financial Officer with expertise in financial planning, budgeting, and strategic financial management. Leading our financial operations and ensuring sustainable growth through sound fiscal policies and investment strategies.',
      linkedin: null,
      image: 'https://i.ibb.co/27bh7q9y/Whats-App-Image-2025-08-12-at-13-24-18-bd4ad3c4.jpg'
    },
    {
      name: 'Nabid Akhtar',
      role: 'COO',
      bio: 'Chief Operating Officer with expertise in operational excellence, process optimization, and strategic execution. Leading our day-to-day operations and ensuring efficient delivery of our technology solutions while driving operational growth and organizational effectiveness.',
      linkedin: null,
      image: 'https://i.ibb.co/5xv4cwJh/Screenshot-2025-08-12-132811.png'
    }
  ]

  return (
    <div className="team-page">
      {/* Founder Section - Starting immediately */}
      <section className="founder-section-direct">
        <div className="container">
          <motion.div
            className="founder-card-main"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(0, 249, 255, 0.3)" }}
          >
            <div className="founder-header">
              <h2 className="founder-section-title">Meet the Founder</h2>
              <p className="founder-section-subtitle">
                The visionary leader driving our mission to democratize AI
              </p>
            </div>

            <div className="founder-content">
              <div className="founder-image-main">
                <img 
                  src={mainFounder.image} 
                  alt={mainFounder.name}
                  className="founder-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-placeholder-main" style={{ display: 'none' }}>
                  👨‍💼
                </div>
              </div>
              
              <div className="founder-info-main">
                <h3 className="founder-name-main">{mainFounder.name}</h3>
                <p className="founder-role-main">{mainFounder.role}</p>
                <p className="founder-company">{mainFounder.company}</p>
                <div className="founder-bio-main">
                  {mainFounder.bio.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="bio-paragraph">{paragraph}</p>
                  ))}
                </div>
                
                <motion.a
                  href={mainFounder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linkedin-link-main"
                  whileHover={{ scale: 1.05, color: 'var(--neon-cyan)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaLinkedin />
                  <span>Connect on LinkedIn</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="leadership-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Leadership Team</h2>
          </motion.div>

          <div className="leadership-grid">
            {leadershipTeam.map((member, index) => (
              <motion.div
                key={index}
                className="leadership-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 249, 255, 0.2)" }}
              >
                <div className="member-image">
                  {member.image.startsWith('http') ? (
                    <>
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="member-photo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="image-placeholder" style={{ display: 'none' }}>
                        {member.role === 'CTO' ? '👨‍💻' : member.role === 'CHRO' ? '👩‍💼' : member.role === 'CSO' ? '👨‍💼' : member.role === 'CCO' ? '📢' : member.role === 'CFO' ? '💰' : '👨‍💼'}
                      </div>
                    </>
                  ) : (
                    <div className="image-placeholder">
                      {member.image}
                    </div>
                  )}
                </div>
                
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  
                  {member.linkedin && (
                    <motion.a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="linkedin-link"
                      whileHover={{ scale: 1.1, color: 'var(--neon-cyan)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaLinkedin />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 
