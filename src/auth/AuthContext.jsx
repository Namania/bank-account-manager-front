import { createContext, useContext, useState, useEffect } from "react";
import { getToken } from "./getToken";
import { getUser } from "./getUser";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(`${LOCAL_KEY}.token`);
      
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        try {
          const response = await getUser();
          const userData = response.results ? response.results[0] : response[0];
          setUser(userData);
        } catch (error) {
          console.error("Échec du refresh auth:", error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem(`${LOCAL_KEY}.token`);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [LOCAL_KEY]);

  const login = async (credentials) => {
    const data = await getToken(credentials);
    if (data.token) {
      const users = await getUser();
      const currentUser = users.results[0];
      setUser(currentUser);
      return currentUser;
    }
  };

  const logout = () => {
    localStorage.removeItem(`${LOCAL_KEY}.token`);
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLogged: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
