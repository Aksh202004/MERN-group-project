import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoPlay,
  IoPause,
  IoVolumeMediumOutline,
  IoHeartOutline, // Add heart icons
  IoHeart
} from 'react-icons/io5';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import apiClient from '../api/axiosConfig'; // Import apiClient
import './TopBar.css';

const TopBar = () => {
  const {
    currentTrack, // Contains the currently playing podcast object
    isPlaying,
    togglePlay,
    seekTime,
    setVolume,
    volume,
    currentTime,
    duration,
    formattedCurrentTime,
    formattedDuration,
  } = usePlayer();
  const {
    user,
    isAuthenticated,
    likedPodcastIds,
    // addLikedPodcastId, // No longer used directly here
    // removeLikedPodcastId, // No longer used directly here
    setLikedPodcastsList // Import the new function
  } = useAuth(); // Get auth context
  const navigate = useNavigate(); // Hook for navigation

  // Determine if the current track is liked
  const isLiked = currentTrack && isAuthenticated && likedPodcastIds.includes(currentTrack._id);

  const handleProgressChange = (e) => {
    seekTime(Number(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
  };

  // Handle like/unlike button click for the current track
  const handleLikeToggle = async (e) => {
    e.preventDefault(); // Prevent potential side-effects if inside a link

    if (!isAuthenticated || !user?.token) {
      navigate('/login');
      return;
    }
    // Use currentTrack._id which should be the episode ID (Listen Notes ID) or Mongo ID
    if (!currentTrack?._id) return; // No track to like/unlike

    const idToLike = currentTrack._id;
    // Determine if it's external based on ID format (heuristic)
    // Note: This assumes episode IDs from Listen Notes are also long strings.
    const isExternal = typeof idToLike === 'string' && idToLike.length > 20;

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const url = `/users/${isLiked ? 'unlike' : 'like'}/${idToLike}`;
    let requestBody = {};

    // If liking an external track/podcast, include its details
    // We use currentTrack details (which might be episode details)
    if (!isLiked && isExternal) {
       // We need the podcast details here, not just episode.
       // This approach is flawed for the TopBar like button as currentTrack holds episode data.
       // Liking from the player should ideally like the *podcast*, not the episode.
       // For now, let's send what we have, but this needs refinement.
       // A better approach would be to ensure currentTrack also holds the parent podcast's ID and details.
       console.warn("Liking from TopBar might send episode details instead of podcast details. Needs refinement.");
       requestBody = {
         title: currentTrack.podcastTitle || currentTrack.title, // Prefer podcast title if available
         image: currentTrack.image, // Use track image
         publisherName: currentTrack.creator?.name || 'Unknown Artist' // Use creator name
       };
    }


    try {
      // Make API call to like or unlike, include body if needed
      const { data } = await apiClient.put(url, requestBody, config);

      if (data.success && Array.isArray(data.data)) {
        // Update the AuthContext with the full list of liked IDs from the backend
        setLikedPodcastsList(data.data);
      } else {
        console.error('Failed to toggle like status:', data.message);
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    }
  };

  // Render nothing or a placeholder if no track is selected
  if (!currentTrack) {
    return (
      <header className="top-bar top-bar-empty">
        {/* Keep the structure for layout consistency if needed, or just show text */}
         <div className="top-bar-track-info"></div>
         <div className="top-bar-center-controls">
            {/* Placeholder for controls */}
         </div>
         <div className="top-bar-right-controls"></div>
      </header>
    );
  }

  // Render the full player bar
  return (
    <header className="top-bar">
      {/* Left Section: Track Info */}
      <div className="top-bar-track-info">
        {currentTrack.image ? ( // Changed from coverImageUrl to image
          <img src={currentTrack.image} alt={currentTrack.title || 'Podcast Cover'} className="top-bar-track-cover" /> // Changed from coverImageUrl to image
        ) : (
          <div className="top-bar-track-cover-placeholder"></div>
        )}
        <div className="top-bar-track-details">
          {/* Display episode title if available (from context), else podcast title */}
          <span className="top-bar-track-title">{currentTrack.title || 'Unknown Title'}</span>
          {/* Display podcast title (if available from context) or creator name */}
          <span className="top-bar-track-episode">{currentTrack.podcastTitle || currentTrack.creator?.name || 'Unknown Artist'}</span>
        </div>
      </div>

      {/* Center Section: Player Controls & Progress */}
      <div className="top-bar-center-controls">
        <div className="player-buttons">
          {/* TODO: Implement skip logic */}
          <button className="player-control-button skip-button" title="Previous"><IoPlaySkipBack /></button>
          <button className="player-play-button" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <IoPause /> : <IoPlay />}
          </button>
          {/* TODO: Implement skip logic */}
          <button className="player-control-button skip-button" title="Next"><IoPlaySkipForward /></button>
        </div>
        <div className="player-progress-container">
          <span className="player-time current-time">{formattedCurrentTime}</span>
          <input
            type="range"
            className="player-progress-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!duration}
            style={{ '--progress': `${(currentTime / duration) * 100 || 0}%` }} // For styling the track fill
          />
          <span className="player-time duration">{formattedDuration}</span>
        </div>
      </div>

      {/* Right Section: Like & Volume */}
      <div className="top-bar-right-controls">
        {/* Re-enabled like button, show if track ID exists and user is authenticated */}
        {isAuthenticated && currentTrack?._id && (
          <button
            className={`player-control-button like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            title={isLiked ? 'Unlike' : 'Like'}
            // disabled={!isAuthenticated} // Already checked isAuthenticated above
          >
            {isLiked ? <IoHeart /> : <IoHeartOutline />}
          </button>
        )}
        <IoVolumeMediumOutline className="volume-icon"/>
        <input
          type="range"
          className="player-volume-slider"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          style={{ '--volume': `${volume * 100}%` }} // For styling the track fill
        />
      </div>
    </header>
  );
};

export default TopBar;
