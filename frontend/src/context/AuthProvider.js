import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // For now, allow access even if Firebase fails
      // In production, you should handle Firebase errors properly
      setUser(firebaseUser || { isGuest: true, displayName: 'Guest User' });
      setLoading(false);
    });

    // Fallback: if Firebase auth fails to initialize, set a guest user after 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        setUser({ isGuest: true, displayName: 'Guest User' });
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [loading]);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
