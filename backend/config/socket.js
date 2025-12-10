import { Server } from 'socket.io';
import { createServer } from 'http';
import { Message } from '../modules/message.modules.js';
import { Conversation } from '../modules/conversation.modules.js';

export function setupSocket(app) {
    const httpServer = createServer(app);
    
    // Create Socket.IO server with CORS configuration
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"], // Your React app URLs
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Store active users and their socket IDs
    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle user authentication and store user info
        socket.on('authenticate', (userId) => {
            activeUsers.set(userId, socket.id);
            console.log(`User ${userId} authenticated with socket ${socket.id}`);
        });

        // Handle joining a chat room (conversation)
        socket.on('join_room', (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined room ${conversationId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (messageData) => {
            try {
                const { senderId, receiverId, message } = messageData;

                // Find or create conversation
                let conversation = await Conversation.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [senderId, receiverId]
                    });
                }

                // Create and save the message
                const newMessage = await Message.create({
                    senderId,
                    reciverId: receiverId,
                    message
                });

                // Add message to conversation
                conversation.messages.push(newMessage._id);
                await conversation.save();

                // Emit the message to the room
                const room = [senderId, receiverId].sort().join('-');
                io.to(room).emit('receive_message', {
                    ...newMessage.toObject(),
                    conversationId: conversation._id
                });

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            // Remove user from active users
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });

    return httpServer;
}
