// Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21
// Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21
// Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21

"use strict";

const GRID_SIZE = 8;
const EGG_COUNT = 7;

export function randomEgg() {
    return Math.floor(Math.random() * EGG_COUNT);
}

export function Eggs()
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
