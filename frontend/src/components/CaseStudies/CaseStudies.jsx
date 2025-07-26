import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './CaseStudies.css'

export default function CaseStudies() {
  const caseStudies = [
    {
      id: 1,
      title: 'MSME - AI Receptionist & CRM Integration',
      client: 'A regional logistics startup with 25 employees',
      logo: '🏢',
      status: 'Conceptual pilot validated through domain research',
      problem: 'High lead drop-off due to late follow-ups and inconsistent communication',
      solution: 'Implemented VEDARC AI Receptionist for 24/7 website chat + voice support, Integrated AI CRM Agent for automated follow-ups and meeting scheduling',
      outcome: '40% increase in lead response speed, Reduced manual follow-up time by 70%, Improved client retention through consistent nurturing'
    },
    {
      id: 2,
      title: 'Educational Institution - AI Teaching Assistant',
      client: 'Tier-2 private engineering college in India',
      logo: '👨‍🏫',
      status: 'Strategic consultation and preliminary user interviews',
      problem: 'Limited faculty bandwidth for student doubt resolution and revision assistance',
      solution: 'Deployed AI Teaching Assistant integrated with LMS, Enabled Smart Notes Summarizer and Quiz Generator from PDFs',
      outcome: '30% improvement in student engagement, Faculty time saved: ~6 hours/week per subject, Reduced student drop-off in MOOCs by 20%'
    },
    {
      id: 3,
      title: 'Independent Researcher – Literature & Citation Bot',
      client: 'Ph.D. Scholar in Biomedical Sciences',
      logo: '🧪',
      status: 'Domain research and use case validation',
      problem: 'Struggled with managing citations and understanding technical papers quickly',
      solution: 'Used Literature Search Agent and Paper Summarizer, Integrated Auto-Citation Tool for BibTeX and APA exports',
      outcome: 'Literature review time reduced by 60%, Enhanced research pace, increased paper submissions, Improved citation accuracy'
    },
    {
      id: 4,
      title: 'Solopreneur – Personal Productivity Suite',
      client: 'Freelance brand consultant',
      logo: '💼',
      status: 'User interview insights and workflow analysis',
      problem: 'Manual task handling, inbox overload, unstructured files',
      solution: 'Deployed Task Prioritizer Bot and Mail Organizer, Enabled File Finder and Meeting Transcriber',
      outcome: 'Saved ~10 hours/week in admin tasks, Faster turnaround on client proposals, Boosted client communication clarity'
    },
    {
      id: 5,
      title: 'Digital Agency – SEO & Marketing Automation',
      client: 'Mid-size digital marketing agency',
      logo: '🌐',
      status: 'Industry consultation and market research',
      problem: 'Manual SEO audits and repetitive content tasks',
      solution: 'Integrated SEO Planner, Competitor Audit Bot, and Content Rewriter, Team used shared workspace with tailored AI tools',
      outcome: 'SEO audit time cut by 50%, Scaled content generation by 2x, Increased campaign ROIs through quicker turnarounds'
    },
    {
      id: 6,
      title: 'Dev Team – AI Coding Assistant',
      client: 'Early-stage SaaS product team (4 devs)',
      logo: '👨‍💻',
      status: 'Technical consultation and development workflow analysis',
      problem: 'High onboarding time, unclear legacy code, and repeated bug triage',
      solution: 'Used AI Code Explainer, Boilerplate Generator, and Bug Detection Assistant, Paired with API Doc Helper for clean documentation',
      outcome: '40% faster onboarding for new developers, Code review cycles reduced by 35%, Fewer post-deployment bugs'
    }
  ]

  return (
    <section className="case-studies-section">
      <div className="case-studies-container">
        <motion.div
          className="case-studies-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="case-studies-title">Case Studies & Pilot Use Cases</h2>
          <p className="case-studies-subtitle">
            See how VEDARC AI Suite transforms businesses across industries
          </p>
        </motion.div>

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
                </div>
              </div>
              
              <div className="card-content">
                <div className="study-point">
                  <span className="point-label">Problem:</span>
                  <span className="point-text">{study.problem}</span>
                </div>
                <div className="study-point">
                  <span className="point-label">Solution:</span>
                  <span className="point-text">{study.solution}</span>
                </div>
                <div className="study-point">
                  <span className="point-label">Outcome (Projected):</span>
                  <span className="point-text result">{study.outcome}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="case-studies-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/use-cases" className="view-all-btn">
            View All Case Studies
          </Link>
        </motion.div>
        
        <motion.div
          className="case-studies-disclaimer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="disclaimer-text">
             The case studies listed here are conceptual pilots reflecting real-world applications of the VEDARC AI Suite. These use cases are validated through domain research, strategic consultation, and preliminary user interviews. Development will begin upon securing the seed round.
          </p>
        </motion.div>

        {/* Impact Summary Table */}
        <motion.div
          className="impact-summary-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="impact-summary-title">Impact Summary</h3>
          <div className="impact-summary-table-wrapper">
            <table className="impact-summary-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Problem Solved</th>
                  <th>Core AI Agent(s)</th>
                  <th>Value Delivered</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MSMEs</td>
                  <td>Missed leads & manual follow-ups</td>
                  <td>AI Receptionist, CRM Agent</td>
                  <td>+40% response speed</td>
                </tr>
                <tr>
                  <td>Education</td>
                  <td>Faculty bandwidth, student engagement</td>
                  <td>Teaching Assistant, Quiz Bot</td>
                  <td>+30% engagement</td>
                </tr>
                <tr>
                  <td>Research</td>
                  <td>Time-consuming literature review</td>
                  <td>Summarizer, Citation Agent</td>
                  <td>-60% research time</td>
                </tr>
                <tr>
                  <td>Freelancers</td>
                  <td>Admin overload</td>
                  <td>Mail Organizer, Task Bot</td>
                  <td>+10 hrs/week saved</td>
                </tr>
                <tr>
                  <td>Marketing</td>
                  <td>Manual SEO & content</td>
                  <td>SEO Planner, Rewriter</td>
                  <td>2x content scale</td>
                </tr>
                <tr>
                  <td>Dev Teams</td>
                  <td>Dev inefficiency</td>
                  <td>Code Explainer, Bug Bot</td>
                  <td>-35% review time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 