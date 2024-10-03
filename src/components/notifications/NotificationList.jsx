import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function NotificationList({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null); // Ref for dropdown container

  useEffect(() => {
    // Function to fetch notifications
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view notifications.");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data.notifications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Error fetching notifications.");
      }
    };

    fetchNotifications();

    // Handle marking notifications as read when dropdown is opened
    const markNotificationsAsRead = async () => {
      const token = localStorage.getItem("token");
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/notifications/mark-read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // After marking as read, fetch notifications again to update UI
        fetchNotifications();
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    markNotificationsAsRead();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose(); // Call the onClose function passed from the parent to close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50 TopNav">
      <h2 className="font-bold mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className="space-y-2 TopNav">
          {notifications.slice(0, 3).map((notification) => (
            <li
              key={notification._id}
              className={`p-2 ${notification.read ? "bg-gray-100" : "bg-gray-200"} rounded TopNav`}
            >
              {notification.message}{" "}
              <span className="text-sm text-gray-500">
                <br />- {new Date(notification.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
