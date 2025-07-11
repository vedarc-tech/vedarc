import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './Notification.css';

export default function Notification({ message, type = 'success' }) {
  return (
    <div className={`global-notification ${type}`}> 
      <span className="icon">
        {type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
      </span>
      <span className="message">{message}</span>
    </div>
  );
} 