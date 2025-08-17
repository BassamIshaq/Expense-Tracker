import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check localStorage first, then sessionStorage
        const storedToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (storedToken) {
          setToken(storedToken);

          // Set default auth header
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Get user info
          const storedUser = JSON.parse(
            localStorage.getItem("user") ||
              sessionStorage.getItem("user") ||
              "{}"
          );

          if (storedUser && storedUser.id) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Fetch current user from API
            const res = await axios.get("/api/auth/me");
            setUser(res.data.data);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Store in localStorage or sessionStorage based on rememberMe
      const storageMethod = rememberMe ? localStorage : sessionStorage;
      storageMethod.setItem("token", token);
      storageMethod.setItem("user", JSON.stringify(user));

      // Set in state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      // Set default auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });

      const { token, user } = res.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set in state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      // Set default auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear auth header
    delete axios.defaults.headers.common["Authorization"];

    // Navigate to login
    navigate("/login");
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
