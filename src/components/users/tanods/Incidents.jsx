import React, { useState } from "react";

const Incidents = () => {
  const [patrols, setPatrols] = useState([]);
  const [upcomingPatrols, setUpcomingPatrols] = useState([]);
  const [incident, setIncident] = useState({ type: "", description: "", location: "" });
  const [incidentLog, setIncidentLog] = useState([]);
  const [currentReport, setCurrentReport] = useState("");

  const startPatrol = () => {
    const newPatrol = {
      id: patrols.length + 1,
      unit: "Unit 1",
      startTime: new Date().toISOString(),
      report: "Patrol started.",
    };
    setPatrols([...patrols, newPatrol]);
  };

  const endPatrol = (patrolId) => {
    setPatrols(patrols.map((patrol) => 
      patrol.id === patrolId 
      ? { ...patrol, endTime: new Date().toISOString(), report: currentReport || "Patrol ended." } 
      : patrol
    ));
    setCurrentReport(""); // Reset report after ending patrol
  };

  const handleIncidentChange = (e) => {
    setIncident({ ...incident, [e.target.name]: e.target.value });
  };

  const reportIncident = () => {
    setIncidentLog([...incidentLog, incident]);
    setIncident({ type: "", description: "", location: "" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg TopNav">
      <h1 className="text-3xl font-bold text-center mb-4">Incidents and Patrol Management</h1>
      
      <div className="mb-4 flex justify-center">
        <button onClick={startPatrol} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Start Patrol
        </button>
      </div>

      <h2 className="text-2xl mb-2">Upcoming Patrol Schedule</h2>
      <ul className="list-disc list-inside mb-4">
        {upcomingPatrols.length > 0 ? (
          upcomingPatrols.map((patrol, index) => (
            <li key={index} className="border-b py-2">
              {`Unit: ${patrol.unit}, Start: ${new Date(patrol.startTime).toLocaleString()}`}
            </li>
          ))
        ) : (
          <li>No upcoming patrols scheduled.</li>
        )}
      </ul>

      <h2 className="text-2xl mb-2">Current Patrol Schedule</h2>
      <ul className="list-disc list-inside mb-4">
        {patrols.map((patrol) => (
          <li key={patrol.id} className="flex items-center justify-between border-b py-2">
            <div className="flex-grow">
              {`Unit: ${patrol.unit}, Start: ${new Date(patrol.startTime).toLocaleString()}, Report: ${patrol.report}`}
            </div>
            {!patrol.endTime && (
              <button onClick={() => endPatrol(patrol.id)} className="bg-red-600 text-white px-2 py-1 rounded shadow hover:bg-red-700 transition">
                End Patrol
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl mb-2">Log Patrol Report</h2>
      <textarea
        className="border p-2 mb-4 w-full h-24 rounded text-black"
        placeholder="Enter your patrol report..."
        value={currentReport}
        onChange={(e) => setCurrentReport(e.target.value)}
      />

      <h2 className="text-2xl mb-2">Report an Incident</h2>
      <input
        type="text"
        name="type"
        placeholder="Incident Type"
        value={incident.type}
        onChange={handleIncidentChange}
        className="border p-2 mb-2 w-full rounded text-black"
      />
      <input
        type="text"
        name="description"
        placeholder="Incident Description"
        value={incident.description}
        onChange={handleIncidentChange}
        className="border p-2 mb-2 w-full rounded text-black"
      />
      <input
        type="text"
        name="location"
        placeholder="Incident Location"
        value={incident.location}
        onChange={handleIncidentChange}
        className="border p-2 mb-4 w-full rounded text-black"
      />
      <button onClick={reportIncident} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
        Submit Incident
      </button>

      <h2 className="text-2xl mt-4 mb-2">Reported Incidents</h2>
      <ul className="list-disc list-inside">
        {incidentLog.map((inc, index) => (
          <li key={index} className="border-b py-2">
            {`Type: ${inc.type}, Description: ${inc.description}, Location: ${inc.location}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Incidents;
