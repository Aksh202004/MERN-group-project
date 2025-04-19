import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import Components
import Sidebar from './components/Sidebar'; // New Sidebar
import TopBar from './components/TopBar';   // New TopBar
// import Player from './components/Player'; // Removed Player
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LibraryPage from './components/LibraryPage';
import SearchPage from './components/SearchPage';
import AccountPage from './components/AccountPage'; // Import AccountPage
// TODO: Import other components like PodcastDetailsPage, CreatePodcastPage etc.

function App() {
  return (
    <div className="app-container"> {/* Changed class name */}
      <Sidebar />
      <div className="main-layout"> {/* Renamed for clarity */}
        <div className="main-content-area"> {/* Wrapper for top bar and page content */}
          <TopBar />
          <main className="page-content"> {/* Added class for padding */}
            <Routes>
              <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/account" element={<AccountPage />} /> {/* Add route for account */}
              {/* TODO: Add routes for podcast details, create, edit etc. */}
            </Routes>
          </main>
        </div>
        {/* <Player /> */} {/* Removed Player */}
      </div>
    </div>
  );
}

export default App;
