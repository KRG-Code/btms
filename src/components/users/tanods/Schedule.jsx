import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../../utils/Loading"; // Assuming you have a Loading component

export default function TanodSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [scheduleMembers, setScheduleMembers] = useState([]);
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [userId, setUserId] = useState(null); // Store userId
  const [loadingSchedules, setLoadingSchedules] = useState(false); // Loading state for schedules
  const [loadingMembers, setLoadingMembers] = useState(false); // Loading state for members

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

      setLoadingSchedules(true); // Start loading schedules
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
      } finally {
        setLoadingSchedules(false); // End loading schedules
      }
    };

    fetchSchedules();
  }, []);

  // View members of a schedule
  const handleViewMembers = async (scheduleId) => {
    const token = localStorage.getItem("token");

    setLoadingMembers(true); // Start loading members
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
    } finally {
      setLoadingMembers(false); // End loading members
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
            <th className="border">Unit</th>
            <th className="border">Start Time</th>
            <th className="border">End Time</th>
            <th className="border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loadingSchedules ? (
            <tr>
              <td colSpan="4" className="text-center ">
                <Loading type="circle" /> {/* Loading spinner while fetching schedules */}
                Loading Schedules...
              </td>
            </tr>
          ) : (
            schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td className="border">{schedule.unit}</td>
                <td className="border">{new Date(schedule.startTime).toLocaleString()}</td>
                <td className="border">{new Date(schedule.endTime).toLocaleString()}</td>
                <td className="border">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mx-1 my-3"
                    onClick={() => handleViewMembers(schedule._id)}
                  >
                    View Members
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Show loading spinner while schedule members are being fetched */}
      {loadingMembers ? (
        <div className="mt-8 text-center">
          <Loading type="circle" /> {/* Loading spinner while fetching members */}
        </div>
      ) : (
        showMembersTable && (
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
                  <th className="border">Profile Picture</th>
                  <th className="border">Full Name</th>
                  <th className="border">Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td colSpan="3" className="text-center">
                      <Loading type="circle" /> {/* Loading spinner while fetching members */}
                      Loading Members...
                    </td>
                  </tr>
                ) : (
                  scheduleMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="border">
                        <img
                          src={member.profilePicture || "https://via.placeholder.com/50"}
                          alt={member.firstName}
                          className="w-10 h-10 rounded-full mx-auto"
                        />
                      </td>
                      <td className="border">{`${member.firstName} ${member.lastName}`}</td>
                      <td className="border">{member.contactNumber || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
