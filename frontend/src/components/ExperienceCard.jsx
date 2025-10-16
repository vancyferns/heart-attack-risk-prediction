import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // We'll add some basic styles here

const ExperienceCard = ({ experience }) => {
  return (
    <div className="card">
      <img src={experience.imageUrl || "https://via.placeholder.com/300x200"} className="card-image" alt={experience.title} />
      <div className="card-content">
        <h3>{experience.title}</h3>
        <p><strong>Guide:</strong> {experience.guideName}</p>
        <p>{experience.description.substring(0, 100)}...</p>
        <div className="card-footer">
          <span className="price">₹{experience.price} / person</span>
          <span className="rating">⭐ {experience.averageRating.toFixed(1)}</span>
        </div>
        <Link to={`/experience/${experience._id}`} className="btn">View Details</Link>
      </div>
    </div>
  );
};

export default ExperienceCard;