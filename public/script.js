document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    // Membuat koneksi WebSocket ke server
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
        console.log('Koneksi WebSocket berhasil!');
        terminalOutput.innerHTML = '';
        appendOutput('Selamat datang di Terminal Ubuntu. Ketik perintah Anda.');
        terminalInput.focus();
    };

    socket.onmessage = event => {
        appendOutput(event.data);
    };

    socket.onclose = () => {
        appendOutput('\nKoneksi ke server terputus.');
        terminalInput.disabled = true;
    };

    socket.onerror = error => {
        console.error('WebSocket Error:', error);
        appendOutput('\nTerjadi kesalahan koneksi.');
    };

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            if (command) {
                // Kirim perintah ke server
                socket.send(command);
                terminalInput.value = '';
            }
        }
    });

    function appendOutput(text) {
        const p = document.createElement('pre');
        p.textContent = text;
        terminalOutput.appendChild(p);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
});
