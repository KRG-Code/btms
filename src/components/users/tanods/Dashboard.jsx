import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaTrash } from 'react-icons/fa';
import L from 'leaflet';

// Set Leaflet icon paths for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// TanodDashboard component
const TanodDashboard = () => {
  const [mapCenter, setMapCenter] = useState([14.6760, 121.0453]); // Fairview, Quezon City coordinates
  const [incidents, setIncidents] = useState([]);
  const [patrolSchedule, setPatrolSchedule] = useState([]);
  const [equipment, setEquipment] = useState([]); // Dummy equipment data
  const [ratingFeedbacks, setRatingFeedbacks] = useState([]); // Dummy feedback data
  const [assignments, setAssignments] = useState([]); // Dummy patrol assignments/logs
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');

  useEffect(() => {
    // Dummy data for incidents
    setIncidents([
      { id: 1, position: [14.6760, 121.0453], details: 'Robbery in Fairview' },
      { id: 2, position: [14.6994, 121.0371], details: 'Assault in North Fairview' },
    ]);

    // Dummy data for patrol schedule
    setPatrolSchedule([
      { id: 1, time: '8:00 AM - 12:00 PM', area: 'Fairview' },
      { id: 2, time: '2:00 PM - 6:00 PM', area: 'Commonwealth' },
    ]);

    // Dummy data for equipment assigned to the Tanod
    setEquipment([
      { id: 1, name: 'Radio', borrowDate: '2024-10-10', returnDate: 'Not Returned' },
      { id: 2, name: 'Flashlight', borrowDate: '2024-10-09', returnDate: 'Not Returned' },
    ]);

    // Dummy feedback data
    setRatingFeedbacks([
      { id: 1, feedback: 'Great response time during patrol.', rating: 4.7 },
      { id: 2, feedback: 'Handled incident with professionalism.', rating: 4.9 },
    ]);

    // Dummy patrol assignments/logs
    setAssignments([
      { id: 1, area: 'Fairview', startTime: '8:00 AM', endTime: '12:00 PM', report: 'Patrolled main roads, no incidents reported.' },
      { id: 2, area: 'Commonwealth', startTime: '2:00 PM', endTime: '6:00 PM', report: 'Responded to a robbery report, incident handled.' },
    ]);
  }, []);

  // Chart data for incidents Tanod responded to
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Incidents Responded To',
        data: [1, 2, 1, 0, 3, 1, 4, 2, 3, 1, 2, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  // Add note functionality
  const addNote = () => {
    const formattedDate = date.toLocaleDateString();
    if (currentNote) {
      setNotes((prevNotes) => [
        ...prevNotes,
        { date: formattedDate, note: currentNote },
      ]);
      setCurrentNote(''); // Clear note input field
    }
  };

  const deleteNote = (index) => {
    setNotes((prevNotes) => prevNotes.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Tanod Dashboard</h1>
  
      {/* Patrols Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white p-4 rounded shadow-lg text-center">
          <h2 className="text-lg font-semibold">Patrols Scheduled Today</h2>
          <p className="text-2xl">{patrolSchedule.length}</p>
        </div>
  
        <div className="bg-green-500 text-white p-4 rounded shadow-lg text-center">
          <h2 className="text-lg font-semibold">Incidents Responded To</h2>
          <p className="text-2xl">{chartData.datasets[0].data.reduce((a, b) => a + b, 0)}</p>
        </div>
  
        <div className="bg-yellow-500 text-white p-4 rounded shadow-lg text-center">
          <h2 className="text-lg font-semibold">Equipment Assigned</h2>
          <p className="text-2xl">{equipment.length}</p>
        </div>
      </div>
  
      {/* Notes and Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow-lg col-span-1 TopNav">
          {/* Calendar */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-4">Calendar</h2>
            <Calendar className="TopNav" onChange={setDate} value={date} />
          </div>
  
          {/* Notes */}
          <div className="flex flex-col mt-2">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <div className="flex-1 overflow-y-auto max-h-64">
              <ul>
                {notes.map((note, index) => (
                  <li key={index} className="border-b py-2 flex justify-between items-center">
                    <span className="font-bold">{note.date}:</span> {note.note}
                    <button onClick={() => deleteNote(index)} className="text-red-600 ml-2">
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Add a note..."
                className="border p-2 rounded mr-2 flex-grow text-black"
              />
              <button
                onClick={addNote}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
  
        {/* Chart Section */}
        <div className="bg-white p-4 rounded shadow-lg col-span-3 TopNav">
          <h2 className="text-lg font-semibold mb-4">Incident Response Chart</h2>
          <Line data={chartData} />
        </div>
      </div>
  
      {/* Map and Patrol Assignments Section */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mb-8">
        {/* Map Section */}
        <div className="bg-white p-4 rounded shadow-lg w-full lg:w-3/4 TopNav">
          <h2 className="text-lg font-semibold mb-4">Patrol Map</h2>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {incidents.map((incident) => (
              <Marker key={incident.id} position={incident.position}>
                <Popup>{incident.details}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
  
        {/* Patrol Assignments Section */}
        <div className="bg-white p-4 rounded shadow-lg w-full lg:w-1/4 TopNav">
          <h2 className="text-lg font-semibold mb-4">Patrol Assignments/Logs</h2>
          <ul>
            {assignments.map((assignment, index) => (
              <li key={index} className="flex flex-col mb-2">
                <span><strong>Area:</strong> {assignment.area}</span>
                <span><strong>Time:</strong> {assignment.startTime} - {assignment.endTime}</span>
                <span><strong>Report:</strong> {assignment.report}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
  
      {/* Equipment and Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Equipment Section */}
        <div className="bg-white p-4 rounded shadow-lg TopNav">
          <h2 className="text-lg font-semibold mb-4">Equipment Assigned</h2>
          <ul>
            {equipment.map((item, index) => (
              <li key={index} className="flex flex-col md:flex-row justify-between py-1">
                <span>{item.name}</span>
                <span>Borrowed: {item.borrowDate}</span>
                <span>Returned: {item.returnDate}</span>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Rating/Feedback Section */}
        <div className="bg-white p-4 rounded shadow-lg TopNav">
          <h2 className="text-lg font-semibold mb-4">Rating Feedback</h2>
          <ul>
            {ratingFeedbacks.map((feedback, index) => (
              <li key={index} className="flex flex-col mb-2">
                <span><strong>Feedback:</strong> {feedback.feedback}</span>
                <span><strong>Rating:</strong> {'⭐'.repeat(Math.round(feedback.rating))} ({feedback.rating})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );  
};

export default TanodDashboard;
