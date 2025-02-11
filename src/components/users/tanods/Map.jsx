import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Incidents from './Incidents';

const TanodMap = () => {
  const [patrolAreas, setPatrolAreas] = useState([]);
  const [currentPatrolArea, setCurrentPatrolArea] = useState(null);
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

  const fetchCurrentPatrolArea = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/tanod-schedules/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentPatrol = response.data.find(schedule => {
        const patrolStatus = schedule.patrolStatus.find(status => status.tanodId === userId);
        return patrolStatus && patrolStatus.status === 'Started';
      });

      if (currentPatrol && currentPatrol.patrolArea) {
        console.log('Current Patrol Area ID:', currentPatrol.patrolArea._id); // Debugging information
        const patrolAreaResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/polygons/${currentPatrol.patrolArea._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentPatrolArea(patrolAreaResponse.data);
        if (mapRef.current) {
          const bounds = L.latLngBounds(patrolAreaResponse.data.coordinates.map(({ lat, lng }) => [lat, lng]));
          mapRef.current.fitBounds(bounds);
        }
      } else {
        setCurrentPatrolArea(null);
      }
    } catch (error) {
      console.error('Error fetching current patrol area:', error);
      toast.error('Failed to load current patrol area.');
    }
  };

  useEffect(() => {
    fetchPatrolAreas();
    fetchCurrentPatrolArea();
  }, []);

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (map) {
        mapRef.current = map;

        // Clear existing layers to prevent duplication
        map.eachLayer((layer) => {
          if (layer instanceof L.Polygon) {
            map.removeLayer(layer);
          }
        });

        patrolAreas.forEach(area => {
          if (area && area.coordinates) {
            const layer = L.polygon(
              area.coordinates.map(({ lat, lng }) => [lat, lng]),
              { color: area.color, fillOpacity: 0.2, weight: 2 }
            );
            layer.bindTooltip(area.legend, { permanent: true, direction: 'center' });
            layer.addTo(map);
          }
        });

        if (currentPatrolArea && currentPatrolArea.coordinates) {
          const layer = L.polygon(
            currentPatrolArea.coordinates.map(({ lat, lng }) => [lat, lng]),
            { color: currentPatrolArea.color, fillOpacity: 0.2, weight: 2 }
          );
          layer.bindTooltip(currentPatrolArea.legend, { permanent: true, direction: 'center' });
          layer.addTo(map);
        }
      }
    }, [map, patrolAreas, currentPatrolArea]);

    return null;
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <MapContainer center={start} zoom={16} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
      </MapContainer>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Incidents fetchCurrentPatrolArea={fetchCurrentPatrolArea} />
      </div>
    </div>
  );
};

export default TanodMap;
