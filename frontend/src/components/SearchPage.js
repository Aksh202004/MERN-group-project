import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import PodcastGrid from './PodcastGrid'; // Reuse the grid component

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q'); // Get the search term from URL query ?q=...
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setResults([]); // Clear results if search term is empty
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Call the new backend endpoint for Listen Notes search
        const { data } = await apiClient.get('/listennotes/search', {
          params: { q: searchTerm } // Pass search term as query parameter 'q'
        });

        // The Listen Notes API returns results in a 'results' array
        // We might need to map the fields if PodcastGrid expects different names
        // Example mapping (adjust based on PodcastGrid needs):
        const mappedResults = data.results.map(podcast => ({
          id: podcast.id, // Use Listen Notes ID
          _id: podcast.id, // Use Listen Notes ID if _id is expected
          title: podcast.title_original,
          description: podcast.description_original, // Use original description
          image: podcast.image,
          publisher: podcast.publisher_original, // Keep original publisher name if needed elsewhere
          creator: { name: podcast.publisher_original }, // Map publisher_original to creator.name for PodcastCard
          // Add other relevant fields returned by Listen Notes API
        }));
        setResults(mappedResults);

      } catch (err) {
        console.error("Listen Notes Search Error:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || err.message || 'Could not perform search via Listen Notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]); // Re-run search when the searchTerm changes

  return (
    <div>
      <h2>Search Results for "{searchTerm}"</h2>
      {loading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <PodcastGrid title="" podcasts={results} /> // Don't show default title
      )}
      {!loading && !error && results.length === 0 && searchTerm && (
         <p>No results found for "{searchTerm}".</p>
      )}
    </div>
  );
};

export default SearchPage;
