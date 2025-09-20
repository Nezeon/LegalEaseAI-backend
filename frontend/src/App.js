import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import BeautifulLogin from "./pages/BeautifulLogin";
import BeautifulDashboard from "./pages/BeautifulDashboard";
import BeautifulUpload from "./pages/BeautifulUpload";
import BeautifulAdvancedUpload from "./pages/BeautifulAdvancedUpload";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <BeautifulDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <BeautifulDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: <BeautifulLogin />,
  },
  {
    path: "/upload",
    element: (
      <PrivateRoute>
        <BeautifulUpload />
      </PrivateRoute>
    ),
  },
  {
    path: "/advanced-upload",
    element: (
      <PrivateRoute>
        <BeautifulAdvancedUpload />
      </PrivateRoute>
    ),
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
