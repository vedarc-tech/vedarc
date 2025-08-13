import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProXDemo.css';

const ProXDemo = () => {
  const [activeDomain, setActiveDomain] = useState('overview');
  const [selectedFeature, setSelectedFeature] = useState(null);

  const domains = {
    business: {
      name: 'Business & Enterprise Operations',
      color: '#d4af37',
      icon: 'business',
      features: [
        'CRM & Sales Management',
        'HR & Recruitment Manager',
        'Employee Performance Analytics',
        'Payroll & Compliance Automation',
        'Team Collaboration Tools',
        'Project & Resource Planning',
        'Customer Support AI Agent'
      ]
    },
    education: {
      name: 'Academic & Education',
      color: '#d4af37',
      icon: 'education',
      features: [
        'ERP Integration',
        'AI Study Assistant',
        'Assignment Tracker',
        'Smart Exam Prep Planner',
        'Interactive Learning Modules',
        'Event & Club Management',
        'Career Guidance'
      ]
    },
    research: {
      name: 'Research & Innovation',
      color: '#d4af37',
      icon: 'research',
      features: [
        'Automated Literature Review',
        'Research Collaboration Hub',
        'Citation & Reference Management',
        'Grant & Funding Finder',
        'AI-Assisted Experiment Design',
        'Paper Drafting Assistant',
        'Plagiarism Checker'
      ]
    },
    productivity: {
      name: 'Personal Productivity & Lifestyle',
      color: '#d4af37',
      icon: 'productivity',
      features: [
        'Daily Task Management',
        'Finance & Expense Tracker',
        'Wellness & Habit Coaching',
        'Travel & Scheduling Assistant',
        'Content Creation Help'
      ]
    },
    seo: {
      name: 'SEO & Digital Marketing',
      color: '#d4af37',
      icon: 'seo',
      features: [
        'SEO Planner',
        'Content Assistant',
        'Competitor Analyzer',
        'Keyword Research',
        'Performance Tracking',
        'Campaign Optimization',
        'Analytics Dashboard'
      ]
    },
    developer: {
      name: 'Developer Tools',
      color: '#d4af37',
      icon: 'developer',
      features: [
        'Code Explainer',
        'Bug Detection',
        'API Documentation Helper',
        'Code Review Assistant',
        'Testing Automation',
        'Performance Profiling',
        'Security Scanner'
      ]
    }
  };

  const renderDomainIcon = (iconType) => {
    switch (iconType) {
      case 'business':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L10 2L4 7V20H20V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 20V12H8V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'education':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 10V6L12 1L2 6V10L12 15L22 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10V16L12 19L18 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'research':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2V6H15V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 20V4H8V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'productivity':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'seo':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9L12 6L16 10L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 5V15H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'developer':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 6L3 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6L21 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3L14 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const renderDomainDashboard = (domainKey) => {
    const domain = domains[domainKey];
    
    return (
      <motion.div
        key={domainKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="domain-dashboard"
        style={{ borderColor: domain.color }}
      >
        <div className="dashboard-header">
          <div className="domain-title-section">
            <div className="domain-icon">{renderDomainIcon(domain.icon)}</div>
            <h2>{domain.name}</h2>
          </div>
          <div className="dashboard-stats">
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="feature-grid">
            {domain.features.map((feature, index) => (
                             <motion.div
                 key={index}
                 className="feature-card"
                 whileHover={{ scale: 1.02, y: -5 }}
                 whileTap={{ scale: 0.98 }}
               >
                <div className="feature-header">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>{feature}</h3>
                </div>
                <p>AI-powered automation and intelligent insights</p>
                
              </motion.div>
            ))}
          </div>
          
                     <div className="dashboard-widgets">
           </div>
        </div>
      </motion.div>
    );
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overview-section"
    >
      <div className="hero-section">
        <div className="hero-content">
          <h1>ProX: Multi-Domain AI Productivity Suite</h1>
          <p>Experience the future of productivity with our interconnected AI-powered platform that seamlessly integrates business, education, research, and personal productivity domains.</p>
          <div className="hero-actions">
          </div>
        </div>
        
        <div className="core-engine-visualization">
          <div className="ai-core">
            <div className="core-circle">
              <div className="core-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2L20.09 10.26L28 11.27L22.5 17.14L23.59 23.02L16 20.77L8.41 23.02L9.5 17.14L4 11.27L11.91 10.26L16 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span>AI CORE</span>
            </div>
            <div className="core-connections">
              {Object.keys(domains).map((domainKey, index) => (
                <motion.div
                  key={domainKey}
                  className="domain-connection"
                  style={{
                    '--rotation': `${(index * 90)}deg`,
                    '--domain-color': domains[domainKey].color
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="connection-line"></div>
                  <div className="domain-node">
                    {renderDomainIcon(domains[domainKey].icon)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="domain-cards">
        {Object.entries(domains).map(([key, domain]) => (
          <motion.div
            key={key}
            className="domain-card"
            style={{ borderColor: domain.color }}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={() => setActiveDomain(key)}
          >
            <div className="domain-card-header">
              <div className="domain-card-icon">{renderDomainIcon(domain.icon)}</div>
              <h3>{domain.name}</h3>
            </div>
            <p>AI-powered tools and insights for {key} operations</p>
            <div className="domain-features-preview">
              {domain.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="feature-tag">{feature}</span>
              ))}
            </div>
            
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="prox-demo">
      <div className="demo-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
            </div>
            <h1>ProX (Demo)</h1>
          </div>
          <div className="header-actions">
            <button className="demo-btn secondary">Documentation</button>
          </div>
        </div>
      </div>

      <div className="demo-navigation">
        <button
          className={`nav-btn ${activeDomain === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveDomain('overview')}
        >
          Overview
        </button>
        {Object.keys(domains).map((domainKey) => (
          <button
            key={domainKey}
            className={`nav-btn ${activeDomain === domainKey ? 'active' : ''}`}
            onClick={() => setActiveDomain(domainKey)}
          >
            {domains[domainKey].name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="demo-content">
        {activeDomain === 'overview' ? renderOverview() : renderDomainDashboard(activeDomain)}
      </div>


    </div>
  );
};

export default ProXDemo; 