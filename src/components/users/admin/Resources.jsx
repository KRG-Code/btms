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
  const [showReturned, setShowReturned] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  const baseURL = `${process.env.REACT_APP_API_URL}`; // Adjust based on your backend server port

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
      toast.error("Error fetching equipment.");
    } finally {
      setLoadingEquipments(false);
    }
  };

  const handleViewEquipment = (tanod) => {
    setSelectedTanod(tanod); // Set the selected tanod
    fetchEquipment(tanod._id); // Fetch the equipment for the tanod
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
    <div className="container mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Tanod Personnel List</h1>

      {/* Tanod Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border TopNav">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Profile Picture</th>
              <th className="py-2 px-4 border">Full Name</th>
              <th className="py-2 px-4 border">Contact</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
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
      {selectedTanod && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">
            Equipment Borrowed by {selectedTanod.firstName} {selectedTanod.lastName}
            <button
        onClick={() => setSelectedTanod(null)} // Close button functionality
        className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
      >
        Close
      </button>
          </h2>

          {/* Filter Section */}
          <div className="flex justify-between mb-4">
            <div>
              <button
                onClick={() => setShowReturned(false)}
                className={`py-2 px-4 ${!showReturned ? "TopNav focus:outline-none focus:ring-1 focus:ring-blue5 " : "TopNav"}`}
              >
                Currently Borrowed
              </button>
              <button
                onClick={() => setShowReturned(true)}
                className={`py-2 px-4 ml-1 ${showReturned ? "TopNav focus:outline-none focus:ring-1 focus:ring-blue5" : "TopNav"}`}
              >
                Returned Items
              </button>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 p-2 rounded TopNav"
            />
          </div>

          {/* Equipment Table */}
          {loadingEquipments ? (
            <p>Loading equipment...</p>
          ) : filteredItems.length === 0 ? (
            <p>No equipment found.</p>
          ) : (
            <table className="min-w-full bg-white shadow-md border overflow-hidden TopNav">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Item Name</th>
                  <th className="py-2 px-4 border">Borrow Date & Time</th>
                  <th className="py-2 px-4 border">Return Date & Time</th>
                  <th className="py-2 px-4 border">Item Image</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={index} className=" text-center">
                    <td className="py-2 px-4 border">{item.name}</td>
                    <td className="py-2 px-4 border">{formatDate(item.borrowDate)}</td>
                    <td className="py-2 px-4 border">{formatDate(item.returnDate)}</td>
                    <td className="py-2 px-4 border">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-24 h-24 object-cover"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
