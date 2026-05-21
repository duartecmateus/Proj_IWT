/* Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21 */
/* Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21 */
/* Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21  */

"use strict";

import {
    Eggs, Grid, Swap, Matcher, Gravity, Score, Keyboard, DIFFICULTY_CONFIGS,
} from './game.js';

/* ════════════════════════════════════════════════════
   ESTADO GLOBAL
   ════════════════════════════════════════════════════ */

const eggs_classe = new Eggs();
const EGG_IMAGES  = eggs_classe.EGG_IMAGES;

/* Configuração do modo de jogo activa  */
let currentConfig  = null;

/* Instâncias dos módulos do jogo  */
let grid_classe    = null;
let gridRef        = null;
let swap_classe    = null;
let matcher_classe = null;
let gravity_classe = null;
let score_classe   = null;
let keyboard_classe = new Keyboard;

let selected    = null;
let hintTimeout  = null;
let hintCells    = [];
let isAnimating = false;
let gameOver    = false;

let cursor_row = 0;
let cursor_col = 0;

let piecesDiv, scoreEl, eggsCountEl, eggsBarEl, eggsHintEl;

/* ════════════════════════════════════════════════════
   EVENT LISTENER
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const btnRestart = document.getElementById('btn_restart');
    if (btnRestart) {
        btnRestart.removeAttribute('onclick');
        btnRestart.addEventListener('click', () => restartGame(true));
    }

    const btnHint = document.getElementById('btn_hint');
    if (btnHint) {
        btnHint.addEventListener('click', showHint);
    }

    initGame();
});

/* ════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ════════════════════════════════════════════════════ */

function initGame() {
    cacheDOMRefs();
    showDifficultyScreen();
}

function cacheDOMRefs() {
    piecesDiv   = document.querySelector('.pieces');
    scoreEl     = document.getElementById('score');
    eggsCountEl = document.getElementById('eggsCount');
    eggsBarEl   = document.getElementById('eggsBar');
    eggsHintEl  = document.getElementById('eggsHint');
}

function startWithConfig(config) {
    currentConfig = config;

    /* Recriar todos os módulos do jogo com os novos parâmetros */
    grid_classe    = new Grid(config.gridSize);
    gridRef        = { grid: grid_classe.grid };
    swap_classe    = new Swap(gridRef);
    matcher_classe = new Matcher(gridRef, config.gridSize);
    gravity_classe = new Gravity(gridRef, config.gridSize);
    score_classe   = new Score(config.totalEggs);

    /* Repor estado */
    selected    = null;
    isAnimating = false;
    gameOver    = false;
    cursor_row  = 0;
    cursor_col  = 0;

    /* Actualizar a variável CSS --grid-size no contentor do tabuleiro.
       O CSS usa repeat(var(--grid-size), 1fr) e calc(100% / var(--grid-size))
       para ajustar automaticamente colunas e linhas de fundo. */
    const gameGrid = document.querySelector('.game_grid');
    if (gameGrid) gameGrid.style.setProperty('--grid-size', config.gridSize);

    buildGrid();
    renderGrid();
    updateDifficultyLabel();
    updateHUD();
    startTimer();
    resetHintCooldown();
}

function updateDifficultyLabel() {
    const el = document.getElementById('difficulty-label');
    if (el && currentConfig) el.textContent = currentConfig.label;
}

/* ════════════════════════════════════════════════════
   ECRÃ DE ESCOLHA DE DIFICULDADE
   ════════════════════════════════════════════════════ */

