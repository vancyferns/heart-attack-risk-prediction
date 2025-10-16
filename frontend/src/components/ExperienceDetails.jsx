import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GuideProfile from './GuideProfile';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import '../App.css';

const ExperienceDetails = () => {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/experiences/${id}`)
      .then(response => setExperience(response.data))
      .catch(error => console.error("Error fetching experience details:", error));

    axios.get(`http://localhost:5000/api/experiences/${id}/reviews`)
      .then(response => setReviews(response.data))
      .catch(error => console.error("Error fetching reviews:", error));
  }, [id]);

  const handleReviewSubmit = (newReview) => {
    axios.post(`http://localhost:5000/api/experiences/${id}/reviews`, newReview)
      .then(() => {
        // Refresh reviews and experience data to show new rating
        axios.get(`http://localhost:5000/api/experiences/${id}/reviews`).then(res => setReviews(res.data));
        axios.get(`http://localhost:5000/api/experiences/${id}`).then(res => setExperience(res.data));
      });
  };
  
  const handleBooking = () => {
    const bookingData = {
        experienceId: id,
        touristName: "Hackathon User", // In a real app, this comes from auth
        date: "2023-12-25" // In a real app, this comes from a date picker
    };
    alert("Initiating booking flow...");
    // Here you would call the payment intent endpoint
    // axios.post(`http://localhost:5000/api/bookings`, bookingData).then(...)
  };

  if (!experience) return <div>Loading...</div>;

  return (
    <div className="experience-details">
      <h1>{experience.title}</h1>
      <img src={experience.imageUrl || "https://via.placeholder.com/800x400"} alt={experience.title} className="detail-image" />
      <p>{experience.description}</p>
      <p><strong>Duration:</strong> {experience.duration} hours</p>
      <p><strong>Category:</strong> {experience.category}</p>
      <p><strong>Price:</strong> ₹{experience.price} / person</p>
      <p><strong>Average Rating:</strong> ⭐ {experience.averageRating.toFixed(1)}</p>
      
      <button onClick={handleBooking} className="btn btn-primary">Book Now</button>

      <hr />
      <GuideProfile guide={experience.guideDetails} />
      
      <hr />
      <h3>Reviews</h3>
      <ReviewForm experienceId={id} guideId={experience.guideId} onReviewSubmit={handleReviewSubmit} />
      <ReviewList reviews={reviews} />
    </div>
  );
};

export default ExperienceDetails;