import React, { useState, useEffect } from 'react';
import PodcastGrid from './PodcastGrid'; // Reuse the grid component
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext'; // To get the token
import './LibraryPage.css'; // Add specific styles if needed

const LibraryPage = () => {
  const [likedPodcasts, setLikedPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get user info for token

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.token) {
        setError('Please log in to view your library.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await apiClient.get('/users/library', config);

        if (data.success) {
          setLikedPodcasts(data.data || []);
        } else {
          setError(data.message || 'Failed to load library.');
          setLikedPodcasts([]);
        }
      } catch (err) {
        console.error("Library fetch error:", err);
        setError(err.response?.data?.message || err.message || 'An error occurred while fetching your library.');
        setLikedPodcasts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user?.token]); // Re-fetch if the user token changes (e.g., login/logout)

  return (
    <div className="library-page">
      <h2>Your Library</h2>
      {loading && <p>Loading your liked podcasts...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && likedPodcasts.length === 0 && (
        <p>You haven't liked any podcasts yet. Find some on the Home page!</p>
      )}
      {!loading && !error && likedPodcasts.length > 0 && (
        <PodcastGrid podcasts={likedPodcasts} />
      )}
    </div>
  );
};

export default LibraryPage;
