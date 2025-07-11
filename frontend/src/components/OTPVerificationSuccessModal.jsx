import React, { useRef } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import './OTPVerificationSuccessModal.css';

export default function OTPVerificationSuccessModal({ onClose }) {
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div className="otp-success-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="otp-success-modal">
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className="icon-wrapper">
          <FaCheckCircle />
        </div>
        <h2>Application Submitted Successfully!</h2>
        <p>We will contact you soon.<br />Thank you for verifying your details.</p>
      </div>
    </div>
  );
} 