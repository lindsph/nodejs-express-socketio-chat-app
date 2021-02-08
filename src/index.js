const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { 
    generateMessage, 
    generateLocationMessage 
} = require('./utils/messages');
const { 
    addUser,
    removeUser,
    getUser,
    getUsersInRoom 
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

// whenever the server gets a new connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (options, ackCallback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return ackCallback(error);
        }

        socket.join(user.room);

        // // when a connection comes in it sends the count to that specific user/connection
        socket.emit('message', generateMessage('Admin', 'Welcome!'));

        // broadcast sends to everyone except the current user
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.displayName} has joined!`));

        // calling without arguments means no error
        ackCallback();
    });

    // // server receiving client event 
    socket.on('messageSent', (message, ackCallback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            message = filter.clean(message);
            // return ackCallback('Profanity not allowed!');
        }

        // want to emit to every connection available
        io.to(user.room).emit('message', generateMessage(user.displayName, message));
        ackCallback();
    });

    socket.on('sendLocation', (coords) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.displayName, coords));
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            // whenever a client gets disconnected
            io.to(user.room).emit('message', generateMessage('Admin', `${user.displayName} has left.`));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});