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

const users = new Set();
let currentUser = "";
const scores = [];

function login(username, record = 0) {
    if (!username || users.has(username)) {
        alert("Nome inválido ou já existe!");
        return;
    }

    currentUser = username;
    users.add(username);
    scores.push({ user: username, score: 0 });

    document.getElementById('record').textContent = record;

    document.querySelector('.sidebar').style.display = 'flex';

    document.querySelector('.login-screen').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';

    startGame();
}


// Efeito de brilho quando uma cor é ativada
function activateTile(color) {
    tiles[color].style.opacity = '0.2';
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
        alert('Fim de jogo! Sua pontuação: ' + score );
        gameStarted = false;
        return;
    }

    // Se completou a sequência atual
    if (playerSequence.length === sequence.length) {
        score++;
        updateScore(score);
        setTimeout(nextSequence, 1000);
    }
}

async function sendFetch(url, data = {}, method = 'POST') {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method !== 'GET' ? JSON.stringify(data) : null
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        const text = await response.text();
        console.log('Resposta do servidor:', text);

        try {
            const result = JSON.parse(text);
            return result;
        } catch (e) {
            throw new Error('Resposta não é JSON válido');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        return null;
    }
}


async function consultarNome(username) {
    try {
        var json = await sendFetch(`/api.php/verifica_nome/?nome=${username}`, {}, 'GET');

        if (json) {
            if (json.found) {
                console.log("Usuário encontrado!");
                login(json.nome, json.record);
            } else {
                console.log("Usuário não encontrado, cadastrando...");

                await cadastrarUsuario(username); 
                login(username, 0);
            }
        } else {
            console.log("Falha na requisição");
        }
    } catch (e) {
        console.error(e);
    }
}


async function cadastrarUsuario(username) {
    try {
        const json = await sendFetch('/api.php/cadastrar_usuario/', { nome: username }, 'POST');
        if(json && json.success){
            console.log('Usuário cadastrado com sucesso:', json.nome);
        } else {
            console.log('Falha ao cadastrar usuário:', json.erro || 'Erro desconhecido');
        }
    } catch(e) {
        console.error(e);
    }
}

async function atualizarRecord(username, newRecord) {
    try {
        const data = { nome: username, record: newRecord };
        const json = await sendFetch('/api.php/atualizar_record/', data, 'POST');
        if (json.success) {
            console.log("Record atualizado com sucesso no banco!");
            document.getElementById('record').textContent = newRecord;
        } else {
            console.log("Record não atualizado:", json.msg || json.erro);
        }
    } catch (error) {
        console.error("Erro ao atualizar record:", error);
    }
}

function updateScore(newScore) {
    document.getElementById('score').textContent = newScore;

    const currentRecord = parseInt(document.getElementById('record').textContent, 10);
    if (newScore > currentRecord) {
        atualizarRecord(currentUser, newScore);
    }
}

async function showLeaderboard() {
    try {
        // Esconde outras telas
        document.querySelector('.game-container').style.display = 'none';
        document.querySelector('.login-screen').style.display = 'none';
        document.getElementById('rankingScreen').style.display = 'flex';

        // Busca ranking na API
        const res = await fetch('/api.php/ranking');
        if (!res.ok) throw new Error('Falha ao buscar ranking');
        const data = await res.json();

        const ul = document.getElementById('rankingList');
        ul.innerHTML = ''; // limpa lista

        if (data.length === 0) {
            ul.innerHTML = '<li>Nenhum usuário com pontuação registrada.</li>';
            return;
        }

        // Monta a lista do ranking
        data.forEach((user, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${user.usuario} — ${user.pontuacao_maxima} pontos`;
            ul.appendChild(li);
        });
    } catch (err) {
        alert(err.message);
    }
}

function closeRanking() {
    document.getElementById('rankingScreen').style.display = 'none';
    
    // Aqui decide para onde voltar, jogo ou login
    if (currentUser) {
        // Usuário logado: mostra jogo e sidebar
        document.querySelector('.game-container').style.display = 'block';
        document.querySelector('.sidebar').style.display = 'flex';
    } else {
        // Sem usuário logado: mostra login
        document.querySelector('.login-screen').style.display = 'flex';
    }
}


async function carregarRanking() {
  const ul = document.getElementById('leaderboard-list');
  ul.innerHTML = 'Carregando...';

  try {
    const response = await fetch('/api.php/ranking');
    const dados = await response.json();

    if (!Array.isArray(dados) || dados.length === 0) {
      ul.innerHTML = '<li>Nenhum usuário encontrado.</li>';
      return;
    }

    ul.innerHTML = ''; // limpa mensagem

    dados.forEach(({ usuario, pontuacao_maxima }, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${usuario} — Record: ${pontuacao_maxima}`;
      ul.appendChild(li);
    });

  } catch (err) {
    ul.innerHTML = '<li>Erro ao carregar ranking.</li>';
    console.error(err);
  }
}



// Event listeners
startBtn.addEventListener('click', startGame);
tiles.red.addEventListener('click', () => handleTileClick('red'));
tiles.green.addEventListener('click', () => handleTileClick('green'));
tiles.yellow.addEventListener('click', () => handleTileClick('yellow'));
tiles.blue.addEventListener('click', () => handleTileClick('blue'));