// Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21
// Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21
// Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21

"use strict";

const EGG_COUNT     = 7;
const MIN_MATCH     = 3;
const SCORE_PER_EGG = 100;

/* ════════════════════════════════════════════════════
   EGGS — imagens dos ovos
   ════════════════════════════════════════════════════ */

export function Eggs() {
    this.EGG_IMAGES = [
        'Imagens/ovo-vermelho.png',
        'Imagens/ovo-estrelado.png',
        'Imagens/ovo-dia-dos-muertos.png',
        'Imagens/ovo-amarelo.png',
        'Imagens/cat_egg.jpg',
        'Imagens/humpty_dumpty.jpg',
        'Imagens/togepie.jpg',
    ];
}

export function randomEgg() {
    return Math.floor(Math.random() * EGG_COUNT);
}


/* ════════════════════════════════════════════════════
   GRID — construção do tabuleiro
   @param {number} gridSize  Número de linhas/colunas (default 8)
   ════════════════════════════════════════════════════ */

export function Grid(gridSize = 8) {
    this.gridSize = gridSize;
    this.grid     = [];

    this.buildGrid = function () {
        this.grid = [];
        for (let r = 0; r < this.gridSize; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.gridSize; c++) {
                let type;
                do {
                    type = randomEgg();
                } while (this.wouldCauseMatch(r, c, type));
                this.grid[r][c] = type;
            }
        }
    };

    this.wouldCauseMatch = function (row, col, type) {
        if (col >= 2 &&
            this.grid[row][col - 1] === type &&
            this.grid[row][col - 2] === type) return true;
        if (row >= 2 &&
            this.grid[row - 1][col] === type &&
            this.grid[row - 2][col] === type) return true;
        return false;
    };
}

/* ════════════════════════════════════════════════════
   SWAP — troca de células (sem dependência do tamanho)
   ════════════════════════════════════════════════════ */

export function Swap(gridRef) {
    this.gridRef = gridRef;

    this.isAdjacent = function (r1, c1, r2, c2) {
        return (
            (Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 0) ||
            (Math.abs(r1 - r2) === 0 && Math.abs(c1 - c2) === 1)
        );
    };

    this.swapInGrid = function (r1, c1, r2, c2) {
        const grid   = this.gridRef.grid;
        const tmp    = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = tmp;
    };
}

/* ════════════════════════════════════════════════════
   MATCHER — deteção de combinações
   @param {object} gridRef   Referência à grelha { grid }
   @param {number} gridSize  Número de linhas/colunas (default 8)
   ════════════════════════════════════════════════════ */

