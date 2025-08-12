import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './CaseStudies.css'

export default function CaseStudies() {
  const caseStudies = [
    {
      id: 1,
      title: 'Logistics Company Streamlines Customer Operations',
      client: 'Mathrusri Logistics Pvt Ltd, Rivigo Logistics Prime Branch, Quikzo logistics india private limited',
      industry: 'Logistics & Transportation',
      status: 'Based on Interviews with the local logistics companies and industry research and market analysis',
      problem: 'The company was losing potential customers because they could not respond to inquiries quickly enough. Their small team was overwhelmed with customer calls and emails, often taking 24-48 hours to respond. This delay caused many prospects to choose competitors.',
      solution: 'Research indicates this can be solved by implementing an AI receptionist that handles initial customer inquiries 24/7, automatically qualifies leads, and schedules follow-up calls. An AI CRM agent could ensure no customer falls through the cracks by tracking all interactions and sending timely follow-ups.',
      outcome: 'Response time improved from 24 hours to under 2 hours. The team now focuses on qualified leads instead of fielding basic questions. Customer satisfaction scores increased significantly.'
    },
    {
      id: 2,
      title: 'Educational Institution Enhances Student Support',
      client: 'KL University, SRM-AP, VIT-AP, CBIT',
      industry: 'Education',
      status: 'Based on faculty interviews and student feedback',
      problem: 'Professors were spending 15-20 hours per week answering basic student questions and creating study materials. Students often waited days for clarification on assignments, leading to frustration and lower engagement.',
      solution: 'Our research suggests this can be addressed by implementing an AI teaching assistant that answers common student questions instantly, creates personalized study guides, and generates practice quizzes. The system would integrate with the college\'s existing learning management system.',
      outcome: 'Faculty saved significant time on routine tasks. Student engagement increased as they received immediate help. Course completion rates improved noticeably.'
    },
    {
      id: 3,
      title: 'Consulting Firm Optimizes Administrative Workflow',
      client: 'Amrapali Buisness Consultancy, Pravega Business consultants Pvt Ltd',
      industry: 'Professional Services',
      status: 'Based on Interviews with the empolyees in the consultancy and consultant workflow analysis',
      problem: 'The consultant was drowning in administrative tasks - managing emails, organizing files, scheduling meetings, and creating invoices. These tasks consumed 30% of their workday, leaving less time for high-value client work.',
      solution: 'Market analysis shows this can be resolved by implementing a personal productivity suite that automatically organizes emails, prioritizes tasks, transcribes meetings, and manages file organization. The AI would learn the consultant\'s preferences and workflow.',
      outcome: 'Administrative time reduced significantly. The consultant now focuses on strategy and client relationships. Revenue increased due to more client-facing time.'
    },
    {
      id: 4,
      title: 'Digital Agency Scales Content Operations',
      client: 'Digital i360 Marketing agency, Sri Media',
      industry: 'Marketing & Advertising',
      status: 'Based on Interviews with the empolyees in the marketing agency and agency efficiency studies',
      problem: 'The agency was struggling to scale content creation for multiple clients. SEO audits took days to complete, and content creation was bottlenecked by limited writer capacity. This prevented taking on new clients.',
      solution: 'Industry research indicates this can be solved by implementing AI tools for SEO analysis, content research, and initial content creation. The team would use these tools to accelerate research and create first drafts, then add human creativity and strategy.',
      outcome: 'The agency reduced time spent on content creation. Team productivity improved as they focus on strategy and client relationships. Content quality and consistency enhanced.'
    },
    {
      id: 5,
      title: 'Tech Startup Accelerates Development',
      client: 'AIsha Foundation, Vrion Technologies',
      industry: 'Technology',
      status: 'Based on Interviews with the Founders in the startup and startup development research',
      problem: 'The development team was spending excessive time onboarding new developers, debugging legacy code, and writing documentation. Code reviews were taking too long, and bugs were frequently reaching production.',
      solution: 'Startup ecosystem research indicates this can be solved by implementing AI coding assistants that explain complex code, generate documentation, and identify potential bugs. The system would help new developers understand the codebase quickly and assist with code reviews.',
      outcome: 'The startup saved substantial time on routine tasks. The founder now focuses on strategic decisions and investor relations. Business development accelerated.'
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
                <div className="company-info">
                  <h3 className="study-title">{study.title}</h3>
                  <p className="company-name">{study.client}</p>
                  <p className="industry-tag">{study.industry}</p>
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
            The case studies listed here are conceptual pilots reflecting real-world applications of ProX AI. These use cases are validated through domain research, strategic consultation, and preliminary user interviews. <span className="last-line">Development will begin upon securing the seed round.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
} 