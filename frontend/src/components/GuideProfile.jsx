import React from 'react';
import '../App.css'; // Corrected path to go up one directory

const GuideProfile = ({ guide }) => {
  if (!guide) return <div>Loading profile...</div>;

  return (
    <div className="guide-profile">
      <img src={guide.profilePictureUrl} alt={guide.name} className="profile-pic" />
      <div className="profile-info">
        <h2>{guide.name}</h2>
        <p><strong>Bio:</strong> {guide.bio}</p>
        <p><strong>Specialties:</strong> {guide.specialties.join(', ')}</p>
        <p><strong>Languages:</strong> {guide.languages.join(', ')}</p>
        <p><strong>Average Rating:</strong> ⭐ {guide.averageRating.toFixed(1)}</p>
        {guide.isVerified && <span className="verified-badge">✅ Admin Verified</span>}
      </div>
    </div>
  );
};

export default GuideProfile;
