import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Only connect if user is authenticated
        if (user?._id) {
            // Create socket connection
            const newSocket = io('http://localhost:4000', {
                withCredentials: true
            });

            // Socket event handlers
            newSocket.on('connect', () => {
                console.log('Socket connected');
                setConnected(true);
                // Authenticate socket with user ID
                newSocket.emit('authenticate', user._id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setConnected(false);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                newSocket.close();
            };
        }
    }, [user?._id]);

    // Join a chat room
    const joinRoom = (roomId) => {
        if (socket && connected) {
            socket.emit('join_room', roomId);
        }
    };

    // Send a message
    const sendMessage = (messageData) => {
        if (socket && connected) {
            socket.emit('send_message', messageData);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, connected, joinRoom, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
