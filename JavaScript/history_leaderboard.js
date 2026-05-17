"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const playersWhoPlayed = users
        .filter(user => Number(user.stats?.gamesPlayed || 0) > 0)
        .sort((a, b) => Number(b.stats?.highScore || 0) - Number(a.stats?.highScore || 0));

    leaderboardList.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        const rank = i + 1;
        const user = playersWhoPlayed[i];

        const card = document.createElement("div");
        card.className = rank === 1 ? "player-card highlight" : "player-card";

        if (user) {
            const avatar = user.avatar || "🥚";
            const username = user.username || "Unknown Player";
            const highScore = Number(user.stats?.highScore || 0).toLocaleString("pt-PT");

            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">${avatar}</span>
                    <span class="player-name">${username}</span>
                </div>
                <div class="world-score">${highScore}</div>
            `;
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
});
