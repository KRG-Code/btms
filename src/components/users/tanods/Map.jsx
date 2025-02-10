import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';
import Incidents from './Incidents';

const TanodMap = () => {
  const [patrolAreas, setPatrolAreas] = useState([]);
  const mapRef = useRef(null);
  const start = [14.72661640119096, 121.03715880494757]; // Start point

  const fetchPatrolAreas = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in.');
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const upcomingPatrolAreas = response.data.filter(schedule => {
        const now = new Date();
        const startTime = new Date(schedule.startTime);
        const diff = (startTime - now) / (1000 * 60); // Difference in minutes
        return diff <= 30 && schedule.patrolArea;
      }).map(schedule => schedule.patrolArea);

      setPatrolAreas(upcomingPatrolAreas);
    } catch (error) {
      console.error('Error fetching patrol areas:', error);
      toast.error('Failed to load patrol areas.');
    }
  };

  useEffect(() => {
    fetchPatrolAreas();
  }, []);

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (map) {
        mapRef.current = map;

        patrolAreas.forEach(area => {
          if (area && area.coordinates) {
            const layer = L.polygon(
              area.coordinates.map(({ lat, lng }) => [lat, lng]),
              { color: area.color }
            );
            layer.bindTooltip(area.legend, { permanent: true, direction: 'center' });
            layer.addTo(map);
          }
        });
      }
    }, [map, patrolAreas]);

    return null;
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapContainer center={start} zoom={16} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
      </MapContainer>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Incidents />
      </div>
    </div>
  );
};

export default TanodMap;
