import { motion } from 'framer-motion'
import './UseCases.css'

export default function UseCases() {
  const caseStudies = [
    {
      id: 1,
      title: 'MSME - AI Receptionist & CRM Integration',
      client: 'A regional logistics startup with 25 employees',
      logo: '🏢',
      industry: 'Logistics & MSME',
      status: 'Conceptual pilot validated through domain research',
      problem: 'High lead drop-off due to late follow-ups and inconsistent communication',
      solution: 'Implemented VEDARC AI Receptionist for 24/7 website chat + voice support, Integrated AI CRM Agent for automated follow-ups and meeting scheduling',
      outcome: '40% increase in lead response speed, Reduced manual follow-up time by 70%, Improved client retention through consistent nurturing',
      metrics: ['40% response speed increase', '70% follow-up time reduction', 'Improved client retention'],
      context: '🚀 This case study demonstrates how VEDARC AI Suite can transform lead management for small and medium businesses through intelligent automation.'
    },
    {
      id: 2,
      title: 'Educational Institution - AI Teaching Assistant',
      client: 'Tier-2 private engineering college in India',
      logo: '👨‍🏫',
      industry: 'Education',
      status: 'Strategic consultation and preliminary user interviews',
      problem: 'Limited faculty bandwidth for student doubt resolution and revision assistance',
      solution: 'Deployed AI Teaching Assistant integrated with LMS, Enabled Smart Notes Summarizer and Quiz Generator from PDFs',
      outcome: '30% improvement in student engagement, Faculty time saved: ~6 hours/week per subject, Reduced student drop-off in MOOCs by 20%',
      metrics: ['30% engagement improvement', '6 hours/week saved', '20% drop-off reduction'],
      context: '📚 This solution addresses the critical need for scalable educational support in institutions with limited faculty resources.'
    },
    {
      id: 3,
      title: 'Independent Researcher – Literature & Citation Bot',
      client: 'Ph.D. Scholar in Biomedical Sciences',
      logo: '🧪',
      industry: 'Research & Academia',
      status: 'Domain research and use case validation',
      problem: 'Struggled with managing citations and understanding technical papers quickly',
      solution: 'Used Literature Search Agent and Paper Summarizer, Integrated Auto-Citation Tool for BibTeX and APA exports',
      outcome: 'Literature review time reduced by 60%, Enhanced research pace, increased paper submissions, Improved citation accuracy',
      metrics: ['60% time reduction', 'Enhanced research pace', 'Improved accuracy'],
      context: '🎓 VEDARC AI Suite accelerates research productivity by automating time-consuming literature review and citation management tasks.'
    },
    {
      id: 4,
      title: 'Solopreneur – Personal Productivity Suite',
      client: 'Freelance brand consultant',
      logo: '💼',
      industry: 'Freelance & Consulting',
      status: 'User interview insights and workflow analysis',
      problem: 'Manual task handling, inbox overload, unstructured files',
      solution: 'Deployed Task Prioritizer Bot and Mail Organizer, Enabled File Finder and Meeting Transcriber',
      outcome: 'Saved ~10 hours/week in admin tasks, Faster turnaround on client proposals, Boosted client communication clarity',
      metrics: ['10 hours/week saved', 'Faster proposals', 'Better communication'],
      context: '💼 This case study shows how VEDARC AI Suite can be a game-changer for solo entrepreneurs and freelancers.'
    },
    {
      id: 5,
      title: 'Digital Agency – SEO & Marketing Automation',
      client: 'Mid-size digital marketing agency',
      logo: '🌐',
      industry: 'Digital Marketing',
      status: 'Industry consultation and market research',
      problem: 'Manual SEO audits and repetitive content tasks',
      solution: 'Integrated SEO Planner, Competitor Audit Bot, and Content Rewriter, Team used shared workspace with tailored AI tools',
      outcome: 'SEO audit time cut by 50%, Scaled content generation by 2x, Increased campaign ROIs through quicker turnarounds',
      metrics: ['50% audit time reduction', '2x content scale', 'Improved ROIs'],
      context: '🌐 VEDARC AI Suite enables marketing agencies to scale operations and deliver better results through intelligent automation.'
    },
    {
      id: 6,
      title: 'Dev Team – AI Coding Assistant',
      client: 'Early-stage SaaS product team (4 devs)',
      logo: '👨‍💻',
      industry: 'Software Development',
      status: 'Technical consultation and development workflow analysis',
      problem: 'High onboarding time, unclear legacy code, and repeated bug triage',
      solution: 'Used AI Code Explainer, Boilerplate Generator, and Bug Detection Assistant, Paired with API Doc Helper for clean documentation',
      outcome: '40% faster onboarding for new developers, Code review cycles reduced by 35%, Fewer post-deployment bugs',
      metrics: ['40% faster onboarding', '35% review reduction', 'Fewer bugs'],
      context: '👨‍💻 This demonstrates how VEDARC AI Suite can significantly improve development efficiency and code quality.'
    }
  ]

  return (
    <div className="use-cases-page">
      <section className="use-cases-hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Case Studies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Discover how VEDARC AI Suite transforms businesses across industries
          </motion.p>
        </div>
      </section>

      <section className="case-studies-section">
        <div className="container">
          <div className="case-studies-grid">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                className="case-study-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 249, 255, 0.2)" }}
              >
                <div className="card-header">
                  <div className="company-logo">{study.logo}</div>
                  <div className="company-info">
                    <h3 className="study-title">{study.title}</h3>
                    <p className="company-name">{study.client}</p>
                    <p className="study-status">{study.status}</p>
                    <span className="industry-tag">{study.industry}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="study-section">
                    <h4 className="section-label">Problem</h4>
                    <p className="section-text">{study.problem}</p>
                  </div>
                  
                  <div className="study-section">
                    <h4 className="section-label">Solution</h4>
                    <p className="section-text">{study.solution}</p>
                  </div>
                  
                  <div className="study-section">
                    <h4 className="section-label">Projected Outcome</h4>
                    <p className="section-text result">{study.outcome}</p>
                  </div>
                  
                                     <div className="metrics-section">
                     <h4 className="section-label">Key Metrics</h4>
                     <div className="metrics-grid">
                       {study.metrics.map((metric, idx) => (
                         <div key={idx} className="metric-item">
                           <span className="metric-text">{metric}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                   
                   <div className="context-section">
                     <p className="context-text">{study.context}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div
          className="use-cases-disclaimer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="container">
            <p className="disclaimer-text">
              ✅ The case studies listed here are conceptual pilots reflecting real-world applications of the VEDARC AI Suite. These use cases are validated through domain research, strategic consultation, and preliminary user interviews. Development will begin upon securing the seed round.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
} 