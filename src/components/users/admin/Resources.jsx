import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function TanodPersonels() {
  const [tanods, setTanods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTanod, setSelectedTanod] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [showEquipmentPanel, setShowEquipmentPanel] = useState(false); // Show/Hide equipment panel state
  const [showReturned, setShowReturned] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  const baseURL = `${process.env.REACT_APP_API_URL}`;

  // Fetch tanods list
  useEffect(() => {
    const fetchTanods = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/auth/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const users = await response.json();

        if (Array.isArray(users)) {
          const tanodsList = users.filter((user) => user.userType === "tanod");
          setTanods(tanodsList); // Update the state with fetched tanods
        } else {
          toast.error("Unexpected response format.");
        }
      } catch (error) {
        console.error("Error fetching tanods:", error);
        toast.error("Error fetching Tanods.");
      } finally {
        setLoading(false);
      }
    };
    fetchTanods();
  }, [baseURL]);

  // Fetch equipment borrowed by the selected tanod
  const fetchEquipment = async (tanodId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    try {
      setLoadingEquipments(true);
      const response = await axios.get(`${baseURL}/equipments/user/${tanodId}/equipments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch equipment.");
      }
      setEquipments(response.data); // Set equipment for selected tanod
    } catch (error) {
      console.error("Error fetching equipment", error);
      toast.error("No Borrowed Equipments");
    } finally {
      setLoadingEquipments(false);
    }
  };

  const handleViewEquipment = (tanod) => {
    setSelectedTanod(tanod); // Set the selected tanod
    setEquipments([]);
    fetchEquipment(tanod._id); // Fetch the equipment for the tanod
    setShowEquipmentPanel(true); // Show the equipment panel
  };

  // Filtered items logic
  const filteredItems = equipments.filter((item) =>
    (showReturned
      ? item.returnDate !== "1970-01-01T00:00:00.000Z"
      : item.returnDate === "1970-01-01T00:00:00.000Z") &&
    (!filterDate || dayjs(item.returnDate).isSame(dayjs(filterDate), "day"))
  );

  const formatDate = (date) => {
    const notReturnedDate = "1970-01-01T00:00:00.000Z";
    if (date === notReturnedDate) {
      return <span className="text-red-500">Not Yet Returned</span>;
    }
    return dayjs(date).format("hh:mm A DD-MM-YYYY");
  };

  return (
    <div className="container mx-auto relative">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Tanod Personnel List</h1>

      {/* Tanod Table */}
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg border overflow-hidden text-center">
          <thead className=" TopNav">
            <tr>
              <th className="py-2 px-4 border">Profile Picture</th>
              <th className="py-2 px-4 border">Full Name</th>
              <th className="py-2 px-4 border">Contact</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-black">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading Tanod personnel...
                </td>
              </tr>
            ) : (
              tanods.map((tanod) => (
                <tr key={tanod._id} className="text-center">
                  <td className="py-2 px-4 border">
                    <img
                      src={tanod.profilePicture || "https://via.placeholder.com/50"}
                      alt={tanod.firstName}
                      className="w-10 h-10 rounded-full mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    {`${tanod.firstName} ${tanod.middleName || ""} ${tanod.lastName}`}
                  </td>
                  <td className="py-2 px-4 border">
                    {tanod.contactNumber || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mx-1 hover:bg-blue-700"
                      onClick={() => handleViewEquipment(tanod)}
                    >
                      View Equipment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Display Equipment for the Selected Tanod */}
      {showEquipmentPanel && selectedTanod && (
        <div className="fixed inset-0 bg-white bg-opacity-0 z-50 p-4 sm:p-10 flex flex-col items-center justify-center shadow-lg overflow-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative TopNav">
            <h2 className="text-xl font-bold mb-2">
              Equipment Borrowed by {selectedTanod.firstName} {selectedTanod.lastName}
            </h2>

            {/* Close Button */}
            <button
              onClick={() => setShowEquipmentPanel(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              &#x2715;
            </button>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 space-y-4 sm:space-y-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowReturned(false)}
                  className={`py-2 px-4 border-2 rounded-2xl ${!showReturned ? "border-blue-500" : "bg-blue-500"} TopNav`}
                >
                  Currently Borrowed
                </button>
                <button
                  onClick={() => setShowReturned(true)}
                  className={`py-2 px-4 border-2 rounded-2xl ${showReturned ? "border-blue-500" : "bg-blue-500"} TopNav`}
                >
                  Returned Items
                </button>
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 p-2 rounded-2xl TopNav"
              />
            </div>

            {/* Equipment Table */}
            {loadingEquipments ? (
              <p>Loading equipment...</p>
            ) : filteredItems.length === 0 ? (
              <p>No equipment found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg border overflow-hidden text-center">
                  <thead className="TopNav">
                    <tr>
                      <th className="py-2 px-4 border">Item Name</th>
                      <th className="py-2 px-4 border">Borrow Date & Time</th>
                      <th className="py-2 px-4 border">Return Date & Time</th>
                      <th className="py-2 px-4 border">Item Image</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {filteredItems.map((item, index) => (
                      <tr key={index} className="text-center hover:bg-slate-100 hover:cursor-pointer">
                        <td className="py-2 px-4 border">{item.name}</td>
                        <td className="py-2 px-4 border">{formatDate(item.borrowDate)}</td>
                        <td className="py-2 px-4 border">{formatDate(item.returnDate)}</td>
                        <td className="py-2 px-4 border">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover mx-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
