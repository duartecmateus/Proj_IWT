/* Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21 */
/* Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21 */
/* Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21  */

/* ── CONFIGURAÇÃO ─────────────────────────────────── */

import { Eggs,randomEgg, Grid} from './comportement.js';

const GRID_SIZE     = 8;
const MIN_MATCH     = 3;
const TOTAL_EGGS    = 100;
const SCORE_PER_EGG = 100;

/* ── ESTADO DO JOGO ───────────────────────────────── */

let grid_classe  = new Grid();
let grid         = grid_classe.grid;
let eggs_classe  = new Eggs();
const EGG_IMAGES = eggs_classe.EGG_IMAGES;


let selected      = null;
let score         = 0;
let eggsScrambled = 0;
let isAnimating   = false;
let gameOver      = false;

// Referências da side_info
let piecesDiv, scoreEl, eggsCountEl, eggsBarEl, eggsHintEl;

/* ════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ════════════════════════════════════════════════════ */

function initGame() {
  cacheDOMRefs();
  buildGrid();
  renderGrid();
  startTimer();
}

function cacheDOMRefs() {
  piecesDiv   = document.querySelector('.pieces');
  scoreEl     = document.getElementById('score');
  eggsCountEl = document.getElementById('eggsCount');
  eggsBarEl   = document.getElementById('eggsBar');
  eggsHintEl  = document.getElementById('eggsHint');
}

/* ════════════════════════════════════════════════════
   Grid Related functions
   ════════════════════════════════════════════════════ */

function buildGrid() {
  grid_classe.buildGrid();
  grid = grid_classe.grid;
}

/* Re-desenha toda a grelha no DOM */
function renderGrid() {
  piecesDiv.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (grid[r][c] !== null) {
        const img = document.createElement('img');
        // BUG CORRIGIDO: EGG_IMAGES é agora um array (const), não uma função
        img.src = EGG_IMAGES[grid[r][c]];
        img.alt = `Egg type ${grid[r][c]}`;
        cell.appendChild(img);
      }

      if (selected && selected.row === r && selected.col === c) {
        cell.classList.add('selected');
      }

      cell.addEventListener('click', () => handleCellClick(r, c));
      piecesDiv.appendChild(cell);
    }
  }
}

/* ════════════════════════════════════════════════════
   Clicking related functions
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

  if (isAdjacent(selected.row, selected.col, row, col)) {
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

function isAdjacent(r1, c1, r2, c2) {
  return (
    (Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 0) ||
    (Math.abs(r1 - r2) === 0 && Math.abs(c1 - c2) === 1)
  );
}

function attemptSwap(r1, c1, r2, c2) {
  isAnimating = true;

  animateSwap(r1, c1, r2, c2, () => {
    swapInGrid(r1, c1, r2, c2);

    const matches = findAllMatches();

    if (matches.cells.length > 0) {
      renderGrid();
      processMatches(matches);
    } else {
      animateSwap(r1, c1, r2, c2, () => {
        swapInGrid(r1, c1, r2, c2);
        renderGrid();
        isAnimating = false;
      }, true);
    }
  });
}

function swapInGrid(r1, c1, r2, c2) {
  const tmp    = grid[r1][c1];
  grid[r1][c1] = grid[r2][c2];
  grid[r2][c2] = tmp;
}

/* ════════════════════════════════════════════════════
   DETECÇÃO DE MATCHES
   ════════════════════════════════════════════════════ */

function findAllMatches() {
  const matched    = new Set();
  const bonusCells = new Set();

  /* --- Matches Horizontais --- */
  for (let l = 0; l < GRID_SIZE; l++) {
    let c = 0;
    while (c < GRID_SIZE) {
      const type = grid[l][c];
      let end = c;
      while (end + 1 < GRID_SIZE && grid[l][end + 1] === type) end++;
      const length = end - c + 1;
      if (length >= MIN_MATCH) {
        for (let k = c; k <= end; k++) {
          matched.add(`${l},${k}`);
          if (length >= 4) bonusCells.add(`${l},${k}`);
        }
      }
      c = end + 1;
    }
  }

  /* --- Matches Verticais --- */
  for (let c = 0; c < GRID_SIZE; c++) {
    let l = 0;
    while (l < GRID_SIZE) {
      const type = grid[l][c];
      let end = l;
      while (end + 1 < GRID_SIZE && grid[end + 1][c] === type) end++;
      const length = end - l + 1;
      if (length >= MIN_MATCH) {
        for (let k = l; k <= end; k++) {
          matched.add(`${k},${c}`);
          if (length >= 4) bonusCells.add(`${k},${c}`);
        }
      }
      l = end + 1;
    }
  }

  const matched_arr    = Array.from(matched);
  const bonusCells_arr = Array.from(bonusCells);

  return {
    cells: matched_arr.map(m    => ({ row: Number(m.split(',')[0]), col: Number(m.split(',')[1]) })),
    bonus: bonusCells_arr.map(m => ({ row: Number(m.split(',')[0]), col: Number(m.split(',')[1]) })),
  };
}

/* ════════════════════════════════════════════════════
   PROCESSAMENTO DE MATCHES (cascata)
   ════════════════════════════════════════════════════ */

