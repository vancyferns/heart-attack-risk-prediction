import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapView = () => {
  const [experiences, setExperiences] = useState([]);
  const goaCenter = [15.2993, 74.1240]; // Latitude, Longitude for Goa

  useEffect(() => {
    axios.get('http://localhost:5000/api/experiences')
      .then(response => setExperiences(response.data))
      .catch(error => console.error("Error fetching experiences for map:", error));
  }, []);

  return (
    <MapContainer center={goaCenter} zoom={10} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {experiences.map(exp => (
        <Marker key={exp._id} position={[exp.location.lat, exp.location.lng]}>
          <Popup>
            <strong>{exp.title}</strong><br />
            ₹{exp.price} / person<br />
            <a href={`/experience/${exp._id}`}>View Details</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;