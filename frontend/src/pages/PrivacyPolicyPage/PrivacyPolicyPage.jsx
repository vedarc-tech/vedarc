import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './PrivacyPolicyPage.css';

function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <motion.div 
        className="policy-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="policy-container">
          <div className="policy-content">
            <h1 className="policy-title">
              <span className="highlight">VEDARC TECHNOLOGIES PRIVATE LIMITED</span>
              <br />
              VEDARC AI Suite - Privacy Policy
            </h1>
            <p className="policy-date">Last updated: June 2025</p>

            <div className="policy-section">
              <p>
                At VEDARC TECHNOLOGIES PRIVATE LIMITED ("VEDARC", "Company", "we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use VEDARC AI Suite, our AI-powered platform available at <a href="http://www.vedarc.co.in" target="_blank" rel="noopener noreferrer">www.vedarc.co.in</a>.
              </p>
              <p>
                
                By using VEDARC AI Suite, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </div>

            <div className="policy-section">
              <h3>1. Information We Collect</h3>
              
              <h4>a) Account Information</h4>
              <ul>
                <li>Name, email address, and phone number</li>
                <li>Account credentials and authentication data</li>
                <li>Subscription and billing information</li>
                <li>Profile preferences and settings</li>
              </ul>

              <h4>b) AI Interaction Data</h4>
              <ul>
                <li>Input data provided to AI agents and tools</li>
                <li>AI-generated responses and outputs</li>
                <li>Usage patterns and interaction history</li>
                <li>Feature preferences and customization data</li>
              </ul>

              <h4>c) Technical Information</h4>
              <ul>
                <li>Device information (browser, operating system, device type)</li>
                <li>IP address and location data</li>
                <li>Usage analytics and performance metrics</li>
                <li>Error logs and diagnostic information</li>
              </ul>

              <h4>d) Cookies and Tracking</h4>
              <ul>
                <li>Session cookies for authentication</li>
                <li>Analytics cookies for platform improvement</li>
                <li>Preference cookies for user experience</li>
                <li>Security cookies for fraud prevention</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>Provide, maintain, and improve VEDARC AI Suite functionality</li>
                <li>Process AI requests and generate responses</li>
                <li>Personalize your experience and recommendations</li>
                <li>Process payments and manage subscriptions</li>
                <li>Improve AI models and platform performance</li>
                <li>Provide customer support and technical assistance</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and regulations</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>3. AI Data Processing and Model Training</h3>
              <ul>
                <li>Your interactions with AI agents may be used to improve our models</li>
                <li>We implement data anonymization and aggregation techniques</li>
                <li>Sensitive personal information is excluded from model training</li>
                <li>You can opt out of data usage for model improvement</li>
                <li>AI-generated content is processed to enhance service quality</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>4. Data Sharing and Disclosure</h3>
              <p>We <strong>do not sell</strong> your personal information. We may share data only in these circumstances:</p>
              <ul>
                <li>With AI model providers and cloud service partners (under strict data protection agreements)</li>
                <li>With payment processors for billing and subscription management</li>
                <li>With analytics providers for platform improvement (anonymized data only)</li>
                <li>When required by law, regulation, or legal process</li>
                <li>To protect the rights, property, or safety of VEDARC, users, or others</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>5. Data Security and Protection</h3>
              <ul>
                <li>We implement industry-standard encryption for data transmission and storage</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>Regular security audits and vulnerability assessments are conducted</li>
                <li>We maintain backup and disaster recovery procedures</li>
                <li>All third-party service providers must meet our security standards</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>6. Data Retention and Deletion</h3>
              <ul>
                <li>Account data is retained while your account is active</li>
                <li>AI interaction data is retained for 12 months for service improvement</li>
                <li>Billing information is retained for 7 years for legal compliance</li>
                <li>You can request data deletion through your account settings</li>
                <li>Data deletion requests are processed within 30 days</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>7. Your Privacy Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access, correct, or update your personal information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of data usage for AI model improvement</li>
                <li>Control cookie preferences through browser settings</li>
                <li>Lodge complaints with data protection authorities</li>
              </ul>
              <p>
                To exercise these rights, contact us at <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a>.
              </p>
            </div>

            <div className="policy-section">
              <h3>8. International Data Transfers</h3>
              <ul>
                <li>Your data may be processed in countries other than India</li>
                <li>We ensure adequate data protection measures for international transfers</li>
                <li>All data transfers comply with applicable data protection laws</li>
                <li>We use standard contractual clauses for data protection</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>9. Children's Privacy</h3>
              <p>
                VEDARC AI Suite is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that a child has provided us with personal data, we will delete it immediately.
              </p>
            </div>

            <div className="policy-section">
              <h3>10. Third-Party Services</h3>
              <ul>
                <li>Our platform may integrate with third-party AI services and tools</li>
                <li>Third-party services have their own privacy policies</li>
                <li>We are not responsible for third-party data practices</li>
                <li>We recommend reviewing third-party privacy policies</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>11. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy periodically. Material changes will be communicated via email or platform notification. Continued use of VEDARC AI Suite after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="policy-section">
              <h3>12. Contact Information</h3>
              <p>
                For questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="contact-info">
                <p><strong>Email:</strong> <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a></p>
                <p><strong>Phone:</strong> +91 8897140410</p>
                <p><strong>Address:</strong> Flat No 102, Moon Rock, Placido, Sri Ram Nagar, Manikonda, Hyderabad, Telangana – 500089</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

export default PrivacyPolicyPage; 