function processMatches(matches) {
  const cells = matches.cells;
  const bonus  = matches.bonus;
  isAnimating = true;

  cells.forEach(({ row, col }) => {
    const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add(
        bonus.some(b => b.row === row && b.col === col) ? 'matched-bonus' : 'matched'
      );
    }
  });

  setTimeout(() => {
    cells.forEach(({ row, col }) => { grid[row][col] = null; });

    const bonusKeys = new Set(bonus.map(b => `${b.row},${b.col}`));
    let pointsGained = 0;
    cells.forEach(({ row, col }) => {
      pointsGained += bonusKeys.has(`${row},${col}`) ? SCORE_PER_EGG * 2 : SCORE_PER_EGG;
    });

    score          += pointsGained;
    eggsScrambled   = Math.min(TOTAL_EGGS, eggsScrambled + cells.length);

    updateHUD();
    applyGravity();
    refillGrid();
    renderGrid();

    setTimeout(() => {
      const next = findAllMatches();
      if (next.cells.length > 0) {
        processMatches(next);
      } else {
        isAnimating = false;
        checkGameOver();
      }
    }, 350);

  }, 450);
}

/* ════════════════════════════════════════════════════
   GRAVIDADE E REABASTECIMENTO
   ════════════════════════════════════════════════════ */

function applyGravity() {
  for (let c = 0; c < GRID_SIZE; c++) {
    let writeRow = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (grid[r][c] !== null) {
        grid[writeRow][c] = grid[r][c];
        if (writeRow !== r) grid[r][c] = null;
        writeRow--;
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      grid[r][c] = null;
    }
  }
}

function refillGrid() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = randomEgg();
      }
    }
  }
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

  cell1.style.zIndex    = '20';
  cell2.style.zIndex    = '20';
  cell1.style.position  = 'relative';
  cell2.style.position  = 'relative';

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
   HUD — TIMER, SCORE, EGGS
   ════════════════════════════════════════════════════ */

let timerSeconds  = 0;
let timerInterval = null;

function startTimer() {
  timerSeconds  = 0;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const min     = Math.floor(timerSeconds / 60).toString().padStart(1, '0');
  const sec     = (timerSeconds % 60).toString().padStart(2, '0');
  const timerEl = document.querySelector('#timer-container .value');
  if (timerEl) timerEl.textContent = `${min}:${sec}`;
}

function updateHUD() {
  if (scoreEl)     scoreEl.textContent     = score.toLocaleString('pt-PT');
  if (eggsCountEl) eggsCountEl.textContent = eggsScrambled;
  if (eggsBarEl)   eggsBarEl.style.width   = `${(eggsScrambled / TOTAL_EGGS) * 100}%`;
  if (eggsHintEl) {
    const remaining = TOTAL_EGGS - eggsScrambled;
    eggsHintEl.textContent = remaining > 0 ? `${remaining} eggs to go!` : '🎉 All scrambled!';
  }
  updateHeatMeter();
}

function updateHeatMeter() {
  const level    = Math.min(5, Math.floor(score / 1000));
  const segments = document.querySelectorAll('.heat_bar_seg');
  segments.forEach((seg, i) => {
    seg.className = 'heat_bar_seg ' + (i < level ? 'on' : 'off');
  });
}

/* ════════════════════════════════════════════════════
   FIM DE JOGO
   ════════════════════════════════════════════════════ */

function checkGameOver() {
  if (eggsScrambled >= TOTAL_EGGS) {
    gameOver = true;
    clearInterval(timerInterval);
    showEndScreen(true);
  }
}

function showEndScreen(won) {
  const overlay = document.createElement('div');
  overlay.id = 'game-overlay';
  overlay.innerHTML = `
    <div id="game-modal">
      <p class="modal-emoji">${won ? '🥚🎉' : '😢'}</p>
      <h2>${won ? 'ALL SCRAMBLED!' : 'GAME OVER'}</h2>
      <p class="modal-score">Score: <strong>${score.toLocaleString('pt-PT')}</strong></p>
      <p class="modal-time">Time: <strong>${document.querySelector('#timer-container .value')?.textContent || '0:00'}</strong></p>
      <div class="modal-buttons">
        <button id="modal-btn-restart">↺ PLAY AGAIN</button>
        <button class="secondary" id="modal-btn-quit">✕ QUIT</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-btn-restart').addEventListener('click', restartGame);
  overlay.querySelector('#modal-btn-quit').addEventListener('click', () => {
    window.location.href = './home.html';
  });
}

/* ════════════════════════════════════════════════════
   RESTART
   ════════════════════════════════════════════════════ */

function restartGame() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.remove();

  score         = 0;
  eggsScrambled = 0;
  selected      = null;
  isAnimating   = false;
  gameOver      = false;

  clearInterval(timerInterval);
  updateHUD();
  buildGrid();
  renderGrid();
  startTimer();
}

/* ════════════════════════════════════════════════════
   ARRANQUE
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const btnRestart = document.getElementById('btn_restart');
  if (btnRestart) {
    btnRestart.removeAttribute('onclick');
    btnRestart.addEventListener('click', restartGame);
  }

  initGame();
});
