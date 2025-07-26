import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './RefundPolicy.css';

function RefundPolicy() {
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
              VEDARC AI Suite - Refund and Cancellation Policy
            </h1>
            <p className="policy-date">Last updated: June 2025</p>

            <div className="policy-section">
              <h3>1. Subscription Cancellations</h3>
              <ul>
                <li>You may cancel your VEDARC AI Suite subscription at any time through your account settings.</li>
                <li>Cancellation will take effect at the end of your current billing period.</li>
                <li>No refunds will be provided for the current billing period upon cancellation.</li>
                <li>You will retain access to paid features until the end of your billing period.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>2. AI Service Usage</h3>
              <ul>
                <li>AI service usage is non-refundable once consumed.</li>
                <li>Unused AI credits or tokens within a billing period are non-refundable.</li>
                <li>Service interruptions due to technical issues may be compensated with extended access time.</li>
                <li>We do not provide refunds for AI-generated content that meets our service standards.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>3. Platform Access and Features</h3>
              <ul>
                <li>Access to VEDARC AI Suite features is provided as-is during your subscription period.</li>
                <li>No refunds are provided for feature changes or updates during your subscription.</li>
                <li>Downtime compensation is provided as extended access time, not monetary refunds.</li>
                <li>Beta features are provided without warranty and are non-refundable.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>4. Payment Processing Issues</h3>
              <ul>
                <li>If payment processing fails, we will attempt to retry the payment.</li>
                <li>Service may be suspended until payment issues are resolved.</li>
                <li>No refunds are provided for payment processing fees.</li>
                <li>Disputed charges may result in account suspension pending resolution.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>5. Exceptional Circumstances</h3>
              <ul>
                <li>Refunds may be considered in cases of extended service outages (24+ hours).</li>
                <li>Billing errors will be corrected with appropriate refunds or credits.</li>
                <li>Duplicate charges will be refunded immediately upon verification.</li>
                <li>Refunds for exceptional circumstances are processed within 5-7 business days.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>6. Refund Processing</h3>
              <ul>
                <li>Approved refunds are processed to the original payment method.</li>
                <li>Refund processing time depends on your payment provider (typically 5-10 business days).</li>
                <li>We will provide confirmation when refunds are processed.</li>
                <li>Refunds may be provided as account credits at our discretion.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>7. Account Termination</h3>
              <ul>
                <li>We may terminate accounts for Terms of Service violations without refund.</li>
                <li>Voluntary account deletion is permanent and non-refundable.</li>
                <li>Data deletion requests are processed within 30 days of account termination.</li>
                <li>Terminated accounts lose access to all services immediately.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>8. Contact for Refund Requests</h3>
              <p>
                To request a refund or discuss billing issues, please contact our support team:
                <br />
                <strong>Email:</strong> <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a>
                <br />
                <strong>Subject Line:</strong> "Refund Request - [Your Account Email]"
                <br />
                Please include your account email, subscription details, and reason for the refund request.
              </p>
            </div>

            <div className="policy-section">
              <h3>9. Contact Information</h3>
              <p>
                For questions about this Refund and Cancellation Policy or VEDARC AI Suite billing, please contact us:
                <br />
                <strong>Email:</strong> <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a> | <strong>Phone:</strong> +91 8897140410
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

export default RefundPolicy; 