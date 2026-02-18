import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getToken } from "./getToken";
import { getUser } from "./getUser";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get(`${LOCAL_KEY}_access`);
      
      if (token) {
        try {
          const response = await getUser();
          const userData = response.results ? response.results[0] : response[0];
          setUser(userData);
        } catch (error) {
          setUser(null);
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
    Cookies.remove(`${LOCAL_KEY}_access`);
    Cookies.remove(`${LOCAL_KEY}_refresh`);
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
