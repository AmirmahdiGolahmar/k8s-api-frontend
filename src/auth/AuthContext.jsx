import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The session cookie survives a page refresh; this is how we find out
    // whether it's still valid without asking the user to log in again.
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const loggedInUser = await api.login(username, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // register_view logs the new account in server-side, same as login --
  // this mirrors that by updating local state the same way.
  const register = useCallback(async (username, password) => {
    const newUser = await api.register(username, password);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
