import React, { createContext, useContext, useState, useEffect, useCallback } from "react";


const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const login = (userData) => {
  const normalizedUser = {
    ...userData,
    role: userData.role?.toLowerCase(), 
  };

  localStorage.setItem("loggedInUser", JSON.stringify(normalizedUser));
  setUser(normalizedUser);
};


 
  // Clears the token too, otherwise protected pages stay reachable after logout
  const logout = useCallback(() => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
