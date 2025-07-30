import { motion } from 'framer-motion'
import { FaPlay, FaQuoteLeft, FaStar, FaLinkedin, FaGlobe } from 'react-icons/fa'
import './Testimonials.css'

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Dr. R. Chandrika",
      title: "President – Tamil Nadu Cube Association",
      credentials: "Child and Adolescent Counselor | World Master of Cubes & Ambassador of the Rubik's Cube",
      organization: "Tamil Nadu Cube Association (TNCA)",
      videoUrl: "https://youtube.com/shorts/HEZRuI41g2s?si=KH33_6Xa8NDMFL_x",
      thumbnail: "https://img.youtube.com/vi/HEZRuI41g2s/maxresdefault.jpg",
      quote: "The AI-powered cognitive skills improvement platform we developed with Vedarc Technologies Private Limited has revolutionized how we train students. The intelligent learning system adapts to each child's pace, providing personalized IQ enhancement exercises and real-time feedback. Our students have shown remarkable improvement in problem-solving skills and cognitive development.",
      rating: 5,
      achievements: [
        "World Master of Cubes - Recognized by The Hindu",
        "Special Designer of Braille Rubik's Cubes",
        "Trained 6 students to set Guinness World Records",
        "Over 15 years of experience in speed cubing and child development",
        "Certificate in Child Counseling from NHCA, Singapore"
      ],
      website: "https://tamilnaducubeassociation.org/",
      location: "Chennai, Tamil Nadu",
      projectDetails: " Iqualizer - AI-Powered IQ growth booster & Cognitive Skills Enhancement Platform"
    }
  ]

  const handleVideoClick = (videoUrl) => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="testimonials" className="testimonials-section">
      {/* Background Elements */}
      <div className="testimonials-bg">
        <div className="testimonials-overlay"></div>
        <div className="testimonials-particles">
          <div className="testimonial-particle"></div>
          <div className="testimonial-particle"></div>
          <div className="testimonial-particle"></div>
        </div>
      </div>

      <div className="testimonials-container">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <h2 className="testimonials-title">
            <span className="title-line">Client</span>
            <span className="title-line">Testimonials</span>
          </h2>
          <p className="testimonials-subtitle">
            Hear from Dr. R. Chandrika, President of Tamil Nadu Cube Association, about the AI-powered cognitive skills platform we developed
          </p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
                             {/* Featured Video for Dr. Chandrika */}
               <div className="video-testimonial">
                 <div className="video-container">
                   <img 
                     src={testimonial.thumbnail} 
                     alt={`${testimonial.name} testimonial video`}
                     className="video-thumbnail"
                   />
                   <button 
                     className="play-button"
                     onClick={() => handleVideoClick(testimonial.videoUrl)}
                     aria-label="Play testimonial video"
                   >
                     <FaPlay />
                   </button>
                   <div className="video-overlay"></div>
                 </div>
                 <p className="video-caption">Watch Dr. Chandrika's testimonial</p>
               </div>

              <div className="testimonial-content">
                <div className="quote-icon">
                  <FaQuoteLeft />
                </div>
                
                <blockquote className="testimonial-quote">
                  {testimonial.quote}
                </blockquote>

                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>

                <div className="testimonial-author">
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-title">{testimonial.title}</p>
                    {testimonial.credentials && (
                      <p className="author-credentials">{testimonial.credentials}</p>
                    )}
                    <p className="author-organization">{testimonial.organization}</p>
                    {testimonial.location && (
                      <p className="author-location">{testimonial.location}</p>
                    )}
                  </div>

                  {/* Achievements Section */}
                  {testimonial.achievements && (
                    <div className="author-achievements">
                      <h5>Notable Achievements of our Client:</h5>
                      <ul>
                        {testimonial.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                                     {/* Project Details */}
                   {testimonial.projectDetails && (
                     <div className="project-details">
                       <h5>Project Delivered:</h5>
                       <p className="project-name">{testimonial.projectDetails}</p>
                     </div>
                   )}

                   {/* External Links */}
                   <div className="author-links">
                     {testimonial.website && (
                       <a 
                         href={testimonial.website} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="link-button"
                       >
                         <FaGlobe /> Visit TNCA Website
                       </a>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  )
} 