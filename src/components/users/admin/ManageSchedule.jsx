import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ScheduleMaker() {
  const [tanods, setTanods] = useState([]);
  const [unit, setUnit] = useState("Unit 1");
  const [selectedTanods, setSelectedTanods] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [scheduleMembers, setScheduleMembers] = useState([]);
  const [showMembersTable, setShowMembersTable] = useState(false);

  useEffect(() => {
    const fetchTanods = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in.");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTanods(response.data.filter((user) => user.userType === "tanod"));
      } catch (error) {
        console.error("Error fetching tanods:", error);
        toast.error("Error fetching tanods.");
      }
    };

    fetchTanods();
  }, []);

  const handleCreateOrUpdateSchedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/auth/schedule/${currentScheduleId}`
      : `${process.env.REACT_APP_API_URL}/auth/schedule`;

    try {
      const response = await axios({
        method: isEditing ? "put" : "post",
        url,
        data: { unit, tanods: selectedTanods, startTime, endTime },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isEditing) {
        setSchedules(
          schedules.map((schedule) =>
            schedule._id === currentScheduleId
              ? response.data.schedule
              : schedule
          )
        );
        toast.success("Schedule updated successfully!");
      } else {
        setSchedules([...schedules, response.data.schedule]);
        toast.success("Schedule created successfully!");
      }

      setShowForm(false);
    } catch (error) {
      console.error("Error creating/updating schedule:", error);
      toast.error("Error creating/updating schedule.");
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSchedules(response.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast.error("Error fetching schedules.");
      }
    };

    fetchSchedules();
  }, []);

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setUnit("Unit 1");
    setSelectedTanods([]);
    setStartTime("");
    setEndTime("");
    setIsEditing(false);
    setCurrentScheduleId(null);
  };

  const handleViewMembers = async (schedule) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/schedule/${schedule._id}/members`,
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

  const handleDeleteSchedule = async (scheduleId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this schedule?</p>
        <button
          className="bg-green-500 text-white p-2 rounded m-2"
          onClick={() => confirmDeleteSchedule(scheduleId)}
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
  };

  const confirmDeleteSchedule = async (scheduleId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/schedule/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(schedules.filter((schedule) => schedule._id !== scheduleId));
      toast.dismiss();
      toast.success("Schedule deleted successfully!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error deleting schedule.");
    }
  };

  return (
    <div className="container mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Tanod Schedule Maker</h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        hidden={showForm}
      >
        Create Schedule
      </button>

      {showForm && (
        <form onSubmit={handleCreateOrUpdateSchedule} className="mb-4 p-4 border rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block mb-1">Unit:</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="Unit 1">Unit 1</option>
              <option value="Unit 2">Unit 2</option>
              <option value="Unit 3">Unit 3</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Select Tanods:</label>
            <select
              multiple
              value={selectedTanods}
              onChange={(e) =>
                setSelectedTanods([...e.target.selectedOptions].map((option) => option.value))
              }
              className="border p-2 rounded w-full"
            >
              {tanods.map((tanod) => (
                <option key={tanod._id} value={tanod._id}>
                  {`${tanod.firstName} ${tanod.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">End Time:</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="flex justify-between">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              {isEditing ? "Update Schedule" : "Create Schedule"}
            </button>
            <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

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
                  onClick={() => handleViewMembers(schedule)}
                >
                  View Members
                </button>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mx-1"
                  onClick={() => {
                    setUnit(schedule.unit);
                    setSelectedTanods(schedule.tanods.map((tanod) => tanod._id));
                    setStartTime(schedule.startTime);
                    setEndTime(schedule.endTime);
                    setCurrentScheduleId(schedule._id);
                    setIsEditing(true);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded mx-1"
                  onClick={() => handleDeleteSchedule(schedule._id)}
                >
                  Delete
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
