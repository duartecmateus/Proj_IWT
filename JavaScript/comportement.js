/* Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21 */
/* Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21 */
/* Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21  */

/* ── CONFIGURAÇÃO ─────────────────────────────────── */

import { Eggs, randomEgg, Grid, Swap, Matcher, Gravity, Score } from './game.js';

const GRID_SIZE  = 8; 
const TOTAL_EGGS = 100; //meter na funcao eggs esses 2 parametros 

/* ── ESTADO DO JOGO ───────────────────────────────── */

let grid_classe  = new Grid();
let eggs_classe  = new Eggs();
const EGG_IMAGES = eggs_classe.EGG_IMAGES;

// gridRef is a shared wrapper so Swap/Matcher/Gravity all read the same live grid
let gridRef       = { grid: grid_classe.grid };
let swap_classe   = new Swap(gridRef);
let matcher_classe = new Matcher(gridRef);
let gravity_classe = new Gravity(gridRef);
let score_classe  = new Score();

let selected    = null;
let isAnimating = false;
let gameOver    = false;

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
   GRID
   ════════════════════════════════════════════════════ */

function buildGrid() {
  grid_classe.buildGrid();
  gridRef.grid = grid_classe.grid;
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

      if (gridRef.grid[r][c] !== null) {
        const img = document.createElement('img');
        img.src = EGG_IMAGES[gridRef.grid[r][c]];
        img.alt = `Egg type ${gridRef.grid[r][c]}`;
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

//Secondaries functions for handleCellClick()
//---------------------------------------------//
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

  animateSwap(r1, c1, r2, c2, () => 
  {
    swap_classe.swapInGrid(r1, c1, r2, c2);

    const matches = matcher_classe.findAllMatches();
    renderGrid();

    if (matches.cells.length > 0) {
      processMatches(matches);
    } 
    else 
    {
      animateSwap(r2, c2, r1, c1, () => 
      {
        swap_classe.swapInGrid(r2, c2, r1, c1);
        renderGrid();
        isAnimating = false;
      }, true);
    }
  });
}
//---------------------------------------------//

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
  if (scoreEl)     scoreEl.textContent     = score_classe.score.toLocaleString('pt-PT');
  if (eggsCountEl) eggsCountEl.textContent = score_classe.eggsScrambled;
  if (eggsBarEl)   eggsBarEl.style.width   = `${(score_classe.eggsScrambled / TOTAL_EGGS) * 100}%`;
  if (eggsHintEl) {
    const remaining = TOTAL_EGGS - score_classe.eggsScrambled;
    eggsHintEl.textContent = remaining > 0 ? `${remaining} eggs to go!` : '🎉 All scrambled!';
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
   FIM DE JOGO
   ════════════════════════════════════════════════════ */

function checkGameOver() {
  if (score_classe.isComplete()) {
    gameOver = true;
    clearInterval(timerInterval);
    showEndScreen(true);
  }
}

/* ════════════════════════════════════════════════════
   DEADLOCK — sem jogadas possíveis
   ════════════════════════════════════════════════════ */

function checkPossibleMoves() {
  if (gameOver) return;                         // game already ended — nothing to do
  if (matcher_classe.hasPossibleMove()) return; // at least one valid swap exists

  // No moves left — notify the player and rebuild the grid
  showNoMovesNotice(() => {
    buildGrid();
    renderGrid();
  });
}

/**
 * Shows a brief "No moves — reshuffling!" banner, then calls `onDone`.
 * The banner auto-removes itself after the animation so it never blocks play.
 */
function showNoMovesNotice(onDone) {
  const notice = document.createElement('div');
  notice.id = 'no-moves-notice';
  notice.textContent = 'No moves left — reshuffling!';
  document.body.appendChild(notice);

  // Force reflow so the CSS transition fires
  void notice.offsetWidth;
  notice.classList.add('visible');

  setTimeout(() => {
    notice.classList.remove('visible');
    setTimeout(() => {
      notice.remove();
      onDone();
    }, 400); // wait for fade-out transition
  }, 1800);  // banner stays visible for 1.8 s
}

function showEndScreen(won) {
  const overlay = document.createElement('div');
  overlay.id = 'game-overlay';
  overlay.innerHTML = `
    <div id="game-modal">
      <p class="modal-emoji">${won ? '🥚🎉' : '😢'}</p>
      <h2>${won ? 'ALL SCRAMBLED!' : 'GAME OVER'}</h2>
      <p class="modal-score">Score: <strong>${score_classe.score.toLocaleString('pt-PT')}</strong></p>
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

  score_classe.reset();
  selected    = null;
  isAnimating = false;
  gameOver    = false;

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
