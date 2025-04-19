import React from 'react';
import PodcastCard from './PodcastCard';
import './PodcastGrid.css'; // We'll create this CSS file next

// Placeholder data, replace with actual fetched data later
const placeholderPodcasts = [
  { _id: '1', title: 'Tech Talk Today', creator: { name: 'Sarah Johnson' }, tags: ['Technology'] },
  { _id: '2', title: 'The Daily Digest', creator: { name: 'Michael Chen' }, tags: ['News'] },
  { _id: '3', title: 'Creative Minds', creator: { name: 'Emily Rodriguez' }, tags: ['Arts'] },
  { _id: '4', title: 'Science Weekly', creator: { name: 'Dr. Alan Grant' }, tags: ['Science'] },
  { _id: '5', title: 'History Uncovered', creator: { name: 'Prof. Eleanor Vance' }, tags: ['History'] },
];

const PodcastGrid = ({ title = "Discover Podcasts", podcasts = placeholderPodcasts }) => {
  // TODO: Fetch actual podcasts from API

  return (
    <section className="podcast-grid-section">
      <h2 className="podcast-grid-title">{title}</h2>
      {podcasts && podcasts.length > 0 ? (
        <div className="podcast-grid">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast._id} podcast={podcast} />
          ))}
        </div>
      ) : (
        <p>No podcasts found.</p> // Handle empty state
      )}
    </section>
  );
};

export default PodcastGrid;
