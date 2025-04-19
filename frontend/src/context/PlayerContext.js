import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Import apiClient

const PlayerContext = createContext(null);
const HISTORY_STORAGE_KEY = 'podcastListeningHistory';
const MAX_HISTORY_LENGTH = 15; // Keep the last 15 played tracks

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null); // Holds the podcast object to play
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // Default volume (0 to 1)
  const [listeningHistory, setListeningHistory] = useState([]); // State for history

  const audioRef = useRef(null); // Ref to the hidden HTML audio element

  // Effect to load history from localStorage on initial mount
  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setListeningHistory(parsedHistory);
        }
      } catch (e) {
        console.error("Failed to parse listening history from localStorage", e);
        localStorage.removeItem(HISTORY_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once

  // Effect to handle audio source changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e)); // Autoplay if was playing
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack?.audioUrl]); // Re-run when audioUrl changes

   // Effect to handle play/pause state changes
   useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);


  const playTrack = async (track) => { // Make the function async
    // If it's the same track, just toggle play/pause
    if (currentTrack?._id === track._id) {
      setIsPlaying(!isPlaying);
      return; // Exit early
    }

    // --- Fetch full track details if audioUrl is missing ---
    let trackData = { ...track }; // Start with the basic track info

    if (!trackData.audioUrl) { // Check if we need to fetch episode audio
      console.log(`Fetching details for podcast ID: ${track.id}`); // Use track.id from Listen Notes
      try {
        // Use the backend endpoint to get podcast details including episodes
        const { data: podcastDetails } = await apiClient.get(`/listennotes/podcasts/${track.id}`);

        if (podcastDetails && podcastDetails.episodes && podcastDetails.episodes.length > 0) {
          const latestEpisode = podcastDetails.episodes[0]; // Get the most recent episode
          trackData.audioUrl = latestEpisode.audio; // Get the audio URL
          trackData.title = latestEpisode.title; // Optionally update title to episode title
          trackData.description = latestEpisode.description; // Optionally update description
          trackData.image = latestEpisode.image || trackData.image; // Use episode image if available, else podcast image
          trackData._id = latestEpisode.id; // Use episode ID for uniqueness in player state
          trackData.podcastTitle = track.title; // Keep original podcast title if needed
          console.log(`Playing episode: ${trackData.title}, Audio URL: ${trackData.audioUrl}`);
        } else {
          console.error("No episodes found for this podcast or failed to fetch details.");
          // Handle error - maybe show a message to the user?
          setIsPlaying(false); // Ensure player doesn't try to play
          return; // Stop execution
        }
      } catch (error) {
        console.error("Error fetching podcast details:", error.response ? error.response.data : error.message);
        // Handle error - maybe show a message to the user?
        setIsPlaying(false); // Ensure player doesn't try to play
        return; // Stop execution
      }
    }
    // --- End fetch ---

    // Set new track data (potentially enriched with audioUrl) and start playing
    setCurrentTrack(trackData);
    setIsPlaying(true); // Start playing the new track

    // Update listening history with the potentially enriched trackData
    setListeningHistory(prevHistory => {
      // Remove the current track/episode if it already exists to move it to the front
      const filteredHistory = prevHistory.filter(item => item._id !== trackData._id);
      // Add the new track/episode to the beginning
      const newHistory = [trackData, ...filteredHistory];
      // Limit the history length
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);
      // Save to localStorage
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
      return limitedHistory;
    });
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentTrack) return; // Do nothing if no track is loaded
    setIsPlaying(!isPlaying);
  };

  const seekTime = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
     if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // TODO: Implement logic for next track or repeat
  };

  // Format time helper
  const formatTime = (timeSeconds) => {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    listeningHistory, // Expose history
    playTrack,
    pauseTrack,
    togglePlay,
    seekTime,
    setVolume,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    // Function to reset player state
    resetPlayer: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the source
      }
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    },
    // Function to clear listening history
    clearListeningHistory: () => {
      setListeningHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Hidden audio element controlled by the context */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        // Consider adding onError handler
      />
    </PlayerContext.Provider>
  );
};

// Custom hook to use the player context
export const usePlayer = () => {
  return useContext(PlayerContext);
};
