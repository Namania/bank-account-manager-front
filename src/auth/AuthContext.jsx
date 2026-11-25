import { createContext, useContext, useState, useEffect } from "react";
import { login as openSession, logout as closeSession, setSessionExpiredHandler } from "../api/client";
import { getUser } from "./getUser";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The session cookies are HttpOnly: the only way to know whether a session
    // exists is to ask the API who we are.
    setSessionExpiredHandler(() => setUser(null));

    const initializeAuth = async () => {
      try {
        setUser(await getUser());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();

    return () => setSessionExpiredHandler(() => {});
  }, []);

  const login = async (credentials) => {
    await openSession(credentials);
    const currentUser = await getUser();
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    try {
      await closeSession();
    } catch {
      // Even if the API cannot be reached, leave the signed-in screens.
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLogged: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
