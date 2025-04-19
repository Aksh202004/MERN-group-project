import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Import the configured axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds user info { _id, name, email, token, likedPodcastIds? }
  const [likedPodcastIds, setLikedPodcastIds] = useState([]); // Holds IDs of liked podcasts
  const [loading, setLoading] = useState(true); // To check initial auth status

  // Function to fetch liked podcasts for the logged-in user
  const fetchLikedPodcasts = async (token) => {
    if (!token) return; // Don't fetch if no token
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await apiClient.get('/users/library', config);
      if (data.success && Array.isArray(data.data)) {
        // Store only the IDs for quick checking
        setLikedPodcastIds(data.data.map(podcast => podcast._id));
      } else {
         console.error("Failed to fetch liked podcasts or invalid data format:", data);
         setLikedPodcastIds([]); // Reset on failure
      }
    } catch (error) {
      console.error('Error fetching liked podcasts:', error);
      setLikedPodcastIds([]); // Reset on error
    }
  };


  // Check localStorage for user info on initial load
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const loadUser = async () => {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        if (isMounted) {
          setUser(userInfo);
          // Fetch liked podcasts after setting user
          await fetchLikedPodcasts(userInfo.token);
        }
      }
      if (isMounted) {
        setLoading(false); // Finished checking
      }
    };

    loadUser();

    return () => { isMounted = false; }; // Cleanup function
  }, []); // Empty dependency array ensures this runs only once on mount


  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.success) {
        const userInfo = { ...data.user, token: data.token };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUser(userInfo);
        // Fetch liked podcasts after successful login
        await fetchLikedPodcasts(userInfo.token);
        return userInfo; // Return user info on success
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
       // Clear liked list on login failure? Maybe not necessary.
       // setLikedPodcastIds([]);
       throw error; // Re-throw the error to be caught by the caller
    }
  };

  const register = async (name, email, password) => {
     const { data } = await apiClient.post('/auth/register', { name, email, password });
     if (data.success) {
        // Don't automatically log in user after registration in this setup
        // User will be redirected to login page
        return data; // Return success data
     } else {
        throw new Error(data.message || 'Registration failed');
     }
  };


  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    // Optionally: redirect to login or home page
    setLikedPodcastIds([]); // Clear liked podcasts on logout
  };

  // Function to add a podcast ID to the local liked list
  const addLikedPodcastId = (podcastId) => {
    setLikedPodcastIds((prevIds) => [...new Set([...prevIds, podcastId])]); // Ensure uniqueness
  };

  // Function to remove a podcast ID from the local liked list
  const removeLikedPodcastId = (podcastId) => {
    setLikedPodcastIds((prevIds) => prevIds.filter(id => id !== podcastId));
  };

  // Function to directly set the entire list of liked podcast IDs (MongoDB IDs)
  const setLikedPodcastsList = (podcastIdList) => {
    if (Array.isArray(podcastIdList)) {
      setLikedPodcastIds(podcastIdList);
    } else {
      console.error("setLikedPodcastsList received non-array value:", podcastIdList);
    }
  };


  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    likedPodcastIds,
    addLikedPodcastId, // Keep for potential other uses? Or remove if fully replaced.
    removeLikedPodcastId, // Keep for potential other uses? Or remove if fully replaced.
    setLikedPodcastsList // Export the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Don't render children until initial check is done */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
