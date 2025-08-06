import { motion } from 'framer-motion'
import { FaLinkedin } from 'react-icons/fa'
import './Team.css'

export default function Team() {
  const mainFounder = {
    name: 'Likith Prabhu',
    role: 'Founder & CEO',
    company: 'Vedarc Technologies Private Limited',
    bio: 'Likith Prabhu is a young entrepreneur and technologist with a vision to make next-gen technology accessible, scalable, and impactful for businesses, institutions, and individuals. As the Founder and CEO of Vedarc Technologies, he is leading a team that\'s committed to building intelligent digital solutions powered by AI, cloud, and full-stack innovation.\n\nFrom conceptualizing smart websites and enterprise platforms to building a unified AI Suite with domain-specific AI agents, Likith is on a mission to transform how people interact with technology. His leadership style blends innovation with empathy & ensuring every project delivers real value to users.\n\nUnder his direction, Vedarc has not only become Startup India and AICTE Recognized, but is also gaining trust across domains through smart solutions and collaborative product development.\n\nLikith believes in empowering students, researchers, startups, and organizations with tools that are both futuristic and practical. His startup journey stands as a testimony to what\'s possible when ambition meets purpose building in India, for the world.',
    linkedin: 'https://www.linkedin.com/in/likith-prabhu-739460296/',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQGlgw-a686HfQ/profile-displayphoto-scale_400_400/B56Zg6VmDSHcAw-/0/1753325396741?e=1756339200&v=beta&t=PL4Ni4DZqEee-EiHUbehLzf7DD-XQdaoKOu4AFjbVa0'
  }

  const leadershipTeam = [
    //{
      //name: 'Srinivas Charan Koppolu',
      //role: 'CTO',
      //bio: 'Technical visionary with deep expertise in AI systems, cloud architecture, and scalable engineering solutions. Leading our technology strategy and product development with a focus on innovation and reliability.',
      //linkedin: 'https://www.linkedin.com/in/srinivascharank/',
      //image: 'https://i.ibb.co/Q3Wj103M/Whats-App-Image-2025-07-30-at-07-53-33-c3330b0c.jpg'
    //},
    {
      name: 'Vuddagiri Naga Venkat',
      role: 'CSO',
      bio: 'Chief Strategic Officer with expertise in business strategy, market analysis, and strategic planning. Driving organizational growth and competitive positioning through innovative strategic initiatives and market expansion.',
      linkedin: 'https://www.linkedin.com/in/vuddagiri-naga-venkat-769aa5257/',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQEEyOzdqbdTqQ/profile-displayphoto-scale_400_400/B56Zhay4EwHUAg-/0/1753869944011?e=1756944000&v=beta&t=goY9c4AjCSa8eu-9T61NnqRTkUEHwShI_5hyGbjxOMw'
    },
    {
      name: 'Krishna Saran NC',
      role: 'CHRO',
      bio: 'Strategic HR leader with experience in building high-performing teams and fostering inclusive workplace cultures. Driving talent acquisition, development, and organizational growth at Vedarc Technologies.',
      linkedin: 'https://www.linkedin.com/in/krishna-saran-nc-2b53342b3/',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQEsZ9y5t3PpJQ/profile-displayphoto-shrink_400_400/B56ZXEK5ImHQAk-/0/1742752945972?e=1756339200&v=beta&t=R00g93n3ADJipuhNwu-yNZ74Tfjas1yCNHOLAwoH0Gg'
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
                        {member.role === 'CTO' ? '👨‍💻' : member.role === 'CHRO' ? '👩‍💼' : member.role === 'CSO' ? '👨‍💼' : '👨‍💼'}
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 