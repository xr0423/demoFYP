import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    try {
      // Use makeRequest instead of axios directly
      const res = await makeRequest.post("auth/login", inputs);
      setCurrentUser(res.data);

      // Check if the user type is 'regular' and set showAdvertisement in local storage
      if (res.data.type === "regular") {
        localStorage.setItem("showAdvertisement", true);
      } else {
        localStorage.removeItem("showAdvertisement");
      }
    } catch (error) {
      throw error;  // Propagate error to handle in `Login.jsx`
    }
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
