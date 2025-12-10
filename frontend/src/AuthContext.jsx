import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check both cookie and localStorage
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (isAuthenticated) {
        const response = await axios.get('http://localhost:4000/api/user/current', {
          withCredentials: true,
        });
        
        if (response.data.sucess) {
          setUser(response.data.user);
        } else {
          setUser(null);
          localStorage.removeItem('isAuthenticated');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // We don't need to make the login request here since it's already done in the Login component
      // Just verify the current session
      const verifyResponse = await axios.get('http://localhost:4000/api/user/current', {
        withCredentials: true
      });
      
      if (verifyResponse.data.sucess) {
        setUser(verifyResponse.data.user);
        localStorage.setItem('isAuthenticated', 'true');
        return { success: true };
      } else {
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        return { success: false, error: verifyResponse.data.message };
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:4000/api/user/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      // Navigation will be handled by the component calling logout
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
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