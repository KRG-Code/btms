import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TanodSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [scheduleMembers, setScheduleMembers] = useState([]);
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [userId, setUserId] = useState(null); // Store userId

  // Fetch logged-in user's profile using /me route
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(response.data._id); // Set the userId from response
      return response.data._id;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Error fetching user profile.");
    }
  };

  // Fetch schedules for the logged-in Tanod
  useEffect(() => {
    const fetchSchedules = async () => {
      const token = localStorage.getItem("token");

      // Fetch the user profile and extract userId
      const userId = await fetchUserProfile();
      if (!token || !userId) {
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/tanod-schedules/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSchedules(response.data); // Set schedules data
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast.error("Error fetching schedules.");
      }
    };

    fetchSchedules();
  }, []);

  // View members of a schedule
  const handleViewMembers = async (scheduleId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/schedule/${scheduleId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScheduleMembers(response.data.tanods);
      setShowMembersTable(true);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Error fetching members.");
    }
  };

  return (
    <div className="container mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Your Schedule</h1>

      <h2 className="text-xl font-bold mb-4">Scheduled Patrols</h2>
      <table className="min-w-full bg-white border TopNav text-center">
        <thead>
          <tr>
            <th>Unit</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule._id}>
              <td>{schedule.unit}</td>
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded mx-1"
                  onClick={() => handleViewMembers(schedule._id)}
                >
                  View Members
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showMembersTable && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
            Assigned Tanod Members
            <button
              onClick={() => setShowMembersTable(false)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </h2>
          <table className="min-w-full bg-white border TopNav text-center">
            <thead>
              <tr>
                <th>Profile Picture</th>
                <th>Full Name</th>
                <th>Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {scheduleMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <img
                      src={member.profilePicture || "https://via.placeholder.com/50"}
                      alt={member.firstName}
                      className="w-10 h-10 rounded-full mx-auto"
                    />
                  </td>
                  <td>{`${member.firstName} ${member.lastName}`}</td>
                  <td>{member.contactNumber || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
