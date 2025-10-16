// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ experienceId, guideId, onReviewSubmit }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      userName: "Anonymous Tourist", // In a real app, from logged-in user
      rating,
      comment,
      guideId
    };
    onReviewSubmit(newReview);
    setComment('');
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h4>Leave a Review</h4>
      <label>
        Rating:
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(star => <option key={star} value={star}>{star} Stars</option>)}
        </select>
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        required
      ></textarea>
      <button type="submit" className="btn">Submit Review</button>
    </form>
  );
};

export default ReviewForm;