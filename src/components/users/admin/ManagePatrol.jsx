import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import polyline from 'polyline';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatrolManagement = () => {
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const mapRef = useRef(null); // Reference for map instance

  const apiKey = '8a148f78-ea1e-4c0c-83e2-44dd34d45026'; // Replace with your actual API key
  const apiUrl = 'https://graphhopper.com/api/1/route';

  // Fetch Schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/schedules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Error fetching schedules.');
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

  // Add Marker on Map Click
  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      const handleMapClick = (e) => {
        if (!selectedSchedule) {
          toast.error('Please select a schedule before adding markers.');
          return;
        }

        const newMarker = { lat: e.latlng.lat, lng: e.latlng.lng, schedule: selectedSchedule };

        setMarkers((prevMarkers) => [
          ...prevMarkers,
          newMarker,
        ]);
      };

      map.on('click', handleMapClick);

      // Cleanup listener on component unmount
      return () => {
        map.off('click', handleMapClick);
      };
    }, [selectedSchedule]); // Only re-run when selectedSchedule changes

    return null;
  };

  // Fetch route from GraphHopper API
  const fetchRoute = async () => {
    if (markers.length < 2) {
      toast.error('Please add at least two markers to calculate a route.');
      return;
    }

    const pointsQuery = markers.map(({ lat, lng }) => `point=${lat},${lng}`).join('&');
    const routeUrl = `${apiUrl}?${pointsQuery}&vehicle=foot&locale=en&key=${apiKey}`;

    try {
      const response = await fetch(routeUrl);
      const data = await response.json();

      if (data && data.paths && data.paths.length > 0) {
        const encodedPolyline = data.paths[0].points;
        const decodedCoordinates = polyline.decode(encodedPolyline);
        setRouteData(decodedCoordinates);
        setError(null);
      } else {
        setError('No valid route found.');
        setRouteData(null);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError('Failed to fetch route.');
      setRouteData(null);
    }
  };

  // Clear markers and route data
  const handleClearMarkers = () => {
    setMarkers([]);
    setRouteData(null);
  };

  // Save Patrol Schedule (store schedule and coordinates)
  const handleSavePatrolSchedule = () => {
    if (!selectedSchedule) {
      toast.error('Please select a schedule before saving.');
      return;
    }

    // Prepare the patrol schedule data (coordinates + selected schedule)
    const patrolData = markers.map(({ lat, lng, schedule }) => ({
      scheduleId: schedule._id, // assuming each schedule has an '_id'
      coordinates: { lat, lng },
    }));

    // You can send this patrolData to the server or store it locally
    console.log('Patrol Data:', patrolData);

    toast.success('Patrol schedule saved successfully!');
  };

  const RouteLayer = () => {
    const map = useMap();

    useEffect(() => {
      if (routeData && map) {
        L.Routing.control({
          waypoints: markers.map(({ lat, lng }) => L.latLng(lat, lng)),
          createMarker: () => null, // Don't create markers automatically
          routeWhileDragging: false,
          lineOptions: {
            styles: [{ color: 'blue', weight: 4, opacity: 0.7 }],
          },
          addWaypoints: false,
          show: false,
        }).addTo(map);
      }
    }, [routeData, map]);

    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Patrol Management</h1>

      {/* Select Schedule */}
      <div style={{ marginBottom: '10px' }}>
        <h3>Select Patrol Schedule:</h3>
        {loadingSchedules ? (
          <p>Loading schedules...</p>
        ) : (
          <select
            onChange={(e) => setSelectedSchedule(schedules.find((s) => s._id === e.target.value))}
            value={selectedSchedule ? selectedSchedule._id : ''}
          >
            <option value="">Select Schedule</option>
            {schedules.map((schedule) => (
              <option key={schedule._id} value={schedule._id}>
                {schedule.unit} - {schedule.startTime} to {schedule.endTime}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Display Coordinates */}
      <div style={{ marginBottom: '10px' }}>
        <h3>Placed Coordinates:</h3>
        {markers.length === 0 ? (
          <p>No markers placed.</p>
        ) : (
          <ul>
            {markers.map(({ lat, lng, schedule }, index) => (
              <li key={index}>
                Marker {index + 1}: [{lat.toFixed(6)}, {lng.toFixed(6)}] - Schedule: {schedule ? schedule.unit : 'None'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div style={{ height: '500px', marginBottom: '20px' }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100%' }}
          whenCreated={(map) => (mapRef.current = map)} // Store map reference
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Add Markers */}
          {markers.map(({ lat, lng }, index) => (
            <Marker key={index} position={[lat, lng]}>
              <Popup>{`Marker ${index + 1}`}</Popup>
            </Marker>
          ))}

          {/* Add Route */}
          {routeData && <RouteLayer />}

          <MapEvents />
        </MapContainer>
      </div>

      {/* Buttons */}
      <div>
        <button onClick={fetchRoute} disabled={markers.length < 2} style={{ marginRight: '10px' }}>
          Calculate Route
        </button>
        <button onClick={handleClearMarkers}>Clear Markers</button>
        <button onClick={handleSavePatrolSchedule} style={{ marginLeft: '10px' }}>
          Save Patrol Schedule
        </button>
      </div>

      {/* Error Messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && routeData && <p>Route successfully calculated!</p>}
    </div>
  );
};

export default PatrolManagement;
