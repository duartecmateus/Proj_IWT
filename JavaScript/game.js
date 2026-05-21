// Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21
// Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21
// Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21

"use strict";

const GRID_SIZE = 8;
const EGG_COUNT = 7;
const MIN_MATCH     = 3;
const TOTAL_EGGS    = 100;
const SCORE_PER_EGG = 100;

export function randomEgg() {
    return Math.floor(Math.random() * EGG_COUNT);
}

/* ════════════════════════════════════════════════════
   EGGS — imagens dos ovos
   ════════════════════════════════════════════════════ */

export function Eggs() //tirar os url
{
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

/* ════════════════════════════════════════════════════
   GRID contruction
   ════════════════════════════════════════════════════ */

export function Grid()
{
    this.grid = [];

    this.buildGrid = function() {
        this.grid = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            this.grid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                let type;
                do {
                    type = randomEgg();
                } while (this.wouldCauseMatch(r, c, type));
                this.grid[r][c] = type;
            }
        }
    }

    this.wouldCauseMatch = function(row, col, type) {
        if (col >= 2 && this.grid[row][col - 1] === type && this.grid[row][col - 2] === type)
            return true;
        if (row >= 2 && this.grid[row - 1][col] === type && this.grid[row - 2][col] === type)
            return true;
        return false;
    }
}

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

/* ════════════════════════════════════════════════════
   SWAP cell logic
   ════════════════════════════════════════════════════ */

export function Swap(gridRef)
{
    // gridRef is a wrapper object { grid } so mutations stay in sync
    this.gridRef = gridRef;

    this.isAdjacent = function(r1, c1, r2, c2) {
        return (
            (Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 0) ||
            (Math.abs(r1 - r2) === 0 && Math.abs(c1 - c2) === 1)
        );
    }

    this.swapInGrid = function(r1, c1, r2, c2) {
        const grid   = this.gridRef.grid;
        const tmp    = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = tmp;
    }
}

/* ════════════════════════════════════════════════════
   MATCH detection
   ════════════════════════════════════════════════════ */

export function Matcher(gridRef)
{
    this.gridRef = gridRef;

    this.findAllMatches = function() {
        const grid       = this.gridRef.grid;
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

    /**
     * Checks every adjacent pair of cells and returns true if swapping
     * any one of them would produce a match of MIN_MATCH or more eggs.
     */
    this.hasPossibleMove = function() {
        const grid = this.gridRef.grid;

        const swap = (r1, c1, r2, c2) => {  //devo dar como parametro a classe swap para depois usar o swap ou posso ter o duplicado?
            const t = grid[r1][c1];
            grid[r1][c1] = grid[r2][c2];
            grid[r2][c2] = t;
        };

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {

                // Try swap with right neighbour
                if (c + 1 < GRID_SIZE) {
                    swap(r, c, r, c + 1);
                    const found = this._hasMatch();
                    swap(r, c + 1, r, c); // restore
                    if (found) return true;
                }

                // Try swap with bottom neighbour
                if (r + 1 < GRID_SIZE) {
                    swap(r, c, r + 1, c);
                    const found = this._hasMatch();
                    swap(r + 1, c, r, c); // restore
                    if (found) return true;
                }
            }
        }

        return false;
    }


    /**
     * Checks every adjacent pair of cells and returns the first coordinates
     * found that would produce a match of MIN_MATCH or more eggs. So that
     * they can later be highlighted.
     */
    this.findHint = function() {
        const grid = this.gridRef.grid;
        
        const swap = (r1, c1, r2, c2) => {
            const t = grid[r1][c1];
            grid[r1][c1] = grid[r2][c2];
            grid[r2][c2] = t;
        };
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {

                if (c + 1 < GRID_SIZE) {
                    swap(r, c, r, c + 1);
                    const found = this._hasMatch();
                    swap(r, c + 1, r, c); // restore
                    if (found) return [{ row: r, col: c }, { row: r, col: c + 1 }];
                }

                if (r + 1 < GRID_SIZE) {
                    swap(r, c, r + 1, c);
                    const found = this._hasMatch();
                    swap(r + 1, c, r, c); // restore
                    if (found) return [{ row: r, col: c }, { row: r + 1, col: c }];
                }
            }
        }

        return null;
    }

    /**
     * Fast scan — returns true as soon as any run of MIN_MATCH
     * identical (non-null) eggs is found horizontally or vertically.
     * Used by hasPossibleMove() to test candidate swaps cheaply.
     */
    this._hasMatch = function() {
        const grid = this.gridRef.grid;

        // Horizontal check
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c <= GRID_SIZE - MIN_MATCH; c++) {
                const type = grid[r][c];
                if (type === null) continue;
                if (type === grid[r][c + 1] && type === grid[r][c + 2])
                    return true;
            }
        }

        // Vertical check
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r <= GRID_SIZE - MIN_MATCH; r++) {
                const type = grid[r][c];
                if (type === null) continue;
                if (type === grid[r + 1][c] && type === grid[r + 2][c])
                    return true;
            }
        }

        return false;
    }
}

/* ════════════════════════════════════════════════════
   GRAVITY — gravidade e reabastecimento da grelha
   ════════════════════════════════════════════════════ */

export function Gravity(gridRef)
{
    this.gridRef = gridRef;

    this.applyGravity = function() {
        const grid = this.gridRef.grid;
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

    this.refillGrid = function() {
        const grid = this.gridRef.grid;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === null) {
                    grid[r][c] = randomEgg();
                }
            }
        }
    }
}

/* ════════════════════════════════════════════════════
   SCORE — pontuação e contagem de ovos
   ════════════════════════════════════════════════════ */

export function Score()
{
    this.score         = 0;
    this.eggsScrambled = 0;

    this.calculatePoints = function(cells, bonus) {
        const bonusKeys = new Set(bonus.map(b => `${b.row},${b.col}`));
        let pointsGained = 0;
        cells.forEach(({ row, col }) => {
            pointsGained += bonusKeys.has(`${row},${col}`) ? SCORE_PER_EGG * 2 : SCORE_PER_EGG;
        });
        return pointsGained;
    }

    this.addPoints = function(points) {
        this.score += points;
    }

    this.addEggs = function(count) {
        this.eggsScrambled = Math.min(TOTAL_EGGS, this.eggsScrambled + count);
    }

    this.isComplete = function() {
        return this.eggsScrambled >= TOTAL_EGGS;
    }

    this.reset = function() {
        this.score         = 0;
        this.eggsScrambled = 0;
    }
}


