// MessageList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view messages.");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.messages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Error fetching messages.");
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
      <h2 className="font-bold mb-2">Messages</h2>
      {messages.length === 0 ? (
        <p>No new messages</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((message) => (
            <li key={message._id} className="p-2 bg-gray-100 rounded">
              {message.content}{" "}
              <span className="text-sm text-gray-500">
                - {new Date(message.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
