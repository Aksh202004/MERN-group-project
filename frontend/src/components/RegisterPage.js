import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import './AuthForm.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Get register function from context
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password); // Call register function from context
      alert('Registration successful! Please login.');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError(err.message || 'Registration failed'); // Use error message from context/API call
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container"> {/* Centering container */}
      <div className="auth-form-container">
        <h2>Register</h2>
        <p className="auth-subtitle">Create a new account to get started</p>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>} {/* Display error */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label> {/* Simplified label */}
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label> {/* Simplified label */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label> {/* Simplified label */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label> {/* Simplified label */}
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            minLength="6"
          />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-links">
           <p>Already have an account? <Link to="/login">Login</Link></p>
           <Link to="/" className="back-link">Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
