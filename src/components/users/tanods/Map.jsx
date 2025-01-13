import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine'; // Ensure this is imported

import polyline from 'polyline'; // For decoding polyline

const TanodMap = () => {
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);

  const apiKey = '8a148f78-ea1e-4c0c-83e2-44dd34d45026';  
  const apiUrl = 'https://graphhopper.com/api/1/route';

  const start = [14.72661640119096, 121.03715880494757]; // Start point
  const end = [14.728692297137567, 121.04166643767138]; // End point

  // Fetch route from API
  useEffect(() => {
    const fetchRoute = async () => {
      const routeUrl = `${apiUrl}?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&vehicle=foot&locale=en&key=${apiKey}`;

      try {
        const response = await fetch(routeUrl);
        const data = await response.json();

        if (data && data.paths && data.paths.length > 0) {
          const encodedPolyline = data.paths[0].points;
          if (encodedPolyline) {
            // Decode the polyline
            const decodedCoordinates = polyline.decode(encodedPolyline);
            setRouteData(decodedCoordinates);
          } else {
            setError('No points found in the path.');
            setRouteData(null);
          }
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

    fetchRoute();
  }, [apiKey]);

  // Component to add the route to the map
  const RouteLayer = () => {
    const map = useMap();

    useEffect(() => {
      if (routeData && map) {
        // Ensure leaflet-routing-machine is available
        if (typeof L.Routing === 'undefined') {
          console.error('leaflet-routing-machine plugin not loaded');
          return;
        }

        // Check if the routeData is valid
        if (routeData.length > 0) {
          // Create and add the routing control (without instructions or alerts)
          L.Routing.control({
            waypoints: [L.latLng(start), L.latLng(end)],
            createRoute: () => L.polyline(routeData, { color: 'blue' }),
            routeWhileDragging: true,
            showAlternatives: false, // Disable alternative routes
            collapsible: true, // Disable collapsible control (no need for instructions)
            addWaypoints: false, // Disable adding waypoints
            lineOptions: {
              styles: [{ color: 'blue', weight: 4, opacity: 0.7 }] // Customize the route line style
            },
          }).addTo(map);
        }
      }
    }, [routeData, map]);

    return null;
  };

  return (
    <div style={{ height: '600px' }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <MapContainer center={start} zoom={16} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Start and End Markers */}
        <Marker position={start}>
          <Popup>Start Location</Popup>
        </Marker>
        <Marker position={end}>
          <Popup>End Location</Popup>
        </Marker>

        {/* Add route to the map if available */}
        <RouteLayer />
      </MapContainer>
    </div>
  );
};

export default TanodMap;
