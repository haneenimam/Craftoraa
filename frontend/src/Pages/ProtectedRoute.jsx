
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState("loading");
  const [hasAccess, setHasAccess] = useState(false);

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
      console.log("Response from /verify:", res.data); 

const userRole = res.data.user.role;
      console.log("Extracted user role:", userRole); 
      console.log("Allowed roles:", allowedRoles); 
        if (!allowedRoles.includes(userRole)) {
          setStatus("unauthorized");
        } else {
          setHasAccess(true);
          setStatus("authorized");
        }
      } catch {
        setStatus("unauthenticated");
      }
    };

    verify();
  }, [allowedRoles]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthorized") return <Navigate to="/unauthorized" />;

  return hasAccess ? children : null;
};

export default ProtectedRoute;
