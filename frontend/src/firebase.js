// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config (replace placeholders with real values from Firebase settings)
const firebaseConfig = {
  apiKey: "AIzaSyCg0r1Wx1m0FxRU0sAxU8fc9HzjMoCK93k",
  authDomain: "legal-ease-ai.firebaseapp.com",
  projectId: "legal-ease-ai",
  storageBucket: "legal-ease-ai.appspot.com",
  messagingSenderId: "811329173519",
  appId: "1:811329173519:web:7d0ec6536b88bde0408b7a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth + Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: force account selection popup
googleProvider.setCustomParameters({ prompt: "select_account" });
