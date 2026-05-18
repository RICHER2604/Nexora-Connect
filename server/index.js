const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Note: Express 5 handles malformed JSON natively via the global error handler below.

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Socket.io Logic
let users = [];

const addUser = (userId, socketId) => {
    const existingUser = users.find(user => user.userId === userId);
    if (existingUser) {
        existingUser.socketId = socketId;
    } else {
        users.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    // When connect
    console.log("a user connected.");

    // Take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    // Send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        }
    });

    // When disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const storyRoutes = require('./routes/storyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const newsRoutes = require('./routes/newsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.get('/', (req, res) => {
    res.send('Nexora Connect API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rooms', roomRoutes);

// Global Error Handler — must be after all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Handle malformed JSON payloads
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle server listen errors (e.g., EADDRINUSE) to let nodemon restart cleanly
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    }
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        mongoose.disconnect().finally(() => process.exit(0));
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);