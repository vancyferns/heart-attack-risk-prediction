import React, { useState } from 'react';
import axios from 'axios';

const AIRecommender = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    interests: [],
    energy: 'relaxed'
  });

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, value]
        : prev.interests.filter(i => i !== value)
    }));
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/recommendations', preferences);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
    setIsLoading(false);
  };
  
  // Simple display for recommended items
  const RecommendedItem = ({ item }) => (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h4>{item.title}</h4>
      <p>{item.description.substring(0, 80)}...</p>
    </div>
  );

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="btn btn-secondary">
        ✨ Find Your Perfect Experience
      </button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
            <h2>Let's find your adventure!</h2>
            <div>
              <h4>What are you interested in?</h4>
              <label><input type="checkbox" value="Food" onChange={handleInterestChange} /> Food</label>
              <label><input type="checkbox" value="History" onChange={handleInterestChange} /> History</label>
              <label><input type="checkbox" value="Adventure" onChange={handleInterestChange} /> Adventure</label>
            </div>
            <div>
              <h4>What's your energy level?</h4>
              <label><input type="radio" name="energy" value="relaxed" checked={preferences.energy === 'relaxed'} onChange={(e) => setPreferences({...preferences, energy: e.target.value})} /> Relaxed</label>
              <label><input type="radio" name="energy" value="active" checked={preferences.energy === 'active'} onChange={(e) => setPreferences({...preferences, energy: e.target.value})} /> Active</label>
            </div>
            <button onClick={getRecommendations} disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Finding...' : 'Get Recommendations'}
            </button>
            <div className="recommendations-results">
              {recommendations.map(item => <RecommendedItem key={item._id} item={item} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommender;