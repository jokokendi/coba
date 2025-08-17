const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const virtualKeys = document.querySelectorAll('.virtual-keys button');

const socket = io();

let VPS_NAME = "loading";
let currentDir = "~";
let history = [];
let historyIndex = -1;

// Terima nama VPS
socket.on('vpsname', function(name) {
    VPS_NAME = name;
    updatePrompt();
});

// Terima direktori saat ini
socket.on('cwd', function(cwd) {
    // tampilkan ~ jika home
    const home = require('os').homedir ? require('os').homedir() : '';
    currentDir = cwd.replace(home, '~');
    updatePrompt();
});

function updatePrompt() {
    const promptSpan = document.querySelector('.terminal-prompt');
    promptSpan.textContent = `user@${VPS_NAME}:${currentDir}$`;
}

function addLine(text) {
    const line = document.createElement('pre');
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

// Handle keyboard input
input.addEventListener('keydown', function(e) {
    const command = input.value.trim();
    
    if (e.key === 'Enter') {
        if (command === 'clear') {
            output.innerHTML = '';
            input.value = '';
            return;
        }
        
        if (command) {
            addLine(`user@${VPS_NAME}:${currentDir}$ ${command}`);
            history.push(command);
            historyIndex = history.length;
            
            socket.emit('command', command);
        }
        
        input.value = '';
    }
    else if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = history[historyIndex];
        }
    }
    else if (e.key === 'ArrowDown') {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            input.value = history[historyIndex];
        } else {
            historyIndex = history.length;
            input.value = '';
        }
    }
    else if (e.ctrlKey && e.key === 'c') {
        addLine('^C');
        input.value = '';
    }
});

// Output dari server
socket.on('output', function(data) {
    addLine(data || '');
});

// Virtual keys
virtualKeys.forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        
        if (key === 'Control') {
            input.dataset.ctrl = 'true';
            input.focus();
        } else if (input.dataset.ctrl && key.toLowerCase() === 'c') {
            addLine('^C');
            input.value = '';
            input.dataset.ctrl = '';
        } else {
            input.value += key;
        }
        
        input.focus();
    });
});
