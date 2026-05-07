/* Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21 */
/* Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21 */
/* Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21  */

/* ── CONFIGURAÇÃO ─────────────────────────────────── */

import { Grid} from './comportement.js';

const GRID_SIZE    = 8;       // dimensão do tabuleiro (8×8)
const MIN_MATCH    = 3;       // mínimo de peças para fazer match
const TOTAL_EGGS   = 100;     // objetivo total de ovos
const SCORE_PER_EGG = 100;   // pontos base por ovo

const EGG_IMAGES = [
  'Imagens/ovo-vermelho.png',
  'Imagens/ovo-estrelado.png',
  'Imagens/ovo-dia-dos-muertos.png',
  'Imagens/ovo-amarelo.png',
  'Imagens/cat_egg.jpg',
  'Imagens/humpty_dumpty.jpg',
  'Imagens/togepie.jpg',
];
const EGG_COUNT = EGG_IMAGES.length;

/* ── ESTADO DO JOGO ───────────────────────────────── */
let grid         = [];       // matriz 8×8 com índices dos tipos de ovo (null = vazio)
let selected     = null;     // { row, col } da célula seleccionada
let score        = 0;
let eggsScrambled = 0;
let isAnimating  = false;
let gameOver     = false;

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
  piecesDiv  = document.querySelector('.pieces');
  scoreEl    = document.getElementById('score');
  eggsCountEl = document.getElementById('eggsCount');
  eggsBarEl  = document.getElementById('eggsBar');
  eggsHintEl = document.getElementById('eggsHint');
}

/** Devolve um índice de ovo aleatório */
function randomEgg() {
  return Math.floor(Math.random() * EGG_COUNT);
}

/* ════════════════════════════════════════════════════
   Grid Related fucntions
   ════════════════════════════════════════════════════ */

/* Gera uma grelha 8×8 sem matches iniciais */
function buildGrid() {
  grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let type;
      // Garante que a peça colocada não cria match imediato
      do {
        type = randomEgg();
      } while (wouldCauseMatch(r, c, type));
      grid[r][c] = type;
    }
  }
}

/* Funcao auxiliar */
function wouldCauseMatch(row, col, type) {
  // Horizontal (2 anteriores)
  if (col >= 2 && grid[row][col - 1] === type && grid[row][col - 2] === type)
    return true;
  // Vertical (2 anteriores)
  if (row >= 2 && grid[row - 1][col] === type && grid[row - 2][col] === type)
    return true;
  return false;
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
        img.src = EGG_IMAGES[grid[r][c]];
        img.alt = `Egg type ${grid[r][c]}`;
        cell.appendChild(img);
      }

      // Destaque da célula seleccionada
      if (selected && selected.row === r && selected.col === c) {
        cell.classList.add('selected');
      }

      cell.addEventListener('click', () => handleCellClick(r, c));
      piecesDiv.appendChild(cell);
    }
  }
}

/* ════════════════════════════════════════════════════
   Clicking related fucntions
   ════════════════════════════════════════════════════ */

/* Funcao auxiliar que ve quando 1/2 cells sao selecionadas */
function handleCellClick(row, col) {
  if (isAnimating || gameOver) return;

  // desseleccionar
  if (selected && selected.row === row && selected.col === col) {
    clearSelection();
    return;
  }

  // se seleccionada so mete a classe
  if (!selected) {
    selectCell(row, col);
    return;
  }

  // se houver uma selectionada entao proximo click faz troca se possivel
  if (isAdjacent(selected.row, selected.col, row, col)) {
    attemptSwap(selected.row, selected.col, row, col);
    clearSelection();
  } else {
    // Muda selecção para a nova célula
    clearSelection();
    selectCell(row, col);
  }
}


/** Marca célula como seleccionada. */
function selectCell(row, col) {
  selected = { row, col };
  const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (cell) 
    cell.classList.add('selected');
}
/** Limpa a selecção actual. */
function clearSelection() {
  if (selected) {
    const cell = piecesDiv.querySelector(
      `[data-row="${selected.row}"][data-col="${selected.col}"]`
    );
    if (cell) 
      cell.classList.remove('selected');
  }
  selected = null;
}
/* Verifica se (r2,c2) é adjacente a (r1,c1) nas 4 direcções */
function isAdjacent(r1, c1, r2, c2) {
  return ((Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 0) || 
            (Math.abs(r1 - r2) === 0 && Math.abs(c1 - c2) === 1));
}
/* Tenta trocar duas peças adjacentes 
    --> Se a troca não criar matches, desfaz-a e anima */
