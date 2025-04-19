import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import './AuthForm.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password); // Call login function from context
      navigate('/'); // Redirect on success (handled by context now)
    } catch (err) {
      setError(err.message || 'Login failed'); // Use error message from context/API call
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container"> {/* Centering container */}
      <div className="auth-form-container">
        <h2>Login</h2>
        <p className="auth-subtitle">Enter your credentials to access your account</p>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>} {/* Display error */}
        <form onSubmit={handleSubmit} className="auth-form">
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
          />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="auth-links">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
          <Link to="/" className="back-link">Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
