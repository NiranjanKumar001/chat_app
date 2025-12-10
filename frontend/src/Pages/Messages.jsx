import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';

function Messages() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col">
        <Sidebar onSelectUser={setSelectedUser} />
        <button 
          onClick={handleLogout}
          className="p-3 bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <ChatBox selectedUser={selectedUser} />
    </div>
  );
}

export default Messages;