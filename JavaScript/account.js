"use strict";

/**
 * Converte um valor em segundos para o formato "Xh Ym".
 * Exemplo:
 *  - 3600 -> "1h 0m"
 *  - 7260 -> "2h 1m"
 *
 * @param {number} totalSeconds - Tempo total em segundos.
 * @returns {string} Tempo formatado em horas e minutos.
 */
function formatTimePlayed(totalSeconds) {
    // Garante que o valor é numérico; se não existir, usa 0
    const safeSeconds = Number(totalSeconds || 0);

    // Calcula o número total de horas inteiras
    const hours = Math.floor(safeSeconds / 3600);

    // Calcula os minutos restantes
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    // Devolve o texto no formato desejado
    return `${hours}h ${minutes}m`;
}

/**
 * Espera que o HTML esteja completamente carregado
 * antes de executar a lógica da página de conta.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Vai buscar o utilizador atualmente autenticado
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Se não existir utilizador autenticado, impede o acesso à página
    if (!loggedInUser) {
        alert("You are not logged in.");
        window.location.href = "./login.html";
        return;
    }

    // Procura os elementos principais do formulário de perfil
    const profileForm = document.getElementById("profile-form");
    const usernameInput = document.getElementById("username");
    const avatarButtons = document.querySelectorAll(".avatar_option");
    const cancelButton = document.getElementById("cancel-button");
    const logoutButton = document.getElementById("logout_button");

    // Procura os elementos onde serão mostradas as estatísticas
    const worldRank = document.getElementById("world-rank");
    const gamesPlayed = document.getElementById("games-played");
    const timePlayed = document.getElementById("time-played");
    const highScoreNormal = document.getElementById("high-score-normal");
    const highScoreTimed = document.getElementById("high-score-timed");
    const highScoreCautious = document.getElementById("high-score-cautious");

    // Se faltar algum elemento essencial do formulário, termina
    if (!profileForm || !usernameInput || !cancelButton || !logoutButton) return;

    // Define o avatar atualmente selecionado
    let selectedAvatar = loggedInUser.avatar || "🍳";

    // Preenche o campo de username com o nome do utilizador atual
    usernameInput.value = loggedInUser.username || "";

    // Vai buscar as estatísticas do utilizador; se não existirem, usa objeto vazio
    const stats = loggedInUser.stats || {};

    // Vai buscar os high scores por modo; se não existirem, usa objeto vazio
    const modeHighScores = stats.modeHighScores || {};

    // Converte os vários valores das stats para número
    const rankValue = Number(stats.worldRank || 0);
    const gamesPlayedValue = Number(stats.gamesPlayed || 0);
    const timePlayedValue = Number(stats.timePlayedSeconds || 0);

    // Vai buscar os highscores de cada modo
    const normalValue = Number(modeHighScores.normal || 0);
    const timedValue = Number(modeHighScores.timed || 0);
    const cautiousValue = Number(modeHighScores.cautious || 0);

    // Mostra o número de jogos jogados no HTML
    if (gamesPlayed) gamesPlayed.textContent = gamesPlayedValue;

    // Mostra o rank global no HTML
    if (worldRank) worldRank.textContent = `#${rankValue}`;

    // Mostra o tempo jogado total já formatado
    if (timePlayed) timePlayed.textContent = formatTimePlayed(timePlayedValue);

    // Mostra os highscores dos vários modos no HTML
    if (highScoreNormal) highScoreNormal.textContent = normalValue.toLocaleString("pt-PT");
    if (highScoreTimed) highScoreTimed.textContent = timedValue.toLocaleString("pt-PT");
    if (highScoreCautious) highScoreCautious.textContent = cautiousValue.toLocaleString("pt-PT");

    /**
     * Percorre todos os botões de avatar:
     *  - marca o avatar atual como selecionado
     *  - permite escolher um avatar diferente
     */
    avatarButtons.forEach(button => {
        // Se o emoji do botão for igual ao avatar do utilizador, marca-o como selecionado
        if (button.textContent.trim() === selectedAvatar) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }

        // Ao clicar num avatar:
        //  - remove a seleção dos outros
        //  - marca este como selecionado
        //  - atualiza a variável selectedAvatar
        button.addEventListener("click", () => {
            avatarButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedAvatar = button.textContent.trim();
        });
    });

    /**
     * Quando o utilizador carrega em "SAVE CHANGES",
     * guarda o novo username e o novo avatar no localStorage.
     */
    profileForm.addEventListener("submit", (event) => {
        // Impede o comportamento normal do formulário
        event.preventDefault();

        // Vai buscar o novo username introduzido
        const newUsername = usernameInput.value.trim();

        // Valida se o username não está vazio
        if (!newUsername) {
            alert("Username cannot be empty.");
            return;
        }

        // Vai buscar todos os utilizadores guardados
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Procura o índice do utilizador atual com base no email
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);

        // Se não encontrar o utilizador, mostra erro
        if (userIndex === -1) {
            alert("User not found.");
            return;
        }

        // Atualiza username e avatar do utilizador
        users[userIndex].username = newUsername;
        users[userIndex].avatar = selectedAvatar;

        // Guarda novamente a lista de utilizadores
        localStorage.setItem("users", JSON.stringify(users));

        // Atualiza também o utilizador atualmente autenticado
        localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

        // Recarrega a página para refletir as alterações imediatamente
        window.location.reload();
    });

    /**
     * Quando o utilizador carrega em "CANCEL",
     * repõe os valores atuais guardados no localStorage.
     */
    cancelButton.addEventListener("click", () => {
        // Vai buscar novamente o utilizador autenticado
        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

        // Repõe o username no campo
        usernameInput.value = currentUser.username || "";

        // Repõe o avatar selecionado
        selectedAvatar = currentUser.avatar || "🍳";

        // Atualiza visualmente os botões de avatar
        avatarButtons.forEach(button => {
            if (button.textContent.trim() === selectedAvatar) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    });

    /**
     * Quando o utilizador carrega em "LOG OUT",
     * remove a sessão atual do localStorage.
     */
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
    });
});
