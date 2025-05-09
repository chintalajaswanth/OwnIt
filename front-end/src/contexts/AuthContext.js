import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Generate a unique tab ID for the session
  const tabId = sessionStorage.getItem('tabId') || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('tabId', tabId);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem(`token_${tabId}`));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set token for authentication
  const setAuthToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      sessionStorage.setItem(`token_${tabId}`, newToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      sessionStorage.removeItem(`token_${tabId}`);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('http://localhost:5000/api/v1/auth/me');
        setUser(res.data.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (event) => {
      if (event.key === `token_${tabId}`) {
        const newToken = event.newValue;
        if (newToken !== token) {
          setAuthToken(newToken);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, tabId]);

  const register = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAuthToken(res.data.token);
      const userRes = await axios.get('http://localhost:5000/api/v1/auth/me');
      setUser(userRes.data.data);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login', { email, password });
      setAuthToken(res.data.token);
      const userRes = await axios.get('http://localhost:5000/api/v1/auth/me');
      setUser(userRes.data.data);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(
        'http://localhost:5000/api/v1/auth/updatepassword',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Password update failed',
      };
    }
  };

  const updateDetails = async (updateData, userId) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.put(
        `http://localhost:5000/api/v1/users/${userId}/updatedetails`,
        updateData,
        config
      );

      if (res.data.success) {
        setUser(res.data.data);
      }

      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to update profile',
      };
    }
  };

  const followUser = async (userId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/v1/users/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.data;
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Follow action failed',
      };
    }
  };

  const unfollowUser = async (userId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/v1/users/${userId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.data;
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Unfollow action failed',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        updatePassword,
        updateDetails,
        followUser,
        unfollowUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};