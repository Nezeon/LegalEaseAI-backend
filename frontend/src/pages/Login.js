import React from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate

export default function Login() {
  const navigate = useNavigate(); // <-- initialize navigate

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); // <-- redirect to dashboard after login
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}

