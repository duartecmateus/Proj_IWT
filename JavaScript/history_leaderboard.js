/* Grupo: 27, Número: 62796, Nome: Gabriel Lima, PL: 21 */
/* Grupo: 27, Número: 59712, Nome: Miguel Moreira, PL: 21 */
/* Grupo: 27, Número: 62019, Nome: Duarte Matheus, PL: 21  */
"use strict";

/**
 * Converte um tempo em segundos para o formato "Xh Ym".
 * @param {number} totalSeconds - Tempo total em segundos.
 * @returns {string} Tempo formatado em horas e minutos.
 */
function formatTimePlayed(totalSeconds) {
    // Garante que o valor é numérico; se vier undefined/null, usa 0
    const safeSeconds = Number(totalSeconds || 0);

    // Calcula o número inteiro de horas
    const hours = Math.floor(safeSeconds / 3600);

    // Calcula os minutos restantes depois de retirar as horas
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    // Devolve o texto já formatado
    return `${hours}h ${minutes}m`;
}

/**
 * Abre o modal de detalhes de um jogador.
 * Mostra:
 *  - avatar
 *  - username
 *  - rank
 *  - total points
 *  - games played
 *  - time played
 *  - high score de cada modo (normal, timed, cautious)
 *
 * @param {object} user - Objeto do utilizador vindo do localStorage.
 * @param {number} rank - Posição desse jogador na leaderboard.
 */
function openPlayerModal(user, rank) {
    // Procura os elementos principais do modal no DOM
    const overlay = document.getElementById("player-modal-overlay");
    const content = document.getElementById("player-modal-content");

    // Se o modal não existir no HTML, sai da função
    if (!overlay || !content) return;

    // Vai buscar as stats do utilizador; se não existirem, usa objeto vazio
    const stats = user.stats || {};

    // Vai buscar os highscores por modo; se não existirem, usa objeto vazio
    const modeHighScores = stats.modeHighScores || {};

    // Lê e formata o high score do modo normal
    const normalScore = Number(modeHighScores.normal || 0).toLocaleString("pt-PT");

    // Lê e formata o high score do modo timed
    const timedScore = Number(modeHighScores.timed || 0).toLocaleString("pt-PT");

    // Lê e formata o high score do modo cautious
    const cautiousScore = Number(modeHighScores.cautious || 0).toLocaleString("pt-PT");

    // Lê e formata os pontos totais do jogador
    const totalPoints = Number(stats.totalPoints || 0).toLocaleString("pt-PT");

    // Lê o número total de jogos jogados
    const gamesPlayed = Number(stats.gamesPlayed || 0);

    // Converte o tempo jogado total para o formato h/m
    const timePlayed = formatTimePlayed(stats.timePlayedSeconds || 0);

    // Preenche o conteúdo do modal com os dados do jogador
    content.innerHTML = `
        <div class="player-modal-header">
            <div class="player-modal-avatar">${user.avatar || "🥚"}</div>
            <div>
                <h3 class="player-modal-name">${user.username || "Unknown Player"}</h3>
                <p class="player-modal-rank">World Rank #${rank}</p>
            </div>
        </div>

        <div class="player-modal-grid">
            <div class="player-modal-tile">
                <span class="modal-label">Total Points</span>
                <span class="modal-value">${totalPoints}</span>
            </div>
            <div class="player-modal-tile">
                <span class="modal-label">Games Played</span>
                <span class="modal-value">${gamesPlayed}</span>
            </div>
            <div class="player-modal-tile">
                <span class="modal-label">Time Played</span>
                <span class="modal-value">${timePlayed}</span>
            </div>
            <div class="player-modal-tile">
                <span class="modal-label">Normal</span>
                <span class="modal-value">${normalScore}</span>
            </div>
            <div class="player-modal-tile">
                <span class="modal-label">Time Trial</span>
                <span class="modal-value">${timedScore}</span>
            </div>
            <div class="player-modal-tile">
                <span class="modal-label">Cautious</span>
                <span class="modal-value">${cautiousScore}</span>
            </div>
        </div>
    `;

    // Remove a classe "hidden" para tornar o modal visível
    overlay.classList.remove("hidden");
}

/**
 * Fecha o modal de detalhes do jogador.
 */
function closePlayerModal() {
    // Procura o overlay do modal
    const overlay = document.getElementById("player-modal-overlay");

    // Se não existir, termina
    if (!overlay) return;

    // Volta a esconder o modal
    overlay.classList.add("hidden");
}

/**
 * Espera que o HTML carregue completamente antes de executar a lógica.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Vai buscar o contentor onde a leaderboard vai ser gerada
    const leaderboardList = document.getElementById("leaderboard-list");

    // Vai buscar o botão de fechar do modal
    const closeBtn = document.getElementById("player-modal-close");

    // Vai buscar o fundo/overlay do modal
    const overlay = document.getElementById("player-modal-overlay");

    // Se a leaderboard não existir no HTML, não faz nada
    if (!leaderboardList) return;

    // Lê todos os utilizadores guardados no localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Filtra apenas os jogadores que já jogaram pelo menos 1 jogo
    // e ordena-os por totalPoints de forma decrescente
    const rankedUsers = users
        .filter(user => Number(user.stats?.gamesPlayed || 0) > 0)
        .sort((a, b) => Number(b.stats?.totalPoints || 0) - Number(a.stats?.totalPoints || 0));

    // Limpa qualquer conteúdo anterior da leaderboard
    leaderboardList.innerHTML = "";

    // Cria sempre 10 posições na leaderboard
    for (let i = 0; i < 10; i++) {
        // Rank visível ao utilizador (#1, #2, #3, ...)
        const rank = i + 1;

        // Vai buscar o utilizador correspondente a essa posição
        const user = rankedUsers[i];

        // Cria um card/linha para a leaderboard
        const card = document.createElement("div");

        // Se for o primeiro lugar e existir utilizador real, aplica destaque
        card.className = (rank === 1 && user) ? "player-card highlight" : "player-card";

        // Se existir um jogador real nesta posição
        if (user) {
            // Vai buscar avatar, nome e pontos totais
            const avatar = user.avatar || "🥚";
            const username = user.username || "Unknown Player";
            const totalPoints = Number(user.stats?.totalPoints || 0).toLocaleString("pt-PT");

            // Marca esta linha como clicável
            card.classList.add("clickable-player");

            // Preenche a linha com os dados do jogador
            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">${avatar}</span>
                    <span class="player-name">${username}</span>
                </div>
                <div class="world-score">${totalPoints}</div>
            `;

            // Ao clicar na linha, abre o modal com os detalhes desse jogador
            card.addEventListener("click", () => {
                openPlayerModal(user, rank);
            });
        } else {
            // Se não existir jogador para esta posição, mostra "[incubating]"
            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">❔</span>
                    <span class="player-name">[incubating]</span>
                </div>
                <div class="world-score">[incubating]</div>
            `;
        }

        // Adiciona a linha à leaderboard no HTML
        leaderboardList.appendChild(card);
    }

    // Se existir o botão de fechar, associa o fecho do modal ao clique
    if (closeBtn) {
        closeBtn.addEventListener("click", closePlayerModal);
    }

    // Se existir o overlay, permite fechar o modal clicando fora da caixa
    if (overlay) {
        overlay.addEventListener("click", (event) => {
            // Só fecha se o clique for mesmo no fundo e não no conteúdo interior
            if (event.target === overlay) {
                closePlayerModal();
            }
        });
    }
});
