// src/components/ReviewList.jsx
import React from 'react';

const ReviewList = ({ reviews }) => {
  return (
    <div className="review-list">
      {reviews.length === 0 ? <p>No reviews yet. Be the first!</p> : 
        reviews.map(review => (
          <div key={review._id} className="review-card">
            <strong>{review.userName}</strong> <span className="rating">⭐{review.rating}</span>
            <p>{review.comment}</p>
          </div>
        ))
      }
    </div>
  );
};

export default ReviewList;