function attemptSwap(r1, c1, r2, c2) {
  isAnimating = true;

  // Animação visual: move as peças para as posições trocadas
  animateSwap(r1, c1, r2, c2, () => {
    swapInGrid(r1, c1, r2, c2);

    const matches = findAllMatches();

    if (matches.cells.length > 0) {
      // Troca válida
      renderGrid();
      processMatches(matches);
    } else {
      // Troca inválida — reverte com animação de bounce
      animateSwap(r1, c1, r2, c2, () => {
        swapInGrid(r1, c1, r2, c2);
        renderGrid();
        isAnimating = false;
      }, true /* reverse */);
    }
  });
}
/** Troca dois valores na matriz grid. */
function swapInGrid(r1, c1, r2, c2) {
  const tmp    = grid[r1][c1];
  grid[r1][c1] = grid[r2][c2];
  grid[r2][c2] = tmp;
}

/** Atualiza apenas uma célula sem re-renderizar tudo.
function updateCell(row, col) {
  const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;

  cell.innerHTML = '';
  cell.className = 'cell';
  
  const img = document.createElement('img');
  img.src = EGG_IMAGES[grid[row][col]];
  img.alt = `Egg type ${grid[row][col]}`;
  cell.appendChild(img);
  
  if (selected && selected.row === row && selected.col === col) {
    cell.classList.add('selected');
  }
}*/


/* ════════════════════════════════════════════════════
   DETECÇÃO DE MATCHES
   ════════════════════════════════════════════════════ */

/**
 * Encontra todos os grupos de 3+ peças iguais em linhas e colunas se for que 3 aplica bonus */
