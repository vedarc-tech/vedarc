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
              Refund and Cancellation Policy
            </h1>
            <p className="policy-date">Last updated: 20-06-2025</p>

            <div className="policy-section">
              <h3>1. Services</h3>
              <ul>
                <li>Once a service has been initiated, no refund will be provided unless stated in a signed agreement.</li>
                <li>In case of cancellation before project kick-off, partial refund may be considered based on effort already invested.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>2. Digital Products</h3>
              <ul>
                <li>All sales of digital products are final. No refund will be given for any downloadable products unless the file is defective and we are unable to replace it.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>3. Internship Payments</h3>
              <ul>
                <li>Any fees paid towards certificate issuance or training modules are non-refundable.</li>
                <li>If a student drops out or fails to complete the internship, no refund will be provided.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>4. Contact for Issues</h3>
              <p>
                If you believe a refund is applicable based on a specific agreement or exceptional case, please email: <a href="mailto:tech@vedarc.co.in">tech@vedarc.co.in</a> with full details.
              </p>
            </div>

            <div className="policy-section">
              <h3>5. Contact Us</h3>
              <p>
                If you have any questions about this Refund and Cancellation Policy, please contact us at:
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