import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PatrolScheduleManager = ({ polygons, refreshMapData }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

   // Memoize the fetchData function using useCallback
   const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User is not authenticated.');
      return;
    }

    try {
      // Corrected endpoint
      const scheduleResponse = await axios.get(`${API_URL}/auth/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(scheduleResponse.data || []);  // Store fetched schedules
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load schedules.');
    }
  }, [API_URL]); // Add API_URL as dependency

  useEffect(() => {
    fetchData(); // Fetch schedules on initial load
  }, [fetchData]); 

  // Format the date and time (e.g., 2025-01-21T08:00:00Z to January 21, 2025, 08:00 AM)
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-lg space-y-6 TopNav">
            <h3 className="text-2xl font-semibold text-center text-blue-700 mb-4">Patrol Schedule Manager</h3>
      {/* Schedule Dropdown */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">Select a Schedule:</label>
        <select
          value={selectedSchedule}
          onChange={(e) => setSelectedSchedule(e.target.value)}
          onClick={fetchData}
          className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="" disabled>Select available schedule</option>
          {schedules.length > 0 ? (
            schedules.map((schedule) => {
              const { date: startDate, time: startTime } = formatDateTime(schedule.startTime);
              const { date: endDate, time: endTime } = formatDateTime(schedule.endTime);
              return (
                <option key={schedule._id} value={schedule._id} className="text-justify">
                  {schedule.unit}: {startDate}: {startTime} - {endDate} {endTime}
                </option>
              );
            })
          ) : (
            <option value="" disabled>No schedules available</option>
          )}
        </select>
      </div>

      {/* Patrol Area Dropdown */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">Select Patrol Area:</label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="" disabled>Select a patrol area</option>
          {polygons.length > 0 ? (
            polygons.map((polygon) => (
              <option key={polygon._id} value={polygon._id}>
                {polygon.legend || 'No legend available'}
              </option>
            ))
          ) : (
            <option value="" disabled>No patrol areas available</option>
          )}
        </select>
      </div>

      {/* Selected Information */}
      {selectedSchedule && (
        <div className="p-4 bg-blue-50 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-blue-700">Selected Schedule Details</h4>
          <div className="mt-2 text-gray-700 space-y-2">
            <p><strong>Schedule ID:</strong> {selectedSchedule}</p>
            <p><strong>Unit:</strong> {schedules.find((schedule) => schedule._id === selectedSchedule)?.unit}</p>
            <p>
              <strong>Time:</strong> 
              {schedules.find((schedule) => schedule._id === selectedSchedule) && 
                `${formatDateTime(schedules.find((schedule) => schedule._id === selectedSchedule).startTime).date}: 
                 ${formatDateTime(schedules.find((schedule) => schedule._id === selectedSchedule).startTime).time} - 
                 ${formatDateTime(schedules.find((schedule) => schedule._id === selectedSchedule).endTime).time}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatrolScheduleManager;
