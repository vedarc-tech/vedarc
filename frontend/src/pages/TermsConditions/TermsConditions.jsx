import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './TermsConditions.css';

function TermsConditions() {
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
              VEDARC AI Suite - Terms and Conditions of Use
            </h1>
            <p className="policy-date">Last updated: June 2025</p>

            <div className="policy-section">
              <h3>1. Introduction</h3>
              <p>
                Welcome to VEDARC AI Suite ("Platform", "Service", "we", "our", or "us"), operated by VEDARC TECHNOLOGIES PRIVATE LIMITED. These Terms and Conditions ("Terms") govern your use of our AI-powered platform, including all AI agents, tools, services, and content available through vedarc.co.in.
              </p>
              <p>
                By accessing or using VEDARC AI Suite, you agree to be bound by these Terms. If you do not agree, please do not use our platform.
              </p>
            </div>

            <div className="policy-section">
              <h3>2. Definitions</h3>
              <ul>
                <li>"User" refers to any individual or entity who accesses or uses VEDARC AI Suite.</li>
                <li>"AI Suite" refers to our comprehensive AI platform including domain-specific AI agents, tools, and services.</li>
                <li>"AI Agents" refers to specialized AI models and tools designed for specific domains and use cases.</li>
                <li>"Content" includes all text, data, files, images, and information processed or generated through our platform.</li>
                <li>"Subscription" refers to any paid access plan to VEDARC AI Suite features.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>3. Platform Access and Use</h3>
              <ul>
                <li>You must be at least 18 years old to use VEDARC AI Suite, or have parental/guardian consent.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree not to use the platform for any unlawful, harmful, or malicious purposes.</li>
                <li>You may not attempt to reverse engineer, decompile, or modify any part of our AI systems.</li>
                <li>You may not use automated systems to access our platform without prior written consent.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>4. AI Services and Limitations</h3>
              <ul>
                <li>Our AI agents are designed to assist and augment human capabilities, not replace professional judgment.</li>
                <li>AI-generated content may contain inaccuracies and should be verified independently.</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated outputs.</li>
                <li>Users are responsible for reviewing and validating all AI-generated content before use.</li>
                <li>AI models may be updated or modified without prior notice to improve performance.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>5. Data and Privacy</h3>
              <ul>
                <li>All data processing is governed by our Privacy Policy and applicable data protection laws.</li>
                <li>You retain ownership of your input data, but grant us license to process it for service provision.</li>
                <li>We implement appropriate security measures to protect your data.</li>
                <li>AI-generated content may be used to improve our models unless you opt out.</li>
                <li>We do not sell your personal data to third parties.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>6. Intellectual Property</h3>
              <ul>
                <li>VEDARC AI Suite, including all AI models, algorithms, and platform technology, is our intellectual property.</li>
                <li>You retain rights to content you create using our platform, subject to these Terms.</li>
                <li>You may not copy, distribute, or commercialize our AI models or platform technology.</li>
                <li>Our trademarks, logos, and branding are protected and may not be used without permission.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>7. Subscription and Payment Terms</h3>
              <ul>
                <li>Subscription fees are billed in advance and are non-refundable except as stated in our Refund Policy.</li>
                <li>We reserve the right to modify pricing with 30 days' notice to existing subscribers.</li>
                <li>Failed payments may result in service suspension or termination.</li>
                <li>All payments are processed securely through authorized payment gateways.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>8. Acceptable Use Policy</h3>
              <ul>
                <li>You may not use our AI services to generate harmful, illegal, or inappropriate content.</li>
                <li>You may not attempt to manipulate or exploit our AI systems.</li>
                <li>You may not use our platform to violate any laws or regulations.</li>
                <li>You may not interfere with the platform's operation or other users' access.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>9. Service Availability</h3>
              <ul>
                <li>We strive to maintain 99.9% uptime but do not guarantee uninterrupted service.</li>
                <li>Scheduled maintenance will be announced in advance when possible.</li>
                <li>We are not liable for service interruptions due to factors beyond our control.</li>
                <li>Service levels may vary based on your subscription tier.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>10. Limitation of Liability</h3>
              <ul>
                <li>Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</li>
                <li>We are not liable for indirect, incidental, or consequential damages.</li>
                <li>We are not responsible for decisions made based on AI-generated content.</li>
                <li>Our liability is limited to the extent permitted by applicable law.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>11. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless VEDARC TECHNOLOGIES PRIVATE LIMITED from any claims, damages, or expenses arising from your use of VEDARC AI Suite or violation of these Terms.
              </p>
            </div>

            <div className="policy-section">
              <h3>12. Termination</h3>
              <ul>
                <li>You may cancel your subscription at any time through your account settings.</li>
                <li>We may terminate your access for violation of these Terms or non-payment.</li>
                <li>Upon termination, your access to the platform will cease immediately.</li>
                <li>Provisions relating to intellectual property, liability, and indemnification survive termination.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>13. Changes to Terms</h3>
              <p>
                We reserve the right to update these Terms at any time. Material changes will be communicated via email or platform notification. Continued use constitutes acceptance of updated Terms.
              </p>
            </div>

            <div className="policy-section">
              <h3>14. Governing Law and Disputes</h3>
              <p>
                These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana. We encourage resolution through good faith discussions before legal proceedings.
              </p>
            </div>

            <div className="policy-section">
              <h3>15. Contact Information</h3>
              <p>
                For questions about these Terms or VEDARC AI Suite, please contact us:
                <br />
                <strong>Email:</strong> tech@vedarc.co.in | <strong>Phone:</strong> +91 8897140410
                <br />
                <strong>Address:</strong> Flat No 102, Moon Rock, Placido, Sri Ram Nagar, Manikonda, Hyderabad, Telangana – 500089
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

export default TermsConditions; 