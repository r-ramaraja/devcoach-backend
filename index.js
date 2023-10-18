const express = require('express');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
const cors = require('cors');

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// Generating responses based on LLM
const handleResponse = (data, socket) => {
    socket.emit('Sending messages to client');
};

socketIO.on('connection', (socket) => {
    console.log(`🤖: ${socket.id} User Connected`);
  
    socket.on('message', (data) => {
        console.log(data);
        socketIO.emit(handleResponse(data, socket));
        socketIO.emit('messageResponse', data);
    });
    
    socket.on('disconnect', () => {
        console.log('🤖: User Disconnected');
    });
  });

app.use(cors());
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});