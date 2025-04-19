import React, { useState, useEffect } from 'react';
import PodcastGrid from './PodcastGrid';
import apiClient from '../api/axiosConfig'; // Import the API client

const HomePage = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPodcasts = async () => {
      setError('');
      setLoading(true);
      try {
        // Fetch best podcasts from the new Listen Notes backend endpoint
        const { data } = await apiClient.get('/listennotes/best');

        // The Listen Notes API returns results in a 'podcasts' array within the response data
        // Map the fields to match what PodcastGrid expects
        const mappedPodcasts = data.podcasts.map(podcast => ({
          id: podcast.id, // Use Listen Notes ID
          _id: podcast.id, // Use Listen Notes ID if _id is expected
          title: podcast.title, // Field name is 'title' in /best_podcasts
          description: podcast.description, // Field name is 'description'
          image: podcast.image,
          publisher: podcast.publisher, // Keep publisher if needed elsewhere
          creator: { name: podcast.publisher }, // Map publisher to creator.name for PodcastCard
          // Add other relevant fields if needed by PodcastGrid
        }));
        setPodcasts(mappedPodcasts);

      } catch (err) {
        console.error("Error fetching best podcasts:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || err.message || 'Could not fetch best podcasts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      {loading && <p>Loading podcasts...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <>
          {/* Pass the fetched podcasts to the grid */}
          <PodcastGrid title="Discover Podcasts" podcasts={podcasts} />
          {/* Example: Add another grid for featured or recent podcasts */}
          {/* <PodcastGrid title="Recently Added" podcasts={recentPodcasts} /> */}
        </>
      )}
    </div>
  );
};

export default HomePage;
