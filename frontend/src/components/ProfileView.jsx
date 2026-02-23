import React from 'react';
import '../assets/PatientDetails.css';

const ProfileView = ({ user, onBack }) => {
  if (!user) return null;

  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar-large">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">Ophthalmologist</p>
        </div>
      </div>

      <div className="profile-body">
        <p><strong>Email:</strong> {user.email}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
      </div>

      <div className="profile-actions">
        <button className="btn" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
};

export default ProfileView;
