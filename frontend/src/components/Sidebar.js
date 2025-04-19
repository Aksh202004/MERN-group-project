import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { IoHomeOutline, IoLibraryOutline, IoSearchOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { listeningHistory, playTrack, resetPlayer, clearListeningHistory } = usePlayer();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const navigate = useNavigate(); // Hook for navigation

  // Handlers for user menu hover
  const showUserMenu = () => setIsUserMenuOpen(true);
  const hideUserMenu = () => setIsUserMenuOpen(false);

  const handleLogout = () => {
    logout(); // Clears auth state
    resetPlayer(); // Clears player state
    clearListeningHistory(); // Clears history state and localStorage
    hideUserMenu(); // Close user menu
    // Optional: navigate('/login'); // Or let App structure handle redirect
  };

  // Handlers for guest menu hover
  const showGuestMenu = () => setIsGuestMenuOpen(true);
  const hideGuestMenu = () => setIsGuestMenuOpen(false);

  // Function to handle search submission (e.g., on Enter key)
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      console.log('Navigating to search for:', searchTerm);
      // Navigate to a search results page (we'll create this next)
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Clear input after search
    }
  };

  return (
    <aside className="sidebar">
      {/* Top section (Logo, Search, Nav) */}
      <div>
        <div className="sidebar-logo">
          <Link to="/">Podcastr</Link> {/* Or use an actual logo image */}
        </div>
        <div className="sidebar-search">
          <IoSearchOutline />
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch} // Trigger search on Enter
          />
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/">
                <IoHomeOutline />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/library"> {/* Assuming a library route */}
                <IoLibraryOutline />
                <span>Your Library</span>
              </Link>
            </li>
            {/* Add more navigation items if needed */}
          </ul>
        </nav>

        {/* Recently Listened Section */}
        {isAuthenticated && listeningHistory.length > 0 && ( // Only show if logged in
          <div className="sidebar-recent">
            <h4>Recently Listened</h4>
            <ul>
              {listeningHistory.slice(0, 3).map((track) => (
                <li key={track._id}>
                  <button
                    className="recent-track-button"
                    onClick={() => playTrack(track)}
                    title={`Play ${track.title}`}
                  >
                    {track.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Add playlist section or other elements if needed */}
      </div>

      {/* Bottom section (User Profile or Guest) */}
      <div className="sidebar-footer">
        {isAuthenticated && user ? (
          // Logged-in User Section
          <div
            className="sidebar-user-info-container"
            onMouseEnter={showUserMenu}
            onMouseLeave={hideUserMenu}
          >
            <div className="sidebar-user-info">
              {/* Conditionally render image or placeholder */}
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.name} className="sidebar-user-avatar" />
              ) : (
                <div className="sidebar-user-avatar-placeholder">{user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
              )}
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user.name}</span>
                {/* Optionally truncate email */}
                <span className="sidebar-user-email" title={user.email}>{user.email}</span>
              </div>
            </div>
            {isUserMenuOpen && (
              <div className="sidebar-user-dropdown">
                <Link to="/account" className="sidebar-dropdown-item" onClick={hideUserMenu}>My Account</Link>
                <Link to="/settings" className="sidebar-dropdown-item" onClick={hideUserMenu}>Settings</Link>
                <button onClick={handleLogout} className="sidebar-dropdown-item sidebar-dropdown-button">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          // Guest Section
          <div
            className="sidebar-guest-info-container" // Container for hover and positioning
            onMouseEnter={showGuestMenu}
            onMouseLeave={hideGuestMenu}
          >
            <div className="sidebar-guest-info">
              <div className="sidebar-user-avatar-placeholder">G</div>
              <span>Guest</span>
            </div>
            {isGuestMenuOpen && (
              <div className="sidebar-guest-dropdown">
                <Link to="/register" className="sidebar-dropdown-item" onClick={hideGuestMenu}>Register</Link>
                <Link to="/login" className="sidebar-dropdown-item" onClick={hideGuestMenu}>Sign In</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
