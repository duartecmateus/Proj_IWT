"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const leaderboardList = document.getElementById("leaderboard-list");
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

            card.innerHTML = `
                <div class="rank-info">
                    <span class="rank-number">#${rank}</span>
                    <span class="avatar">${avatar}</span>
                    <span class="player-name">${username}</span>
                </div>
                <div class="world-score">${totalPoints}</div>
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
