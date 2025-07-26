import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FAQ.css'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is VEDARC AI Suite?",
      answer: "VEDARC AI Suite is a unified platform of AI agents designed for Business, Education & Research. It provides intelligent automation, data analysis, and decision-making capabilities through a comprehensive suite of specialized AI agents that work together to solve complex business challenges."
    },
    {
      question: "What are the 6 main modules?",
      answer: `<div class="faq-modules">
        <p>Our platform includes:</p>
        <ul>
          <li><strong>Business Solutions:</strong> AI Receptionist, CRM Agent, Scheduler</li>
          <li><strong>Education & Learning:</strong> Teaching Assistant, Quiz Generator, Exam Evaluator</li>
          <li><strong>Research & Development:</strong> Literature Search, Citation Manager, Paper Summarizer</li>
          <li><strong>Productivity Suite:</strong> Meeting Transcriber, Task Manager, Mail Organizer</li>
          <li><strong>SEO & Digital Marketing:</strong> SEO Planner, Content Assistant, Competitor Analyzer</li>
          <li><strong>Developer Tools:</strong> Code Explainer, Bug Detection, API Documentation Helper</li>
        </ul>
      </div>`
    },
    {
      question: "How much does it cost?",
      answer: `<div class="faq-pricing">
        <p>We offer multiple pricing tiers:</p>
        <ul>
          <li><strong>Free Tier:</strong> 3 AI agents with limited credits</li>
          <li><strong>Starter Plan:</strong> ₹999/month - All personal + 5 business tools</li>
          <li><strong>Pro Plan:</strong> ₹2699/month - Unlimited access with priority support</li>
          <li><strong>Enterprise:</strong> Custom solutions with white-label options</li>
        </ul>
      </div>`
    },
    {
      question: "How can I join the beta?",
      answer: "To join our beta program, simply sign up for our waitlist using the form above. We'll notify you when beta access becomes available. Beta participants will get early access to our platform and exclusive features before the public launch."
    },
    {
      question: "When will the platform go live?",
      answer: "We're currently in development and will launch soon. Our timeline includes extensive testing and optimization to ensure the best possible user experience. Sign up for our waitlist to be notified when we go live."
    },
    {
      question: "Will my data be secure?",
      answer: "Absolutely. Data security is our top priority. We implement enterprise-grade encryption, secure cloud infrastructure, and strict privacy controls. All data processing follows industry best practices and compliance standards to ensure your information remains protected."
    },
    {
      question: "Can I integrate with existing tools?",
      answer: "Yes! VEDARC AI Suite offers easy integration with popular tools like Notion, Google Workspace, and other productivity platforms. Our API-first approach ensures seamless connectivity with your existing workflow."
    },
    {
      question: "Can I request a demo?",
      answer: "Yes! While our platform is still in development, we're happy to provide demos and walkthroughs for interested partners and potential customers. Please contact us through our investor engagement form or reach out directly to discuss your specific needs."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="faq-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Everything you need to know about VEDARC AI Suite
          </p>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button
                className={`faq-question ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <motion.div
                  className="faq-icon"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 