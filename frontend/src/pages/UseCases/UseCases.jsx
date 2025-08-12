import { motion } from 'framer-motion'
import './UseCases.css'

export default function UseCases() {
  const caseStudies = [
    {
      id: 1,
      title: 'MSME - AI Receptionist & CRM Integration',
      client: 'A regional logistics startup with 25 employees',
      industry: 'Logistics & MSME',
      status: 'Conceptual pilot validated through domain research',
      problem: 'High lead drop-off due to late follow-ups and inconsistent communication',
      solution: 'Research indicates this can be solved by implementing an AI receptionist for 24/7 website chat and voice support, integrated with an AI CRM agent for automated follow-ups and meeting scheduling.',
      outcome: 'Lead response speed would improve significantly, manual follow-up time would be reduced substantially, and client retention would improve through consistent nurturing.',
      context: 'This case study demonstrates how ProX AI can transform lead management for small and medium businesses through intelligent automation.'
    },
    {
      id: 2,
      title: 'Educational Institution - AI Teaching Assistant',
      client: 'Tier-2 private engineering college in India',
      industry: 'Education',
      status: 'Strategic consultation and preliminary user interviews',
      problem: 'Limited faculty bandwidth for student doubt resolution and revision assistance',
      solution: 'Our research suggests this can be addressed by implementing an AI teaching assistant integrated with LMS, along with smart notes summarizer and quiz generator from PDFs.',
      outcome: 'Student engagement would improve noticeably, faculty would save significant time per week per subject, and student drop-off in MOOCs would be reduced.',
      context: 'This solution addresses the critical need for scalable educational support in institutions with limited faculty resources.'
    },
    {
      id: 3,
      title: 'Independent Researcher – Literature & Citation Bot',
      client: 'Ph.D. Scholar in Biomedical Sciences',
      industry: 'Research & Academia',
      status: 'Domain research and use case validation',
      problem: 'Struggled with managing citations and understanding technical papers quickly',
      solution: 'Market analysis shows this can be resolved by implementing a literature search agent and paper summarizer, integrated with an auto-citation tool for BibTeX and APA exports.',
      outcome: 'Literature review time would be reduced significantly, research pace would be enhanced, and citation accuracy would improve.',
      context: 'ProX AI accelerates research productivity by automating time-consuming literature review and citation management tasks.'
    },
    {
      id: 4,
      title: 'Solopreneur – Personal Productivity Suite',
      client: 'Freelance brand consultant',
      industry: 'Freelance & Consulting',
      status: 'User interview insights and workflow analysis',
      problem: 'Manual task handling, inbox overload, unstructured files',
      solution: 'Industry research indicates this can be solved by implementing a task prioritizer bot and mail organizer, along with file finder and meeting transcriber capabilities.',
      outcome: 'Significant time would be saved in admin tasks, faster turnaround on client proposals, and boosted client communication clarity.',
      context: 'This case study shows how ProX AI can be a game-changer for solo entrepreneurs and freelancers.'
    },
    {
      id: 5,
      title: 'Digital Agency – SEO & Marketing Automation',
      client: 'Mid-size digital marketing agency',
      industry: 'Digital Marketing',
      status: 'Industry consultation and market research',
      problem: 'Manual SEO audits and repetitive content tasks',
      solution: 'Research suggests this can be addressed by implementing an SEO planner, competitor audit bot, and content rewriter, with a shared workspace featuring tailored AI tools.',
      outcome: 'SEO audit time would be reduced substantially, content generation could be scaled significantly, and campaign ROIs would improve through quicker turnarounds.',
      context: 'ProX AI enables marketing agencies to scale operations and deliver better results through intelligent automation.'
    },
    {
      id: 6,
      title: 'Dev Team – AI Coding Assistant',
      client: 'Early-stage SaaS product team (4 devs)',
      industry: 'Software Development',
      status: 'Technical consultation and development workflow analysis',
      problem: 'High onboarding time, unclear legacy code, and repeated bug triage',
      solution: 'Startup ecosystem research indicates this can be solved by implementing an AI code explainer, boilerplate generator, and bug detection assistant, paired with API doc helper for clean documentation.',
      outcome: 'Onboarding for new developers would be faster, code review cycles would be reduced, and fewer post-deployment bugs would occur.',
      context: 'This demonstrates how ProX AI can significantly improve development efficiency and code quality.'
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
            Discover how ProX AI transforms businesses across industries
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
                    <h4 className="section-label">Research-Based Solution</h4>
                    <p className="section-text">{study.solution}</p>
                  </div>
                  
                  <div className="study-section">
                    <h4 className="section-label">Projected Outcome</h4>
                    <p className="section-text result">{study.outcome}</p>
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
              The case studies listed here are conceptual pilots reflecting real-world applications of ProX AI. These use cases are validated through domain research, strategic consultation, and preliminary user interviews. <span className="last-line">Development will begin upon securing the seed round.</span>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
} 