export function Matcher(gridRef, gridSize = 8) {
    this.gridRef  = gridRef;
    this.gridSize = gridSize;

    this.findAllMatches = function () {
        const grid       = this.gridRef.grid;
        const GS         = this.gridSize;
        const matched    = new Set();
        const bonusCells = new Set();

        /* --- Matches Horizontais --- */
        for (let l = 0; l < GS; l++) {
            let c = 0;
            while (c < GS) {
                const type = grid[l][c];
                let end = c;
                while (end + 1 < GS && grid[l][end + 1] === type) end++;
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
        for (let c = 0; c < GS; c++) {
            let l = 0;
            while (l < GS) {
                const type = grid[l][c];
                let end = l;
                while (end + 1 < GS && grid[end + 1][c] === type) end++;
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
    };

    /**
     * Verifica se existe pelo menos um movimento válido no tabuleiro.
     */
    this.hasPossibleMove = function () {
        const grid = this.gridRef.grid;
        const GS   = this.gridSize;

        const swap = (r1, c1, r2, c2) => {
            const t      = grid[r1][c1];
            grid[r1][c1] = grid[r2][c2];
            grid[r2][c2] = t;
        };

        for (let r = 0; r < GS; r++) {
            for (let c = 0; c < GS; c++) {
                if (c + 1 < GS) {
                    swap(r, c, r, c + 1);
                    const found = this._hasMatch();
                    swap(r, c + 1, r, c);
                    if (found) return true;
                }
                if (r + 1 < GS) {
                    swap(r, c, r + 1, c);
                    const found = this._hasMatch();
                    swap(r + 1, c, r, c);
                    if (found) return true;
                }
            }
        }
        return false;
    };

    /**
     * Devolve o primeiro par de células que, ao ser trocado,
     * produziria uma combinação — usado pelo sistema de dicas.
     */
    this.findHint = function () {
        const grid = this.gridRef.grid;
        const GS   = this.gridSize;

        const swap = (r1, c1, r2, c2) => {
            const t      = grid[r1][c1];
            grid[r1][c1] = grid[r2][c2];
            grid[r2][c2] = t;
        };

        for (let r = 0; r < GS; r++) {
            for (let c = 0; c < GS; c++) {
                if (c + 1 < GS) {
                    swap(r, c, r, c + 1);
                    const found = this._hasMatch();
                    swap(r, c + 1, r, c);
                    if (found) return [{ row: r, col: c }, { row: r, col: c + 1 }];
                }
                if (r + 1 < GS) {
                    swap(r, c, r + 1, c);
                    const found = this._hasMatch();
                    swap(r + 1, c, r, c);
                    if (found) return [{ row: r, col: c }, { row: r + 1, col: c }];
                }
            }
        }
        return null;
    };

    /**
     * Varrimento rápido — devolve true assim que encontrar
     * uma sequência de MIN_MATCH ovos iguais.
     */
    this._hasMatch = function () {
        const grid = this.gridRef.grid;
        const GS   = this.gridSize;

        for (let r = 0; r < GS; r++) {
            for (let c = 0; c <= GS - MIN_MATCH; c++) {
                const type = grid[r][c];
                if (type === null) continue;
                if (type === grid[r][c + 1] && type === grid[r][c + 2]) return true;
            }
        }

        for (let c = 0; c < GS; c++) {
            for (let r = 0; r <= GS - MIN_MATCH; r++) {
                const type = grid[r][c];
                if (type === null) continue;
                if (type === grid[r + 1][c] && type === grid[r + 2][c]) return true;
            }
        }

        return false;
    };
}

/* ════════════════════════════════════════════════════
   GRAVITY — queda e reabastecimento da grelha
   @param {object} gridRef   Referência à grelha { grid }
   @param {number} gridSize  Número de linhas/colunas (default 8)
   ════════════════════════════════════════════════════ */

export function Gravity(gridRef, gridSize = 8) {
    this.gridRef  = gridRef;
    this.gridSize = gridSize;

    this.applyGravity = function () {
        const grid = this.gridRef.grid;
        const GS   = this.gridSize;
        for (let c = 0; c < GS; c++) {
            let writeRow = GS - 1;
            for (let r = GS - 1; r >= 0; r--) {
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
    };

    this.refillGrid = function () {
        const grid = this.gridRef.grid;
        const GS   = this.gridSize;
        for (let r = 0; r < GS; r++) {
            for (let c = 0; c < GS; c++) {
                if (grid[r][c] === null) {
                    grid[r][c] = randomEgg();
                }
            }
        }
    };
}

/* ════════════════════════════════════════════════════
   SCORE — pontuação e contagem de ovos
   @param {number} totalEggs  Ovos necessários para completar (default 100)
   ════════════════════════════════════════════════════ */

export function Score(totalEggs = 100) {
    this.totalEggs     = totalEggs;
    this.score         = 0;
    this.eggsScrambled = 0;

    this.calculatePoints = function (cells, bonus) {
        const bonusKeys  = new Set(bonus.map(b => `${b.row},${b.col}`));
        let pointsGained = 0;
        cells.forEach(({ row, col }) => {
            pointsGained += bonusKeys.has(`${row},${col}`)
                ? SCORE_PER_EGG * 2
                : SCORE_PER_EGG;
        });
        return pointsGained;
    };

    this.addPoints = function (points) {
        this.score += points;
    };

    this.addEggs = function (count) {
        this.eggsScrambled = Math.min(this.totalEggs, this.eggsScrambled + count);
    };

    this.isComplete = function () {
        return this.eggsScrambled >= this.totalEggs;
    };

    /**
     * Repõe a pontuação.
     * @param {number} [newTotalEggs]  Permite alterar o objetivo ao reiniciar.
     */
    this.reset = function (newTotalEggs) {
        if (newTotalEggs !== undefined) this.totalEggs = newTotalEggs;
        this.score         = 0;
        this.eggsScrambled = 0;
    };
}

/* ════════════════════════════════════════════════════
   CONFIGURAÇÕES DE DIFICULDADE
   ════════════════════════════════════════════════════ */

export const DIFFICULTY_CONFIGS = {
    easy: {
        key:       'easy',
        label:     'Easy',
        gridSize:  8,
        totalEggs: 20,
    },
    medium: {
        key:       'medium',
        label:     'Normal',
        gridSize:  9,
        totalEggs: 25,
    },
    hard: {
        key:       'hard',
        label:     'Hard',
        gridSize:  10,
        totalEggs: 30,
    },
};

/* ════════════════════════════════════════════════════
   CONFIGURAÇÕES DE MODO
   ════════════════════════════════════════════════════ */

export const GAME_MODES = {
    normal: {
        key: 'normal',
        label: 'Normal',
    },
    timed: {
        key: 'timed',
        label: 'Contra o Tempo',
        timeLimitSeconds: 120,
    },
    cautious: {
        key: 'cautious',
        label: 'Cauteloso',
        maxMoves: 15,
    },
};

/* ════════════════════════════════════════════════════
   KEYBOARD NAVIGATION
   ════════════════════════════════════════════════════ */

export function Keyboard() {
    this.getKeyMove = function(key){
        const moves = {
            'w': [-1, 0],
            's': [1, 0],
            'a': [0, -1],
            'd': [0, 1],
        }
        return moves[key] ?? null;
    }
}

