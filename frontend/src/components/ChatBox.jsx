import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useSocket } from '../SocketContext';

const ChatBox = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { socket, connected, joinRoom, sendMessage: socketSendMessage } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser && socket) {
      // Create a unique room ID for the conversation
      const roomId = [user._id, selectedUser._id].sort().join('-');
      
      // Clear messages first to prevent showing old conversation
      setMessages([]);
      
      joinRoom(roomId);

      // Listen for incoming messages
      const handleReceiveMessage = (message) => {
        console.log('Received message:', message);
        setMessages(prev => {
          // Avoid duplicates by checking both _id and timestamp
          const isDuplicate = prev.some(m => 
            m._id === message._id || 
            (m.message === message.message && 
             Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
          );
          if (isDuplicate) {
            return prev;
          }
          return [...prev, message];
        });
      };

      socket.on('receive_message', handleReceiveMessage);

      // Cleanup socket listener when component unmounts or user changes
      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [selectedUser, socket, user._id, joinRoom]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/conversation/p1/${selectedUser._id}`, {
        withCredentials: true
      });
      
      if (response.data.sucess) {
        // The messages are in response.data.data.messages after population
        const conversationData = response.data.data;
        setMessages(conversationData?.messages || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      console.log('Sending message:', messageText);
      // Send via HTTP API for reliability
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/message/p1/${selectedUser._id}`,
        { message: messageText },
        { withCredentials: true }
      );

      console.log('Message sent response:', response.data);

      if (response.data.sucess) {
        // Also emit socket event for real-time delivery
        if (socket && connected) {
          socketSendMessage({
            senderId: user._id,
            receiverId: selectedUser._id,
            message: messageText
          });
        } else {
          // If socket not connected, add message to local state manually
          const newMsg = response.data.data;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m._id === newMsg._id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore the message
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-300 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={selectedUser.profilephoto}
              alt={selectedUser.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold">{selectedUser.fullname}</h2>
              <p className="text-sm text-gray-500">@{selectedUser.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center">Loading messages...</div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === user._id || message.senderId?._id === user._id;
            return (
            <div
              key={message._id}
              className={`flex ${
                isSender ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isSender
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <p>{message.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-300 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
