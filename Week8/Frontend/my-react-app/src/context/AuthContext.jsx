import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

/**
 * Auth Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user from token (on refresh)
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/profile");

        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login
   */
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    setUser(data);
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "Admin",
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook
 */
export const useAuth = () => useContext(AuthContext);