import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './TermsAndConditions.css';

function TermsAndCondition({ isVisible, onClose }) {
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

            {/* --- CONTENT GOES HERE (unchanged) --- */}
            <div className="terms-content">
              <h2 id="terms-title" className="terms-title">
                <span className="highlight">VEDARC TECHNOLOGIES PRIVATE LIMITED</span>
                <br />
                Website Terms and Conditions of Use
              </h2>
              {/* ... rest of the content ... */}
                <p className="terms-date">Last updated: 20-06-2025</p>

                <div className="terms-section">
                  <h3>1. Introduction</h3>
                  <p>
                    Welcome to VEDARC TECHNOLOGIES PRIVATE LIMITED (“Company”, “we”, “our”, or “us”). These Terms and Conditions (“Terms”) govern your use of our website (www.vedarc.co.in) and any services, content, and products available through it.
                    By accessing or using the website, you agree to be bound by these Terms. If you do not agree, please do not use our website.
                  </p>
                </div>

                <div className="terms-section">
                  <h3>2. Definitions</h3>
                  <ul>
                    <li>“User” refers to any individual or entity who accesses or uses the website.</li>
                    <li>“Services” include all digital services provided by VEDARC, including software solutions, web development, internship offerings, and digital products.</li>
                    <li>“Client” refers to any individual, company, or organization purchasing services from VEDARC.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>3. Use of Website</h3>
                  <ul>
                    <li>You agree not to use the website for any unlawful purpose.</li>
                    <li>You may not copy, modify, distribute, or exploit any part of our website or services without written permission.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>4. Intellectual Property</h3>
                  <p>
                    All content on this website including logos, graphics, text, images, software, and design is the intellectual property of VEDARC TECHNOLOGIES PRIVATE LIMITED. Unauthorized use is strictly prohibited.
                  </p>
                </div>

                <div className="terms-section">
                  <h3>5. Service Terms</h3>
                  <ul>
                    <li>All service requests must be submitted in writing.</li>
                    <li>We reserve the right to accept or reject any project based on feasibility and internal policies.</li>
                    <li>Project timelines and deliverables will be discussed and confirmed in a written agreement or email before the start of work.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>6. Payment Terms</h3>
                  <ul>
                    <li>Invoices must be paid in full as per the agreed schedule before the release of deliverables.</li>
                    <li>All payments are non-refundable unless explicitly stated in a signed agreement.</li>
                    <li>We reserve the right to suspend or terminate services for delayed or incomplete payments.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>7. Internships</h3>
                  <ul>
                    <li>Internships offered by VEDARC are subject to availability and selection criteria.</li>
                    <li>Participation in our internship programs does not guarantee employment.</li>
                    <li>Completion certificates and LORs (if applicable) are issued only upon successful completion of all deliverables, tasks and payment (if required).</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>8. Limitation of Liability</h3>
                  <ul>
                    <li>We are not responsible for any direct, indirect, incidental, or consequential damages resulting from your use of the website or services.</li>
                    <li>We do not guarantee uninterrupted access to the website or error-free content.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h3>9. External Links</h3>
                  <p>
                    Our website may contain links to third-party sites. We are not responsible for the content, privacy policies, or practices of any third-party website or service.
                  </p>
                </div>

                <div className="terms-section">
                  <h3>10. Changes to Terms</h3>
                  <p>
                    We reserve the right to update or modify these Terms at any time. Changes will be effective upon posting on the website. Continued use of the site constitutes your acceptance of those changes.
                  </p>
                </div>

                <div className="terms-section">
                  <h3>11. Governing Law</h3>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the jurisdiction of the courts in Hyderabad, Telangana.
                  </p>
                </div>

                <div className="terms-section">
                  <h3>12. Contact Us</h3>
                  <p>
                    If you have any questions about these Terms, please contact us at:
                    <br />
                    <strong>Email:</strong> tech@vedarc.co.in | <strong>Phone:</strong> +91 8897140410
                    <br />
                    <strong>Address:</strong> Flat No 102, Moon Rock, Placido, Sri Ram Nagar, Manikonda, Hyderabad, Telangana – 500089
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


export default TermsAndCondition;