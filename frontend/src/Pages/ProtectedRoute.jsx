
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/Auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState("loading");
  const { logout } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRole = res.data.user.role;
        setStatus(allowedRoles.includes(userRole) ? "authorized" : "unauthorized");
      } catch (err) {
        // Expired or invalid token: clear the stale session and send the user to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          setStatus("unauthenticated");
        } else {
          setStatus("error");
        }
      }
    };

    verify();
  }, [allowedRoles, logout]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthorized") return <Navigate to="/unauthorized" />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "error") {
    return <div className="text-center mt-5">Could not reach the server. Please try again.</div>;
  }

  return children;
};

export default ProtectedRoute;
