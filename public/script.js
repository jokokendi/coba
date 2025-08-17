const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');

const socket = io(); // koneksi ke server

let history = [];
let historyIndex = -1;

function addLine(text) {
    const line = document.createElement('pre');
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

// Handle input
input.addEventListener('keydown', function(e) {
    const command = input.value.trim();

    // Enter key
    if (e.key === 'Enter') {
        if(command){
            addLine(`user@ubuntu:~$ ${command}`);
            history.push(command);
            historyIndex = history.length;
            socket.emit('command', command); // kirim ke server
        }
        input.value = '';
    }

    // Arrow Up: previous command
    else if (e.key === 'ArrowUp') {
        if(historyIndex > 0){
            historyIndex--;
            input.value = history[historyIndex];
        }
    }

    // Arrow Down: next command
    else if (e.key === 'ArrowDown') {
        if(historyIndex < history.length-1){
            historyIndex++;
            input.value = history[historyIndex];
        } else {
            historyIndex = history.length;
            input.value = '';
        }
    }

    // Ctrl + C
    else if (e.ctrlKey && e.key === 'c') {
        addLine('^C');
        input.value = '';
    }
});

// Terima output dari server
socket.on('output', function(data) {
    addLine(data || '');
});
