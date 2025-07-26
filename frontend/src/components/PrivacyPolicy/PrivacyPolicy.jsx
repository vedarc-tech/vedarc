import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './PrivacyPolicy.css';

function PrivacyPolicy({ isVisible, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOutsideClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <>
    <AnimatePresence>
      {isVisible && (
        <div
          className="terms-modal-overlay"
          onClick={handleOutsideClick}
          ref={overlayRef}
        >
          <motion.div
            className="terms-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
          >
            <motion.button
              className="close-button"
              onClick={onClose}
              whileHover={{ scale: 1.1, color: 'var(--neon-magenta)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            >
              <FaTimes />
            </motion.button>

            <div className="terms-content">
              <h2 id="terms-title" className="terms-title">
                <span className="highlight">VEDARC TECHNOLOGIES PRIVATE LIMITED</span>
                <br />
                Privacy Policy
              </h2>
              <p className="terms-date">Last updated: 2024</p>

              <div className="terms-section">
                <p>
                  At VEDARC TECHNOLOGIES PRIVATE LIMITED ("VEDARC", "Company", "we", "our", or "us"), your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="http://www.vedarc.co.in" target="_blank" rel="noopener noreferrer">www.vedarc.co.in</a>, use our services, or interact with us in any other way.
                </p>
                <p>
                  By accessing our website or using our services, you agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </div>

              <div className="terms-section">
                <h3>1. Information We Collect</h3>
                <p>We may collect the following types of information:</p>
                
                <h4>a) Personal Information</h4>
                <ul>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Address</li>
                  <li>Educational details (for internship applicants)</li>
                  <li>Payment details (when applicable)</li>
                </ul>

                <h4>b) Non-Personal Information</h4>
                <ul>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>IP address</li>
                  <li>Cookies and usage data</li>
                  <li>Pages visited, time spent, and interactions with the website</li>
                </ul>
              </div>

              <div className="terms-section">
                <h3>2. How We Use Your Information</h3>
                <p>We use the information collected to:</p>
                <ul>
                  <li>Provide, operate, and maintain our website and services</li>
                  <li>Communicate with you regarding your queries, projects, internships, or transactions</li>
                  <li>Process payments and generate invoices</li>
                  <li>Issue internship certificates and Letters of Recommendation (if applicable)</li>
                  <li>Improve user experience and website functionality</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div className="terms-section">
                <h3>3. Data Sharing and Disclosure</h3>
                <p>We <strong>do not sell or rent</strong> your personal information. We may share your information only in the following circumstances:</p>
                <ul>
                  <li>With service providers involved in operating our business (e.g., hosting providers, payment processors)</li>
                  <li>When required by law, regulation, or legal process</li>
                  <li>To protect the rights, property, or safety of VEDARC, our clients, or others</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>

              <div className="terms-section">
                <h3>4. Cookies and Tracking Technologies</h3>
                <p>
                  Our website may use cookies and similar tracking technologies to enhance user experience. You can control or disable cookies through your browser settings. However, disabling cookies may affect some features of the website.
                </p>
              </div>

              <div className="terms-section">
                <h3>5. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal data. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                </p>
              </div>

              <div className="terms-section">
                <h3>6. Retention of Data</h3>
                <p>
                  We retain your personal data only as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements.
                </p>
              </div>

              <div className="terms-section">
                <h3>7. Your Rights</h3>
                <p>You may have the right to:</p>
                <ul>
                  <li>Access, correct, or delete your personal data</li>
                  <li>Object to or restrict processing</li>
                  <li>Withdraw consent (where processing is based on consent)</li>
                  <li>Lodge a complaint with a data protection authority</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us at <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a>.
                </p>
              </div>

              <div className="terms-section">
                <h3>8. Children's Privacy</h3>
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal data, we will delete it immediately.
                </p>
              </div>

              <div className="terms-section">
                <h3>9. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. The updated version will be posted on our website with the "Last updated" date. Continued use of the website after any such changes constitutes your acceptance of the new Privacy Policy.
                </p>
              </div>

              <div className="terms-section">
                <h3>10. Contact Us</h3>
                <p>
                  If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="contact-info">
                  <p><strong>Email:</strong> <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a></p>
                  <p><strong>Phone:</strong> +91 8897140410</p>
                  <p><strong>Address:</strong> Flat No 102, Moon Rock, Placido, Sri Ram Nagar, Manikonda, Hyderabad, Telangana – 500089</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

export default PrivacyPolicy; 