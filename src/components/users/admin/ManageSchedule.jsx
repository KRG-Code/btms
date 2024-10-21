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
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    const fetchTanods = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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

      resetForm(); // Reset the form after submission
    } catch (error) {
      console.error("Error creating/updating schedule:", error);
      toast.error("Error creating/updating schedule.");
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      const token = localStorage.getItem("token");
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
        console.error("Error fetching schedules:", error);
        toast.error("Error fetching schedules.");
      } finally {
        setLoadingSchedules(false);
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
    setShowForm(false);
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
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/auth/schedule/${scheduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchedules(schedules.filter((schedule) => schedule._id !== scheduleId));
      toast.dismiss();
      toast.success("Schedule deleted successfully!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error deleting schedule.");
    }
  };

  return (
    <div className="container mx-auto relative">
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center">
          <form
            onSubmit={handleCreateOrUpdateSchedule}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative TopNav"
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &#x2715;
            </button>
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Schedule" : "Create Schedule"}
            </h2>

            <div className="mb-4">
              <label className="block mb-1">Unit:</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="border p-2 rounded w-full text-black"
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
                  setSelectedTanods(
                    [...e.target.selectedOptions].map((option) => option.value)
                  )
                }
                className="border p-2 rounded w-full text-black"
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
                value={
                  startTime
                    ? new Date(startTime).toLocaleString("sv").slice(0, 16)
                    : ""
                }
                onChange={(e) => setStartTime(e.target.value)}
                className="border p-2 rounded w-full text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">End Time:</label>
              <input
                type="datetime-local"
                value={
                  endTime
                    ? new Date(endTime).toLocaleString("sv").slice(0, 16)
                    : ""
                }
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-2 rounded w-full text-black"
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                {isEditing ? "Update Schedule" : "Create Schedule"}
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Scheduled Patrols</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg border overflow-hidden text-center">
        <thead className="TopNav">
          <tr>
            <th className="border">Unit</th>
            <th className="border">Start Time</th>
            <th className="border">End Time</th>
            <th className="border">Actions</th>
          </tr>
        </thead>
        <tbody className="text-black">
          {loadingSchedules ? (
            <tr>
              <td colSpan="4" className="text-center py-4">
                Loading Schedules...
              </td>
            </tr>
          ) : schedules.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4">
                No schedules found.
              </td>
            </tr>
          ) : (
            schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td className="border">{schedule.unit}</td>
                <td className="border">
                  {new Date(schedule.startTime).toLocaleString()}
                </td>
                <td className="border">
                  {new Date(schedule.endTime).toLocaleString()}
                </td>
                <td className="border">
                  <button
                    className="bg-green-500 text-white w-32 h-10 rounded mx-1"
                    onClick={() => handleViewMembers(schedule)}
                  >
                    View Members
                  </button>
                  <button
                    className="bg-yellow-500 text-white w-32 h-10 rounded mx-1"
                    onClick={() => {
                      setUnit(schedule.unit);
                      setSelectedTanods(
                        schedule.tanods.map((tanod) => tanod._id)
                      );
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
                    className="bg-red-500 text-white w-32 h-10 rounded mx-1"
                    onClick={() => handleDeleteSchedule(schedule._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showMembersTable && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative TopNav">
            <h2 className="text-xl font-bold mb-4">Assigned Tanod Members</h2>
            <button
              onClick={() => setShowMembersTable(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &#x2715;
            </button>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg border overflow-hidden">
                <thead className="TopNav">
                  <tr>
                    <th>Profile Picture</th>
                    <th>Full Name</th>
                    <th>Contact Number</th>
                  </tr>
                </thead>
                <tbody className="text-black">
                  {scheduleMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="border">
                        <img
                          src={
                            member.profilePicture ||
                            "https://via.placeholder.com/50"
                          }
                          alt={member.firstName}
                          className="w-10 h-10 rounded-full mx-auto"
                        />
                      </td>
                      <td className="border">{`${member.firstName} ${member.lastName}`}</td>
                      <td className="border">
                        {member.contactNumber || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
