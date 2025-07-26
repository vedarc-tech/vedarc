import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './RefundAndCancellationPolicy.css';

function RefundAndCancellationPolicy({ isVisible, onClose }) {
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
              </h2>
                <p className="terms-date">Last updated: 2024</p>

                <div className="terms-section">
                  <h3>Refund and Cancellation Policy</h3>

                  <h4>1. Services</h4>
                  <ul>
                    <li>Once a service has been initiated, no refund will be provided unless stated in a signed agreement.</li>
                    <li>In case of cancellation before project kick-off, partial refund may be considered based on effort already invested.</li>
                  </ul>

                  <h4>2. Digital Products</h4>
                  <ul>
                    <li>All sales of digital products are final. No refund will be given for any downloadable products unless the file is defective and we are unable to replace it.</li>
                  </ul>

                  <h4>3. Internship Payments</h4>
                  <ul>
                    <li>Any fees paid towards certificate issuance or training modules are non-refundable.</li>
                    <li>If a student drops out or fails to complete the internship, no refund will be provided.</li>
                  </ul>

                  <h4>4. Contact for Issues</h4>
                  <p>
                    If you believe a refund is applicable based on a specific agreement or exceptional case, please email: support@vedarc.co.in with full details.
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


export default RefundAndCancellationPolicy;