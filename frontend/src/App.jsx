import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ExperienceCard from './components/ExperienceCard';
import MapView from './components/MapView';
import ExperienceDetails from './components/ExperienceDetails';
import AIRecommender from './components/AIRecommender';
import './App.css';

function App() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/experiences')
      .then(response => {
        setExperiences(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the experiences!", error);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🌴 Goa Guild 2.0</h1>
          <p>Discover authentic experiences with local guides.</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <AIRecommender />
                <MapView />
                <div className="card-grid">
                  {experiences.map(exp => (
                    <ExperienceCard key={exp._id} experience={exp} />
                  ))}
                </div>
              </>
            } />
            <Route path="/experience/:id" element={<ExperienceDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;