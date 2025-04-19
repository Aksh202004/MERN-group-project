import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPromptModal.css'; // We'll create this CSS file next

const AuthPromptModal = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) {
    return null; // Don't render anything if the modal shouldn't be shown
  }

  const handleLoginClick = () => {
    onClose(); // Close the modal
    navigate('/login'); // Navigate to login page
  };

  const handleRegisterClick = () => {
    onClose(); // Close the modal
    navigate('/register'); // Navigate to register page
  };

  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // The modal backdrop (semi-transparent background)
    <div className="modal-backdrop" onClick={onClose}>
      {/* The modal content itself */}
      <div className="modal-content" onClick={handleModalContentClick}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>Login Required</h2>
        <p>Please log in or create an account to play podcasts.</p>
        <div className="modal-actions">
          <button onClick={handleLoginClick} className="btn btn-primary">Login</button>
          <button onClick={handleRegisterClick} className="btn btn-secondary">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
