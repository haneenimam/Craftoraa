import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyTokenAndRole = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = res.data.user.role;

        if (allowedRoles && !allowedRoles.includes(userRole)) {
          navigate("/not-authorized");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    verifyTokenAndRole();
  }, [navigate, allowedRoles]);

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
