import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // ms
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const logout = () => {
    clearTimeout(logoutTimerRef.current);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const scheduleAutoLogout = (tokenValue) => {
    clearTimeout(logoutTimerRef.current);
    const expiry = getTokenExpiry(tokenValue);
    if (!expiry) return;
    const delay = expiry - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      logout();
      window.location.href = '/login';
    }, delay);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const expiry = getTokenExpiry(storedToken);
        if (expiry && expiry > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          scheduleAutoLogout(storedToken);
        } else {
          // Token already expired on page load
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    return () => clearTimeout(logoutTimerRef.current);
  }, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
    scheduleAutoLogout(tokenValue);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
