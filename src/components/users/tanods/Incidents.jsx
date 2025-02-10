import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Incidents = () => {
  const [patrols, setPatrols] = useState([]);
  const [upcomingPatrols, setUpcomingPatrols] = useState([]);
  const [incident, setIncident] = useState({ type: "", description: "", location: "" });
  const [incidentLog, setIncidentLog] = useState([]);
  const [currentReport, setCurrentReport] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUpcomingSchedule, setShowUpcomingSchedule] = useState(false);
  const [showReportIncident, setShowReportIncident] = useState(false);
  const [showReportedIncidents, setShowReportedIncidents] = useState(false);
  const [todayPatrols, setTodayPatrols] = useState([]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return null;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data._id;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Error fetching user profile.");
      return null;
    }
  };

  const fetchUpcomingPatrols = async () => {
    const token = localStorage.getItem('token');
    const userId = await fetchUserProfile();
    if (!token || !userId) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/tanod-schedules/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const schedulesWithPatrolArea = await Promise.all(
        response.data.map(async (schedule) => {
          if (schedule.patrolArea && typeof schedule.patrolArea === 'object' && schedule.patrolArea._id) {
            const patrolAreaResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/polygons/${schedule.patrolArea._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            schedule.patrolArea = patrolAreaResponse.data;
          } else if (schedule.patrolArea) {
            const patrolAreaResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/polygons/${schedule.patrolArea}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            schedule.patrolArea = patrolAreaResponse.data;
          }
          return schedule;
        })
      );
      setUpcomingPatrols(schedulesWithPatrolArea || []);
      setTodayPatrols(schedulesWithPatrolArea.filter(schedule => {
        const today = new Date();
        const startTime = new Date(schedule.startTime);
        return startTime.toDateString() === today.toDateString();
      }));
    } catch (error) {
      console.error('Error fetching upcoming patrols:', error);
      toast.error('Failed to load upcoming patrols.');
    }
  };

  useEffect(() => {
    fetchUpcomingPatrols();
  }, []);

  const startPatrol = async (patrolId, startTime) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    const now = new Date();
    const start = new Date(startTime);
    const diff = (start - now) / (1000 * 60); // Difference in minutes

    if (diff > 30) {
      toast.error("You can only start the patrol 30 minutes before the scheduled start time.");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/schedule/${patrolId}/start-patrol`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPatrol = {
        id: patrolId,
        unit: "Unit 1",
        startTime: new Date().toISOString(),
        report: "Patrol started.",
      };
      setPatrols([...patrols, newPatrol]);
      toast.success("Patrol has started.");
    } catch (error) {
      console.error("Error starting patrol:", error);
      toast.error("Failed to start patrol.");
    }
  };

  const endPatrol = async (patrolId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    try {
      const patrol = patrols.find(p => p.id === patrolId);
      const schedule = todayPatrols.find(s => s._id === patrolId);
      const now = new Date();
      const endTime = new Date(schedule.endTime);

      if (now < endTime) {
        toast.info(
          <div>
            <p>Are you sure you want to end the patrol before the scheduled end time?</p>
            <button
              className="bg-green-500 text-white p-2 rounded m-2"
              onClick={() => confirmEndPatrol(patrolId)}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white p-2 rounded m-2"
              onClick={() => toast.dismiss()}
            >
              No
            </button>
          </div>,
          { autoClose: false }
        );
      } else {
        await confirmEndPatrol(patrolId);
      }
    } catch (error) {
      console.error("Error ending patrol:", error);
      toast.error("Failed to end patrol.");
    }
  };

  const confirmEndPatrol = async (patrolId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/schedule/${patrolId}/end-patrol`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPatrols(patrols.map((patrol) => 
        patrol.id === patrolId 
        ? { ...patrol, endTime: new Date().toISOString(), report: currentReport || "Patrol ended." } 
        : patrol
      ));
      setCurrentReport(""); // Reset report after ending patrol
      toast.dismiss();
      toast.success("Patrol has ended.");
      fetchUpcomingPatrols(); // Refresh the patrols list
    } catch (error) {
      console.error("Error ending patrol:", error);
      toast.error("Failed to end patrol.");
    }
  };

  // Function to automatically update the status when the end time is reached or passed
  const updateScheduleStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/schedules/update-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchUpcomingPatrols(); // Refresh the patrols list
    } catch (error) {
      console.error("Error updating schedule status:", error);
      toast.error("Failed to update schedule status.");
    }
  };

  useEffect(() => {
    const interval = setInterval(updateScheduleStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleIncidentChange = (e) => {
    setIncident({ ...incident, [e.target.name]: e.target.value });
  };

  const reportIncident = () => {
    setIncidentLog([...incidentLog, incident]);
    setIncident({ type: "", description: "", location: "" });
    setShowReportIncident(false); // Close the modal after reporting the incident
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white bg-opacity-75 shadow-lg rounded-lg TopNav">
      <h1 onClick={toggleDropdown} className="text-2xl md:text-3xl font-bold text-center mb-4 cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition">
        Incidents and Patrol Management
      </h1>
      
      {isDropdownOpen && (
        <div className="dropdown-content">
          <h2 className="text-xl md:text-2xl mb-2">Today's Patrol Schedule</h2>
          <ul className="list-disc list-inside mb-4">
            {todayPatrols.length > 0 ? (
              todayPatrols.map((patrol) => (
                <li key={patrol._id} className="flex flex-wrap md:flex-nowrap items-center justify-between border-b py-2">
                  <div className="flex-grow text-sm md:text-base">
                    {`Unit ${patrol.unit.split(' ')[1]}: Start: ${formatTime(patrol.startTime)}, End: ${formatTime(patrol.endTime)}, Area: ${patrol.patrolArea ? patrol.patrolArea.legend : "N/A"}`}
                  </div>
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    {!patrols.find(p => p.id === patrol._id) ? (
                      <button onClick={() => startPatrol(patrol._id, patrol.startTime)} className="bg-green-600 text-white text-sm md:text-base px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-green-700 transition">
                        Start Patrol
                      </button>
                    ) : (
                      <button onClick={() => endPatrol(patrol._id)} className="bg-red-600 text-white text-sm md:text-base px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-red-700 transition">
                        End Patrol
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center py-4 text-sm md:text-base">No schedule for today's patrol.</li>
            )}
          </ul>

          <h2 className="text-xl md:text-2xl mb-2">Log Patrol Report</h2>
          <textarea
            className="border p-2 mb-4 w-full h-24 rounded text-sm md:text-base text-black"
            placeholder="Enter your patrol report..."
            value={currentReport}
            onChange={(e) => setCurrentReport(e.target.value)}
          />

          <div className="mb-4 flex justify-center">
            <button onClick={() => setShowUpcomingSchedule(true)} className="bg-blue-600 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded-lg shadow hover:bg-blue-700 transition">
              Upcoming Patrol Schedule
            </button>
          </div>

          <div className="mb-4 flex justify-center">
            <button onClick={() => setShowReportIncident(true)} className="bg-green-600 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded-lg shadow hover:bg-green-700 transition">
              Report an Incident
            </button>
          </div>

          <div className="mb-4 flex justify-center">
            <button onClick={() => setShowReportedIncidents(true)} className="bg-yellow-600 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded-lg shadow hover:bg-yellow-700 transition">
              View Reported Incidents
            </button>
          </div>
        </div>
      )}

      {showUpcomingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg relative TopNav">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex justify-between items-center">
              Upcoming Patrol Schedule
              <button
                onClick={() => setShowUpcomingSchedule(false)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </h2>
            <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              <table className="min-w-full bg-white shadow-md rounded-lg border overflow-hidden text-center">
                <thead className="TopNav">
                  <tr>
                    <th className="border px-4 py-2 text-sm md:text-base">Unit</th>
                    <th className="border px-4 py-2 text-sm md:text-base">Start Time</th>
                    <th className="border px-4 py-2 text-sm md:text-base">End Time</th>
                    <th className="border px-4 py-2 text-sm md:text-base">Patrol Area</th>
                  </tr>
                </thead>
                <tbody className="text-black">
                  {upcomingPatrols.length > 0 ? (
                    upcomingPatrols.map((patrol, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2 text-sm md:text-base">{patrol.unit}</td>
                        <td className="border px-4 py-2 text-sm md:text-base">{formatTime(patrol.startTime)}</td>
                        <td className="border px-4 py-2 text-sm md:text-base">{formatTime(patrol.endTime)}</td>
                        <td className="border px-4 py-2 text-sm md:text-base">{patrol.patrolArea ? patrol.patrolArea.legend : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-sm md:text-base">No upcoming patrols scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showReportIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg relative TopNav">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex justify-between items-center">
              Report an Incident
              <button
                onClick={() => setShowReportIncident(false)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="type"
                placeholder="Incident Type"
                value={incident.type}
                onChange={handleIncidentChange}
                className="border p-2 mb-2 w-full rounded text-sm md:text-base text-black"
              />
              <input
                type="text"
                name="description"
                placeholder="Incident Description"
                value={incident.description}
                onChange={handleIncidentChange}
                className="border p-2 mb-2 w-full rounded text-sm md:text-base text-black"
              />
              <input
                type="text"
                name="location"
                placeholder="Incident Location"
                value={incident.location}
                onChange={handleIncidentChange}
                className="border p-2 mb-4 w-full rounded text-sm md:text-base text-black"
              />
              <button onClick={reportIncident} className="bg-green-600 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded shadow hover:bg-green-700 transition">
                Submit Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportedIncidents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg relative TopNav">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex justify-between items-center">
              Reported Incidents
              <button
                onClick={() => setShowReportedIncidents(false)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </h2>
            <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              <ul className="list-disc list-inside">
                {incidentLog.length > 0 ? (
                  incidentLog.map((inc, index) => (
                    <li key={index} className="border-b py-2 text-sm md:text-base">
                      {`Type: ${inc.type}, Description: ${inc.description}, Location: ${inc.location}`}
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-sm md:text-base">No reported incidents.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