function showDifficultyScreen() {

    const existing = document.getElementById('difficulty-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'difficulty-overlay';
    overlay.innerHTML = `
        <div id="difficulty-modal">
            <h2>🥚 Choose the dificulty</h2>

            <div class="difficulty-presets">
                <button class="diff-btn diff-easy" data-diff="easy">
                    <span class="diff-label">Easy</span>
                    <span class="diff-desc">8 × 8 · 20 eggs</span>
                </button>
                <button class="diff-btn diff-medium" data-diff="medium">
                    <span class="diff-label">Normal</span>
                    <span class="diff-desc">9 × 9 · 25 eggs</span>
                </button>
                <button class="diff-btn diff-hard" data-diff="hard">
                    <span class="diff-label">Hard</span>
                    <span class="diff-desc">10 × 10 · 30 eggs</span>
                </button>
            </div>

            <div class="difficulty-custom">
                <h3>⚙️ Personalize</h3>
                <div class="custom-inputs">
                    <div class="custom-field">
                        <label>Grid Size</label>
                        <input type="number" id="custom-size"
                               min="5" max="15" value="8"
                               title="Entre 5 e 15">
                    </div>
                    <div class="custom-field">
                        <label>Eggs to eliminate</label>
                        <input type="number" id="custom-eggs"
                               min="5" max="500" value="20"
                               title="Entre 5 e 500">
                    </div>
                </div>
                <button id="btn-custom-start">▶ Start personalized Grid</button>
                <p class="custom-error" id="custom-error"></p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    /* Botões de dificuldade pré-definida */
    overlay.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.diff;
            overlay.remove();
            startWithConfig(DIFFICULTY_CONFIGS[key]);
        });
    });

    /* Botão personalizado */
    overlay.querySelector('#btn-custom-start').addEventListener('click', () => {
        const sizeInput  = overlay.querySelector('#custom-size');
        const eggsInput  = overlay.querySelector('#custom-eggs');
        const errorEl    = overlay.querySelector('#custom-error');
        const gridSize   = parseInt(sizeInput.value, 10);
        const totalEggs  = parseInt(eggsInput.value, 10);

        if (isNaN(gridSize) || gridSize < 5 || gridSize > 15) {
            errorEl.textContent = 'O tamanho deve ser entre 5 e 15.';
            return;
        }
        if (isNaN(totalEggs) || totalEggs < 5 || totalEggs > 500) {
            errorEl.textContent = 'As joias devem ser entre 5 e 500.';
            return;
        }

        errorEl.textContent = '';
        overlay.remove();
        startWithConfig({
            key:       `custom_${gridSize}x${gridSize}_${totalEggs}`,
            label:     `Personalized ${gridSize}×${gridSize} · ${totalEggs} eggs`,
            gridSize,
            totalEggs,
        });
    });
}

/* ════════════════════════════════════════════════════
   GRID
   ════════════════════════════════════════════════════ */

function buildGrid() {
    grid_classe.buildGrid();
    gridRef.grid = grid_classe.grid;
}

function renderGrid() {
    if (!currentConfig) return;
    const GS = currentConfig.gridSize;

    piecesDiv.innerHTML = '';

    for (let r = 0; r < GS; r++) {
        for (let c = 0; c < GS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (gridRef.grid[r][c] !== null) {
                const img = document.createElement('img');
                img.src = EGG_IMAGES[gridRef.grid[r][c]];
                img.alt = `Egg type ${gridRef.grid[r][c]}`;
                cell.appendChild(img);
            }

            if (selected && selected.row === r && selected.col === c)
                cell.classList.add('selected');

            if (cursor_row === r && cursor_col === c)
                cell.classList.add('cursor');

            cell.addEventListener('click', () => handleCellClick(r, c));
            piecesDiv.appendChild(cell);
        }
    }
}

/* ════════════════════════════════════════════════════
   CLICKING — interação com células
   ════════════════════════════════════════════════════ */

function handleCellClick(row, col) {
    if (isAnimating || gameOver) return;

    if (selected && selected.row === row && selected.col === col) {
        clearSelection();
        return;
    }

    if (!selected) {
        selectCell(row, col);
        return;
    }

    if (swap_classe.isAdjacent(selected.row, selected.col, row, col)) {
        attemptSwap(selected.row, selected.col, row, col);
        clearSelection();
    } else {
        clearSelection();
        selectCell(row, col);
    }
}

function selectCell(row, col) {
    selected = { row, col };
    const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('selected');
}

function clearSelection() {
    if (selected) {
        const cell = piecesDiv.querySelector(
            `[data-row="${selected.row}"][data-col="${selected.col}"]`
        );
        if (cell) cell.classList.remove('selected');
    }
    selected = null;
}

function attemptSwap(r1, c1, r2, c2) {
    isAnimating = true;

    animateSwap(r1, c1, r2, c2, () => {
        swap_classe.swapInGrid(r1, c1, r2, c2);

        const matches = matcher_classe.findAllMatches();
        renderGrid();

        if (matches.cells.length > 0) {
            processMatches(matches);
        } else {
            animateSwap(r2, c2, r1, c1, () => {
                swap_classe.swapInGrid(r2, c2, r1, c1);
                renderGrid();
                isAnimating = false;
            }, true);
        }
    });
}

/* ════════════════════════════════════════════════════
   PROCESSAMENTO DE MATCHES (cascata)
   ════════════════════════════════════════════════════ */

function processMatches(matches) {
    const cells = matches.cells;
    const bonus = matches.bonus;
    isAnimating = true;

    cells.forEach(({ row, col }) => {
        const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add(
                bonus.some(b => b.row === row && b.col === col)
                    ? 'matched-bonus'
                    : 'matched'
            );
        }
    });

    setTimeout(() => {
        cells.forEach(({ row, col }) => { gridRef.grid[row][col] = null; });

        const pointsGained = score_classe.calculatePoints(cells, bonus);
        score_classe.addPoints(pointsGained);
        score_classe.addEggs(cells.length);

        updateHUD();
        gravity_classe.applyGravity();
        gravity_classe.refillGrid();
        renderGrid();

        setTimeout(() => {
            const next = matcher_classe.findAllMatches();
            if (next.cells.length > 0) {
                processMatches(next);
            } else {
                isAnimating = false;
                checkGameOver();
                checkPossibleMoves();
                resetHintCooldown();
            }
        }, 350);

    }, 450);
}

/* ════════════════════════════════════════════════════
   ANIMAÇÕES CSS
   ════════════════════════════════════════════════════ */

function animateSwap(r1, c1, r2, c2, callback, reverse = false) {
    const cell1 = piecesDiv.querySelector(`[data-row="${r1}"][data-col="${c1}"]`);
    const cell2 = piecesDiv.querySelector(`[data-row="${r2}"][data-col="${c2}"]`);

    if (!cell1 || !cell2) { callback(); return; }

    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    const dx = rect2.left - rect1.left;
    const dy = rect2.top  - rect1.top;

    const DURATION = reverse ? 280 : 180;
    const easing   = reverse ? 'cubic-bezier(0.36,0.07,0.19,0.97)' : 'ease';

    cell1.style.zIndex   = '20';
    cell2.style.zIndex   = '20';
    cell1.style.position = 'relative';
    cell2.style.position = 'relative';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            cell1.style.transition = `transform ${DURATION}ms ${easing}`;
            cell2.style.transition = `transform ${DURATION}ms ${easing}`;
            cell1.style.transform  = `translate(${dx}px, ${dy}px)`;
            cell2.style.transform  = `translate(${-dx}px, ${-dy}px)`;
        });
    });

    setTimeout(() => {
        [cell1, cell2].forEach(c => {
            c.style.transition = '';
            c.style.transform  = '';
            c.style.zIndex     = '';
            c.style.position   = '';
        });
        callback();
    }, DURATION + 30);
}

/* ════════════════════════════════════════════════════
   HINT BUTTON
   ════════════════════════════════════════════════════ */

function resetHintCooldown() {
    const btn = document.getElementById('btn_hint');
    if (!btn) return;

    btn.disabled = true;
    btn.classList.add('hint-cooldown');

    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('hint-cooldown');
    }, 100);
}

function showHint() {
    if (isAnimating || gameOver) return;

    hintCells.forEach(({ row, col }) => {
        const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.remove('hint-cell');
    });
    hintCells = [];

    const pair = matcher_classe.findHint();
    if (!pair) return;

    score_classe.addPoints(-5);
    updateHUD();

    hintCells = pair;
    pair.forEach(({ row, col }) => {
        const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('hint-cell');
    });

    setTimeout(() => {
        hintCells.forEach(({ row, col }) => {
            const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.remove('hint-cell');
        });
        hintCells = [];
    }, 2000);
}

/* ════════════════════════════════════════════════════
   HUD — TIMER, SCORE, EGGS
   ════════════════════════════════════════════════════ */

let timerSeconds  = 0;
let timerInterval = null;

function startTimer() {
    clearInterval(timerInterval);
    timerSeconds  = 0;
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const min    = Math.floor(timerSeconds / 60).toString().padStart(1, '0');
    const sec    = (timerSeconds % 60).toString().padStart(2, '0');
    const timerEl = document.querySelector('#timer-container .value');
    if (timerEl) timerEl.textContent = `${min}:${sec}`;
}

function updateHUD() {
    if (!currentConfig || !score_classe) return;
    const totalEggs = currentConfig.totalEggs;

    if (scoreEl)     scoreEl.textContent     = score_classe.score.toLocaleString('pt-PT');
    if (eggsCountEl) eggsCountEl.textContent = score_classe.eggsScrambled;
    if (eggsBarEl)   eggsBarEl.style.width   = `${(score_classe.eggsScrambled / totalEggs) * 100}%`;

    if (eggsHintEl) {
        const remaining = totalEggs - score_classe.eggsScrambled;
        eggsHintEl.textContent = remaining > 0
            ? `${remaining} eggs to go!`
            : '🎉 All scrambled!';
    }

    updateHeatMeter();
}

function updateHeatMeter() {
    const level    = Math.min(5, Math.floor(score_classe.score / 1000));
    const segments = document.querySelectorAll('.heat_bar_seg');
    segments.forEach((seg, i) => {
        seg.className = 'heat_bar_seg ' + (i < level ? 'on' : 'off');
    });
}

/* ════════════════════════════════════════════════════
   GUARDAR ESTATÍSTICAS DO JOGADOR
   ════════════════════════════════════════════════════ */

function updateLocalRanks(users) {
    const sortedUsers = [...users].sort((a, b) => {
        const scoreA = Number(a.stats?.highScore || 0);
        const scoreB = Number(b.stats?.highScore || 0);
        return scoreB - scoreA;
    });
    sortedUsers.forEach((user, index) => {
        if (!user.stats) user.stats = {};
        user.stats.worldRank = index + 1;
    });
}

function saveGameStats() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) return;

    let users      = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === loggedInUser.email);
    if (userIndex === -1) return;

    if (!users[userIndex].stats) {
        users[userIndex].stats = {
            worldRank: 1, highScore: 0,
            gamesPlayed: 0, timePlayedSeconds: 0,
        };
    }

    const s = users[userIndex].stats;
    s.gamesPlayed        = Number(s.gamesPlayed || 0) + 1;
    s.timePlayedSeconds  = Number(s.timePlayedSeconds || 0) + timerSeconds;

    /* Pontuação máxima global */
    s.highScore = Math.max(Number(s.highScore || 0), score_classe.score);

    /* Pontuação máxima por configuração (ex.: highScore_easy, highScore_hard, …) */
    const configKey = `highScore_${currentConfig.key}`;
    s[configKey] = Math.max(Number(s[configKey] || 0), score_classe.score);

    updateLocalRanks(users);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));

    /* Guardar na tabela de pontuações da configuração activa */
    const name = loggedInUser.name || loggedInUser.email || 'Anónimo';
    saveToLeaderboard(currentConfig, {
        name,
        score: score_classe.score,
        time:  timerSeconds,
        date:  new Date().toLocaleDateString('pt-PT'),
    });
}

/* ════════════════════════════════════════════════════
   DEADLOCK
   ════════════════════════════════════════════════════ */

function checkPossibleMoves() {
    if (gameOver) return;
    if (matcher_classe.hasPossibleMove()) return;

    showNoMovesNotice(() => {
        buildGrid();
        renderGrid();
    });
}

function showNoMovesNotice(onDone) {
    const notice = document.createElement('div');
    notice.id = 'no-moves-notice';
    notice.textContent = 'No moves left — reshuffling!';
    document.body.appendChild(notice);

    void notice.offsetWidth;
    notice.classList.add('visible');

    setTimeout(() => {
        notice.classList.remove('visible');
        setTimeout(() => {
            notice.remove();
            onDone();
        }, 1000);
    }, 2000);
}


/* ════════════════════════════════════════════════════
   FIM DE JOGO
   ════════════════════════════════════════════════════ */

function checkGameOver() {
    if (score_classe.isComplete()) {
        gameOver = true;
        clearInterval(timerInterval);
        saveGameStats();
        showEndScreen(true);
    }
}
/* ════════════════════════════════════════════════════
   ECRÃ FINAL — inclui tabela de pontuações
   ════════════════════════════════════════════════════ */
   
function showEndScreen(won) {
    const overlay = document.createElement('div');
    overlay.id = 'game-overlay';
    const time = document.querySelector('#timer-container .value')?.textContent

    overlay.innerHTML = `
        <div id="game-modal">
            <p class="modal-emoji">${won ? '🥚🎉' : '😢'}</p>
            <h2>${won ? 'ALL SCRAMBLED!' : 'GAME OVER'}</h2>
            <p class="modal-config">${currentConfig.label}</p>
            <p class="modal-score">Score: <strong>${score_classe.score.toLocaleString('pt-PT')}</strong></p>
            <p class="modal-time">Time: <strong>${time|| '0:00'}</strong></p>
            <div class="modal-buttons">
                <button id="modal-btn-restart">↺ JOGAR NOVAMENTE</button>
                <button class="secondary" id="modal-btn-change">🎲 MUDAR DIFICULDADE</button>
                <button class="secondary" id="modal-btn-leaderboard">🏆 LEADERBOARD</button>
                <button class="secondary" id="modal-btn-quit">✕ SAIR</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    /* Reiniciar com a mesma configuração */
    overlay.querySelector('#modal-btn-restart').addEventListener('click', () => {
        overlay.remove();
        restartGame(false);
    });

    /* Voltar à escolha de dificuldade */
    overlay.querySelector('#modal-btn-change').addEventListener('click', () => {
        overlay.remove();
        restartGame(true);
    });

    /* Sair */
    overlay.querySelector('#modal-btn-quit').addEventListener('click', () => {
        window.location.href = './home.html';
    });

    /* Leaderboard */
    overlay.querySelector('#modal-btn-leaderboard').addEventListener('click', () => {
        window.location.href = './history.html#leader';
    });
}

/* ════════════════════════════════════════════════════
   RESTART
   ════════════════════════════════════════════════════ */

/**
 * @param {boolean} chooseDifficulty  Se true, mostra o ecrã de dificuldade;
 *                                    se false, reinicia com a configuração actual.
 */
function restartGame(chooseDifficulty = false) {
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.remove();

    clearInterval(timerInterval);

    selected    = null;
    isAnimating = false;
    gameOver    = false;

    if (chooseDifficulty || !currentConfig) {
        showDifficultyScreen();
    } else {
        /* Reiniciar com a mesma configuração */
        score_classe.reset(currentConfig.totalEggs);
        cursor_row = 0;
        cursor_col = 0;

        updateHUD();
        buildGrid();
        renderGrid();
        startTimer();
        resetHintCooldown();
    }
}

/* ════════════════════════════════════════════════════
   KEYBOARD NAVIGATION
   ════════════════════════════════════════════════════ */


function moveCursor(cr, cc) {
  cursor_row = Math.max(0 , Math.min(GRID_SIZE -1, cursor_row + cr));
  cursor_col = Math.max(0 , Math.min(GRID_SIZE -1, cursor_col + cc));
}

document.addEventListener('keydown', (e) => {
    if (gameOver || isAnimating || !currentConfig) return;

    const GS = currentConfig.gridSize;

    const move = keyboard_classe.getKeyMove(e.key)

    if (move) {
        moveCursor(move[0], move[1]);
        renderGrid();
        return;
    }

    if (e.key === ' ') {
        e.preventDefault();
        handleCellClick(cursor_row, cursor_col);
    }
});

/* ════════════════════════════════════════════════════
   LEADERBOARD  (por configuração, guardado em localStorage)
   ════════════════════════════════════════════════════ */

/**
 * Obtém a tabela de pontuações para uma configuração específica.
 * @param  {object} config
 * @returns {Array}  Array de entradas { name, score, time, date }
 */
function getLeaderboard(config) {
    return JSON.parse(localStorage.getItem(`leaderboard_${config.key}`)) || [];
}

/**
 * Guarda uma nova entrada na tabela de pontuações da configuração activa.
 * Mantém apenas as 10 melhores pontuações, ordenadas por score decrescente.
 * @param {object} config
 * @param {object} entry  { name, score, time, date }
 */
function saveToLeaderboard(config, entry) {
    let board = getLeaderboard(config);
    board.push(entry);
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, 10);
    localStorage.setItem(`leaderboard_${config.key}`, JSON.stringify(board));
}
