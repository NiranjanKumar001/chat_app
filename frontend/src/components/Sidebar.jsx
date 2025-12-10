import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const Sidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/getall`, {
          withCredentials: true
        });
        if (response.data.success || response.data.sucess) {
          setUsers(response.data.alluser);
        }
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-80 bg-gray-100 flex flex-col border-r border-gray-300">
      <div className="p-4 border-b border-gray-300 bg-white">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profilephoto} 
            alt={user?.username} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold">{user?.name}</h2>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {users.map((otherUser) => (
          <div
            key={otherUser._id}
            onClick={() => onSelectUser(otherUser)}
            className="flex items-center space-x-3 p-4 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <img
              src={otherUser.profilephoto}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{otherUser.fullname}</h3>
              <p className="text-sm text-gray-500">@{otherUser.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
