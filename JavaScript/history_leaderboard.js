"use strict";

function formatTimePlayed(totalSeconds) {
    const safeSeconds = Number(totalSeconds || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function openPlayerModal(user, rank) {
    const overlay = document.getElementById("player-modal-overlay");
    const content = document.getElementById("player-modal-content");
    if (!overlay || !content) return;

    const stats = user.stats || {};
    const modeHighScores = stats.modeHighScores || {};

    const normalScore = Number(modeHighScores.normal || 0).toLocaleString("pt-PT");
    const timedScore = Number(modeHighScores.timed || 0).toLocaleString("pt-PT");
    const cautiousScore = Number(modeHighScores.cautious || 0).toLocaleString("pt-PT");
    const totalPoints = Number(stats.totalPoints || 0).toLocaleString("pt-PT");
    const gamesPlayed = Number(stats.gamesPlayed || 0);
    const timePlayed = formatTimePlayed(stats.timePlayedSeconds || 0);

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

    overlay.classList.remove("hidden");
}

function closePlayerModal() {
    const overlay = document.getElementById("player-modal-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const leaderboardList = document.getElementById("leaderboard-list");
    const closeBtn = document.getElementById("player-modal-close");
    const overlay = document.getElementById("player-modal-overlay");

    if (!leaderboardList) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const rankedUsers = users
        .filter(user => Number(user.stats?.gamesPlayed || 0) > 0)
        .sort((a, b) => Number(b.stats?.totalPoints || 0) - Number(a.stats?.totalPoints || 0));

    leaderboardList.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        const rank = i + 1;
        const user = rankedUsers[i];

        const card = document.createElement("div");
        card.className = (rank === 1 && user) ? "player-card highlight" : "player-card";

        if (user) {
            const avatar = user.avatar || "🥚";
            const username = user.username || "Unknown Player";
            const totalPoints = Number(user.stats?.totalPoints || 0).toLocaleString("pt-PT");

            card.classList.add("clickable-player");

            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">${avatar}</span>
                    <span class="player-name">${username}</span>
                </div>
                <div class="world-score">${totalPoints}</div>
            `;

            card.addEventListener("click", () => {
                openPlayerModal(user, rank);
            });
        } else {
            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">❔</span>
                    <span class="player-name">[redacted]</span>
                </div>
                <div class="world-score">[redacted]</div>
            `;
        }

        leaderboardList.appendChild(card);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closePlayerModal);
    }

    if (overlay) {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closePlayerModal();
            }
        });
    }
});
