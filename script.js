const tiles = {
    red: document.getElementById('red'),
    green: document.getElementById('green'),
    yellow: document.getElementById('yellow'),
    blue: document.getElementById('blue')
};

const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

let sequence = [];
let playerSequence = [];
let score = 0;
let gameStarted = false;

// Efeito de brilho quando uma cor é ativada
function activateTile(color) {
    tiles[color].style.opacity = '0.5';
    setTimeout(() => {
        tiles[color].style.opacity = '1';
    }, 300);
}

// Toca o som correspondente à cor (simplificado)
function playSound(color) {
    // Aqui você pode adicionar sons reais
    console.log('Som:'  + color );
}

// Gera a próxima sequência
function nextSequence() {
    playerSequence = [];
    const colors = ['red', 'green', 'yellow', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);

    // Mostra a sequência para o jogador
    sequence.forEach((color, index) => {
        setTimeout(() => {
            activateTile(color);
            playSound(color);
        }, (index + 1) * 600);
    });
}

// Inicia o jogo
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        sequence = [];
        score = 0;
        scoreDisplay.textContent = score;
        nextSequence();
    }
}

// Verifica a jogada do usuário
function handleTileClick(color) {
    if (!gameStarted) return;

    activateTile(color);
    playSound(color);
    playerSequence.push(color);

    // Verifica se o jogador acertou a sequência
    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
        // Game over
        alert('Game Over! Sua pontuação: ' + score );
        gameStarted = false;
        return;
    }

    // Se completou a sequência atual
    if (playerSequence.length === sequence.length) {
        score++;
        scoreDisplay.textContent = score;
        setTimeout(nextSequence, 1000);
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
tiles.red.addEventListener('click', () => handleTileClick('red'));
tiles.green.addEventListener('click', () => handleTileClick('green'));
tiles.yellow.addEventListener('click', () => handleTileClick('yellow'));
tiles.blue.addEventListener('click', () => handleTileClick('blue'));