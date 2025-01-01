const express = require('express');
const dotenv = require('dotenv')
const connectDB = require('./config/database');
const userRouter = require('./routes/userRouter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');


const app = express();

dotenv.config();
app.use(express.json());

const PORT = process.env.PORT || 5000

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter)

app.use(notFound);
app.use(errorHandler);

connectDB()
    .then(() => {
        console.log('Connected to Database successfully....')
    })
    .catch(() => {
        console.error("Error in connecting to database")
    })

const server = app.listen(PORT, () => {
    console.log(`successfully listening on port ${PORT} ....!`)
})

const io = require('socket.io')(server, {
    pingTimeout: 60 * 1000,
    cors: {
        origin: 'http://localhost:5173'
    },
})

io.on('connection', (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        // console.log(userData);
        socket.emit('connected')
    })

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User Joined Room " + room)
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing')
    })

    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing')
    })

    socket.on('new message', (newMessageReceived) => {
        // console.log(newMessageReceived);
        var chat = newMessageReceived.chat;

        if (!chat.users) {
            return console.log("Chat. users not defined")
        }

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) {
                return;
            }
            socket.in(user._id).emit("message received", newMessageReceived)
        })
    })

    socket.off('setup', () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id)
    })

})

