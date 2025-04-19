import React, { useState } from 'react';
// Removed Link import
import { useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoPlay, IoPause } from 'react-icons/io5';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import AuthPromptModal from './AuthPromptModal'; // Import the auth modal
import EpisodeListModal from './EpisodeListModal'; // Import the episode list modal
import './PodcastCard.css';

const PodcastCard = ({ podcast }) => {
  const [showAuthModal, setShowAuthModal] = useState(false); // State for auth modal visibility
  const [showEpisodeModal, setShowEpisodeModal] = useState(false); // State for episode modal visibility
  const { currentTrack, isPlaying } = usePlayer(); // Removed playTrack from here, will be used in modal
  const {
    user,
    isAuthenticated,
    likedPodcastIds,
    // addLikedPodcastId, // No longer used directly here
    // removeLikedPodcastId, // No longer used directly here
    setLikedPodcastsList // Import the new function
  } = useAuth(); // Get auth context
  const navigate = useNavigate(); // Hook for navigation

  // Determine if this card's track is the one currently playing/paused
  // Determine if this podcast is liked by the current user
  const isLiked = isAuthenticated && likedPodcastIds.includes(podcast._id);

  // Check if *an episode* from this podcast is playing (requires comparing podcast ID if available)
  // This logic might need refinement depending on how currentTrack is structured after playing an episode
  const isPodcastPlaying = currentTrack?.podcastId === podcast.id || currentTrack?._id === podcast.id; // Adjust based on actual data structure
  const isThisTrackPlaying = isPodcastPlaying && isPlaying; // Simplified check

  // This function now opens the episode list modal
  const handleOpenEpisodes = (e) => {
    e.stopPropagation(); // Prevent card click if clicking the button specifically
    e.preventDefault(); // Prevent link navigation if it were a link
    if (isAuthenticated) {
      setShowEpisodeModal(true); // Show episode list modal
    } else {
      setShowAuthModal(true); // Show auth prompt if not logged in
    }
  };

  // Handle like/unlike button click
  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Stop the click from propagating to the parent card div
    e.preventDefault(); // Prevent link navigation if it were a link

    if (!isAuthenticated || !user?.token) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    // Use podcast.id for Listen Notes ID, podcast._id might be the same or a Mongo ID
    const idToLike = podcast.id || podcast._id;
    const isExternal = typeof idToLike === 'string' && idToLike.length > 20; // Re-check if it looks external

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const url = `/users/${isLiked ? 'unlike' : 'like'}/${idToLike}`;
    let requestBody = {};

    // If liking an external podcast, include its details in the body
    if (!isLiked && isExternal) {
      requestBody = {
        title: podcast.title,
        image: podcast.image,
        publisherName: podcast.creator?.name // Get publisher name from creator mapping
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
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
      // Optionally show an error message to the user
    }
  };

  // This function handles clicks on the main card area - also opens episode list
  const handleCardClick = () => {
     if (isAuthenticated) {
       setShowEpisodeModal(true); // Show episode list modal
    } else {
      setShowAuthModal(true); // Show auth prompt if not logged in
    }
  };


  return (
    <> {/* Use Fragment to wrap Card and Modal */}
      {/* Removed Link wrapper */}
      {/* Added onClick to the main div */}
      <div className="podcast-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}> {/* Added pointer cursor */}
        <div className="podcast-card-image-wrapper">
          {podcast.image ? ( // Changed from podcast.coverImageUrl to podcast.image
            <img src={podcast.image} alt={podcast.title} className="podcast-card-image" /> // Changed from podcast.coverImageUrl to podcast.image
          ) : (
            <div className="podcast-card-placeholder-image">
              {/* Placeholder Icon or similar */}
              <IoPlay />
            </div>
          )}
          {/* TODO: Add 'New' badge conditionally */}
          {/* TODO: Add 'New' badge conditionally */}
          {/* <span className="podcast-card-badge">New</span> */}
          {/* Button now opens the episode list */}
          <button className="podcast-card-play-button" onClick={handleOpenEpisodes} title="View Episodes">
            {/* Show play icon consistently, or maybe a list icon? */}
            <IoPlay />
            {/* {isThisTrackPlaying ? <IoPause /> : <IoPlay />} */}
          </button>
        </div>
        <div className="podcast-card-info">
          <h3 className="podcast-card-title">{podcast.title}</h3>
          <p className="podcast-card-creator">{podcast.creator?.name || 'Unknown Creator'}</p>
          <div className="podcast-card-footer">
            {podcast.tags && podcast.tags.length > 0 && (
              <span className="podcast-card-tag">{podcast.tags[0]}</span> // Display first tag
            )}
            {/* Like button - Re-enabled, show if podcast ID exists */}
            {podcast.id && ( // Use podcast.id as it should always exist for Listen Notes results
              <button
                className={`podcast-card-favorite-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                {isLiked ? <IoHeart /> : <IoHeartOutline />}
              </button>
            )}
          </div>
          </div>
        </div>
      {/* Modal remains outside the clickable card div */}
      {/* Auth Modal */}
      <AuthPromptModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {/* Episode List Modal */}
      <EpisodeListModal
        podcastId={podcast.id} // Pass the podcast ID (ensure it's the Listen Notes ID)
        show={showEpisodeModal}
        onClose={() => setShowEpisodeModal(false)}
      />
    </>
  );
};

export default PodcastCard;
