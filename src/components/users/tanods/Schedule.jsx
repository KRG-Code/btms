import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../../utils/Loading"; // Assuming you have a Loading component

export default function TanodSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [scheduleMembers, setScheduleMembers] = useState([]);
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return null; // Return null if no token
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(response.data._id);
      return response.data._id;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Error fetching user profile.");
      return null; // Return null on error
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      const token = localStorage.getItem("token");
      const userId = await fetchUserProfile();
      if (!token || !userId) {
        return;
      }

      setLoadingSchedules(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/tanod-schedules/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.length === 0) {
          setSchedules([]);
          toast.info("No schedules set yet.");
        } else {
          setSchedules(response.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSchedules([]); // Ensure schedules are cleared
        } else {
          console.error("Error fetching schedules:", error);
          toast.error("Error fetching schedules.");
        }
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []); // Ensure this runs only once

  const handleViewMembers = async (scheduleId) => {
    const token = localStorage.getItem("token");

    setLoadingMembers(true);
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
      setLoadingMembers(false);
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
              <td colSpan="4" className="text-center">
                <Loading type="circle" />
                Loading Schedules...
              </td>
            </tr>
          ) : schedules.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No schedule set yet.
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

      {loadingMembers ? (
        <div className="mt-8 text-center">
          <Loading type="circle" />
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
                      <Loading type="circle" />
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
