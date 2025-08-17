// server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Menyajikan file statis (HTML, CSS, JS) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('Koneksi WebSocket baru dibuat');

    // Menjalankan shell interaktif (bash)
    const shell = spawn('bash');

    // Mengirim output shell ke klien (browser)
    shell.stdout.on('data', data => {
        ws.send(data.toString());
    });

    // Mengirim error shell ke klien
    shell.stderr.on('data', data => {
        ws.send(data.toString());
    });

    // Menerima input dari klien dan mengirimkannya ke shell
    ws.on('message', message => {
        const command = message.toString() + '\n';
        console.log(`Perintah diterima: ${command.trim()}`);
        shell.stdin.write(command);
    });

    // Menutup shell saat koneksi klien ditutup
    ws.on('close', () => {
        console.log('Koneksi WebSocket ditutup');
        shell.kill();
    });
});
