import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import './AccountPage.css';

const AccountPage = () => {
  const { user, setUser } = useAuth(); // Get user and setter from context

  // State for profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  // const [selectedFile, setSelectedFile] = useState(null); // No longer needed
  // const [previewSource, setPreviewSource] = useState(''); // No longer needed for preview
  const [profilePictureUrl, setProfilePictureUrl] = useState(''); // State for URL input

  // State for password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Populate form with user data on load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfilePictureUrl(user.profilePictureUrl || ''); // Populate URL input
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileMessage('');

    // Send plain JSON object now, including the URL
    const updateData = {
      name,
      email,
      profilePictureUrl // Send the URL string
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json', // Back to JSON
        }
      };
      const { data } = await apiClient.put('/users/profile', updateData, config);

      if (data.success) {
        setProfileMessage('Profile updated successfully!');
        // Update user context with the data returned from the backend
        // Ensure AuthContext's setUser merges correctly or replaces the user object
        setUser(prevUser => ({
            ...prevUser, // Keep existing fields like token
            ...data.data // Overwrite with updated data (name, email, profilePictureUrl)
        }));
        // Update localStorage as well
        const updatedUserInfo = { ...user, ...data.data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

      } else {
        setProfileError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Error updating profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await apiClient.put('/users/profile/password', { currentPassword, newPassword }, config);

      if (data.success) {
        setPasswordMessage('Password updated successfully!');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Error updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };


  if (!user) {
    return <p>Please log in to view your account.</p>; // Or redirect
  }

  return (
    <div className="account-page">
      <h1>My Account</h1>

      {/* Profile Update Form */}
      <section className="account-section">
        <h2>Profile Information</h2>

        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <img
            src={profilePictureUrl || 'https://via.placeholder.com/100'} // Show current URL or placeholder
            alt="Profile"
            className="profile-picture-preview"
          />
          {/* Removed file input button */}
        </div>

         {/* Add input field for Profile Picture URL */}
         <div className="form-group">
            <label htmlFor="account-picture-url">Profile Picture URL</label>
            <input
              type="url" // Use type="url" for basic validation
              id="account-picture-url"
              placeholder="https://example.com/image.jpg"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
            />
          </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label htmlFor="account-name">Name</label>
            <input
              type="text"
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="account-email">Email</label>
            <input
              type="email"
              id="account-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {profileError && <p className="error-message">{profileError}</p>}
          {profileMessage && <p className="success-message">{profileMessage}</p>}
          <button type="submit" className="btn-update" disabled={profileLoading}>
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Password Update Form */}
      <section className="account-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          {passwordMessage && <p className="success-message">{passwordMessage}</p>}
          <button type="submit" className="btn-update" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AccountPage;
