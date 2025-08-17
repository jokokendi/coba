const express = require('express');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // folder public untuk index.html, style.css, script.js

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('command', (cmd) => {
        if(cmd.trim() === '') return;

        // Jalankan command di server
        exec(cmd, { shell: '/bin/bash' }, (error, stdout, stderr) => {
            let output = '';
            if (error) output += error.message + '\n';
            if (stderr) output += stderr;
            if (stdout) output += stdout;
            socket.emit('output', output || '');
        });
    });
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