function findAllMatches() {
  const matched = new Set(); // Set para evitar duplicados
  const bonusCells = new Set(); // células em grupos de 4+

  /* --- Matches Horizontais --- */
  for (let l = 0; l < GRID_SIZE; l++) {
    let c = 0;

    while (c < GRID_SIZE) {
      const type = grid[l][c];
      let end = c;

      while (end + 1 < GRID_SIZE && grid[l][end + 1] === type) 
        end++;
      const length = end - c + 1;

      if (length >= MIN_MATCH) {
        for (let k = c; k <= end; k++) {
          matched.add(`${l},${k}`);
          if (length >= 4) 
            bonusCells.add(`${l},${k}`);
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
      
      while (end + 1 < GRID_SIZE && grid[end + 1][c] === type) 
        end++;
      const length = end -l + 1;
      
      if (length >= MIN_MATCH) {
        for (let k = l; k <= end; k++) {
          matched.add(`${k},${c}`);
          if (length >= 4) 
            bonusCells.add(`${k},${c}`);
        }
      }
      l = end + 1;
    }
  }
  matched_arr= Array.from(matched);
  bonusCells_arr= Array.from(bonusCells);

  return {
  cells: matched_arr.map(match => ({ row: Number(match.split(',')[0]), col: Number(match.split(',')[1]) })),
  bonus: bonusCells_arr.map(match => ({ row: Number(match.split(',')[0]), col: Number(match.split(',')[1]) })),
};
}



/* ════════════════════════════════════════════════════
   PROCESSAMENTO DE MATCHES (cascata)
   ════════════════════════════════════════════════════ */

/**
 * Processa um conjunto de matches:
 *   1. Animação de remoção
 *   2. Remove da grelha
 *   3. Actualiza pontuação e contadores
 *   4. Faz as peças cair (gravity)
 *   5. Preenche espaços vazios
 *   6. Procura novos matches (cascata)
 */
function processMatches(matches) {
  const cells = matches.cells;
  const bonus  = matches.bonus;
  isAnimating = true;

  // dar uma classe as peças que vão ser removidas (bonus ou nao)
  cells.forEach(({ row, col }) => {
    const cell = piecesDiv.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add(bonus.some(b => b.row === row && b.col === col)
        ? 'matched-bonus'
        : 'matched');
    }
  });

  setTimeout(() => {
    // Remove da grelha
    cells.forEach(({ row, col }) => { grid[row][col] = null; });

    // Pontuação: 100 pts por ovo normal, 200 pts por ovo em grupo de 4+
    const bonusKeys = new Set(bonus.map(b => `${b.row},${b.col}`));
    let pointsGained = 0;
    cells.forEach(({ row, col }) => {
      pointsGained += bonusKeys.has(`${row},${col}`)
        ? SCORE_PER_EGG * 2
        : SCORE_PER_EGG;
    });

    score         += pointsGained;
    eggsScrambled  = Math.min(TOTAL_EGGS, eggsScrambled + cells.length);

    updateHUD();

    // Gravidade + preenchimento
    applyGravity();
    refillGrid();
    renderGrid();

    // Cascata — procura novos matches depois da queda
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

/**
 * Faz as peças "cair" para preencher os espaços vazios.
 * Para cada coluna, empurra todos os não-nulos para baixo.
 */
function applyGravity() {
  for (let c = 0; c < GRID_SIZE; c++) {
    let writeRow = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (grid[r][c] == null) {
        continue;
      }
      if (grid[r][c] !== null) {
        grid[writeRow][c] = grid[r][c];
        if (writeRow !== r) 
          grid[r][c] = null;
        writeRow--;
      }
    }
    // Preenche os espaços que sobraram no topo com null (serão preenchidos no refill)
    for (let r = writeRow; r >= 0; r--) {
      grid[r][c] = null;
    }
  }
}

/**
 * Preenche todas as células nulas com novos ovos aleatórios.
 */
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
   ANIMAÇÕES CSS (via classes transitórias)
   ════════════════════════════════════════════════════ */

/**
 * Troca visualmente as posições de duas células com CSS transition.
 * @param {boolean} reverse — se true, usa a classe de "bounce back"
 */
function animateSwap(r1, c1, r2, c2, callback, reverse = false) {
  const cell1 = piecesDiv.querySelector(`[data-row="${r1}"][data-col="${c1}"]`);
  const cell2 = piecesDiv.querySelector(`[data-row="${r2}"][data-col="${c2}"]`);

  if (!cell1 || !cell2) { callback(); return; }

  // Mede posição real no ecra e calcula o deslocamento necessario
  const rect1 = cell1.getBoundingClientRect();
  const rect2 = cell2.getBoundingClientRect();
  const dx = rect2.left - rect1.left;
  const dy = rect2.top  - rect1.top;

  const DURATION = reverse ? 280 : 180;
  const easing   = reverse ? 'cubic-bezier(0.36,0.07,0.19,0.97)' : 'ease';

  cell1.style.zIndex = '20';
  cell2.style.zIndex = '20';
  cell1.style.position = 'relative';
  cell2.style.position = 'relative';

  // Double rAF garante que o browser regista o estado inicial antes de animar
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

let timerSeconds = 0;
let timerInterval = null;

/** Inicia o temporizador (conta crescente). */
function startTimer() {
  timerSeconds = 0;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timerSeconds / 60).toString().padStart(1, '0');
  const sec = (timerSeconds % 60).toString().padStart(2, '0');
  const timerEl = document.querySelector('#timer-container .value');
  if (timerEl) timerEl.textContent = `${min}:${sec}`;
}

/** Actualiza pontuação, contador de ovos e barra de progresso. */
function updateHUD() {
  if (scoreEl)     scoreEl.textContent     = score.toLocaleString('pt-PT');
  if (eggsCountEl) eggsCountEl.textContent = eggsScrambled;
  if (eggsBarEl)   eggsBarEl.style.width   = `${eggsScrambled}%`;
  if (eggsHintEl) {
    const remaining = TOTAL_EGGS - eggsScrambled;
    eggsHintEl.textContent = remaining > 0
      ? `${remaining} eggs to go!`
      : '🎉 All scrambled!';
  }

  updateHeatMeter();
}

/**
 * Actualiza o heat meter com base na pontuação.
 * Divide o score em 5 patamares.
 */
function updateHeatMeter() {
  const level     = Math.min(5, Math.floor(score / 1000));  // 0-5
  const segments  = document.querySelectorAll('.heat_bar_seg');
  segments.forEach((seg, i) => {
    seg.className = 'heat_bar_seg ' + (i < level ? 'on' : 'off');
  });
}

/* ════════════════════════════════════════════════════
   FIM DE JOGO
   ════════════════════════════════════════════════════ */

/** Verifica se o jogador completou o objectivo. */
function checkGameOver() {
  if (eggsScrambled >= TOTAL_EGGS) {
    gameOver = true;
    clearInterval(timerInterval);
    showEndScreen(true);
  }
}

/**
 * Mostra um ecrã de fim de jogo sobreposto.
 * @param {boolean} won — true se ganhou, false se perdeu
 */
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
        <button onclick="restartGame()">↺ PLAY AGAIN</button>
        <button class="secondary" onclick="window.location.href='./home.html'">✕ QUIT</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ════════════════════════════════════════════════════
   RESTART
   ════════════════════════════════════════════════════ */

/** Reinicia o jogo completamente (substitui o onclick do botão HTML). */
function restartGame() {
  // Remove overlay se existir
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.remove();

  // Reset estado
  score          = 0;
  eggsScrambled  = 0;
  selected       = null;
  isAnimating    = false;
  gameOver       = false;

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
  // Substitui o onclick do botão restart pelo restartGame dinâmico
  const btnRestart = document.getElementById('btn_restart');
  if (btnRestart) {
    btnRestart.removeAttribute('onclick');
    btnRestart.addEventListener('click', restartGame);
  }

  initGame();
});
