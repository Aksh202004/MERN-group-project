import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { usePlayer } from '../context/PlayerContext';
import { IoPlay, IoClose } from 'react-icons/io5';
import './EpisodeListModal.css'; // We'll create this CSS file next

const EpisodeListModal = ({ podcastId, show, onClose }) => {
  const [episodes, setEpisodes] = useState([]);
  const [podcastTitle, setPodcastTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!podcastId || !show) {
        setEpisodes([]); // Clear episodes when modal is hidden or no ID
        return;
      }
      setLoading(true);
      setError('');
      setEpisodes([]); // Clear previous episodes
      try {
        // Fetch podcast details including episodes using the backend endpoint
        const { data } = await apiClient.get(`/listennotes/podcasts/${podcastId}`);
        if (data && data.episodes) {
          setEpisodes(data.episodes);
          setPodcastTitle(data.title || 'Podcast Episodes');
        } else {
          setError('Could not load episodes for this podcast.');
        }
      } catch (err) {
        console.error("Error fetching episodes:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || 'Failed to fetch episodes.');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [podcastId, show]); // Re-fetch when podcastId or show status changes

  const handlePlayEpisode = (episode) => {
    // Map the episode data to the structure expected by playTrack
    // Ensure necessary fields like _id, title, image, audioUrl, creator are present
    const trackData = {
      _id: episode.id, // Use episode ID
      id: episode.id, // Keep episode ID if needed elsewhere
      title: episode.title,
      audioUrl: episode.audio,
      image: episode.image || '', // Use episode image or fallback
      description: episode.description,
      podcastTitle: podcastTitle, // Add original podcast title
      // Add creator info if available/needed by player UI
      // creator: { name: podcastPublisherName } // Need publisher name from podcast details if required
    };
    playTrack(trackData);
    onClose(); // Close modal after selecting an episode
  };

  if (!show) {
    return null; // Don't render anything if modal is hidden
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
        <button className="modal-close-button" onClick={onClose} title="Close">
          <IoClose />
        </button>
        <h3>{podcastTitle}</h3>
        {loading && <p>Loading episodes...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!loading && !error && (
          <ul className="episode-list">
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <li key={episode.id} className="episode-list-item">
                  <div className="episode-info">
                    <span className="episode-title">{episode.title}</span>
                    {/* Optionally show description or publish date */}
                    {/* <p className="episode-description">{episode.description}</p> */}
                  </div>
                  <button
                    className="episode-play-button"
                    onClick={() => handlePlayEpisode(episode)}
                    title={`Play ${episode.title}`}
                  >
                    <IoPlay />
                  </button>
                </li>
              ))
            ) : (
              <p>No episodes found.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EpisodeListModal;
