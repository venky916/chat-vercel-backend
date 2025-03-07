const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/database');
const userRouter = require('./routes/userRouter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');

const app = express();

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'https://next-chat-blue-nu.vercel.app/',
  ' next-chat-blue-nu.vercel.app',
  'next-chat-git-main-venky916s-projects.vercel.app',
  'next-chat-guthl0zge-venky916s-projects.vercel.app',
];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    console.log('Connected to Database successfully....');
  })
  .catch(() => {
    console.error('Error in connecting to database');
  });

const server = app.listen(PORT, () => {
  console.log(`successfully listening on port ${PORT} ....!`);
});

const onlineUsers = new Map(); // Key: User ID, Value: Socket ID(s)

const io = require('socket.io')(server, {
  pingTimeout: 60 * 1000,
  cors: {
    origin: allowedOrigins,
  },
});

io.on('connection', (socket) => {
  console.log('connected to socket.io');

  socket.on('setup', (userData) => {
    onlineUsers.set(userData._id, socket.id);
    socket.join(userData._id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room ' + room);
  });

  socket.on('typing', (room, senderId) => {
    socket.in(room).emit('typing', senderId);
  });

  socket.on('stop typing', (room, senderId) => {
    socket.in(room).emit('stop typing', senderId);
  });

  socket.on('new message', (newMessageReceived) => {
    // console.log(newMessageReceived);
    var chat = newMessageReceived.chat;

    if (!chat.users) {
      return console.log('Chat. users not defined');
    }

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) {
        return;
      }
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    io.emit('online-users', Array.from(onlineUsers.keys())); // Broadcast updated online users
  });

  socket.off('setup', () => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
