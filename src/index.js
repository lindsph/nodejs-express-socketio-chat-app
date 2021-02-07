const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

// whenever the server gets a new connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // // when a connection comes in it sends the count to that specific user/connection
    socket.emit('message', 'Welcome!');

    // broadcast sends to everyone except the current user
    socket.broadcast.emit('message', 'A new user has joined!');

    // // server receiving client event 
    socket.on('messageSent', (message, ackCallback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            message = filter.clean(message);
            // return ackCallback('Profanity not allowed!');
        }

        // want to emit to every connection available
        io.emit('message', message);
        ackCallback();
    });

    socket.on('disconnect', () => {
        // whenever a client gets disconnected
        io.emit('message', 'A user has left.');
    });

    socket.on('sendLocation', (coords) => {
        const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        io.emit('locationMessage', url);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});