import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-green-100">
      <h1 className="text-2xl mb-4">Welcome, {user?.displayName}</h1>

      <button
        onClick={logout}
        className="px-4 py-2 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>

      {/* Upload buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/upload")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Basic Upload
        </button>
        <button
          onClick={() => navigate("/advanced-upload")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Advanced Analysis
        </button>
      </div>
    </div>
  );
}
