"use strict";

function formatTimePlayed(totalSeconds) {
    const safeSeconds = Number(totalSeconds || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You are not logged in.");
        window.location.href = "./login.html";
        return;
    }

    const profileForm = document.getElementById("profile-form");
    const usernameInput = document.getElementById("username");
    const avatarButtons = document.querySelectorAll(".avatar_option");
    const cancelButton = document.getElementById("cancel-button");
    const logoutButton = document.getElementById("logout_button");

    const worldRank = document.getElementById("world-rank");
    const gamesPlayed = document.getElementById("games-played");
    const timePlayed = document.getElementById("time-played");
    const highScoreNormal = document.getElementById("high-score-normal");
    const highScoreTimed = document.getElementById("high-score-timed");
    const highScoreCautious = document.getElementById("high-score-cautious");

    if (!profileForm || !usernameInput || !cancelButton || !logoutButton) return;

    let selectedAvatar = loggedInUser.avatar || "🍳";

    usernameInput.value = loggedInUser.username || "";

    const stats = loggedInUser.stats || {};
    const modeHighScores = stats.modeHighScores || {};

    const rankValue = Number(stats.worldRank || 0);
    const gamesPlayedValue = Number(stats.gamesPlayed || 0);
    const timePlayedValue = Number(stats.timePlayedSeconds || 0);

    const normalValue = Number(modeHighScores.normal || 0);
    const timedValue = Number(modeHighScores.timed || 0);
    const cautiousValue = Number(modeHighScores.cautious || 0);

    if (gamesPlayed) gamesPlayed.textContent = gamesPlayedValue;
    if (worldRank) worldRank.textContent = `#${rankValue}`;
    if (timePlayed) timePlayed.textContent = formatTimePlayed(timePlayedValue);

    if (highScoreNormal) highScoreNormal.textContent = normalValue.toLocaleString("pt-PT");
    if (highScoreTimed) highScoreTimed.textContent = timedValue.toLocaleString("pt-PT");
    if (highScoreCautious) highScoreCautious.textContent = cautiousValue.toLocaleString("pt-PT");

    avatarButtons.forEach(button => {
        if (button.textContent.trim() === selectedAvatar) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }

        button.addEventListener("click", () => {
            avatarButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedAvatar = button.textContent.trim();
        });
    });

    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newUsername = usernameInput.value.trim();

        if (!newUsername) {
            alert("Username cannot be empty.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);

        if (userIndex === -1) {
            alert("User not found.");
            return;
        }

        users[userIndex].username = newUsername;
        users[userIndex].avatar = selectedAvatar;

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

        window.location.reload();
    });

    cancelButton.addEventListener("click", () => {
        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

        usernameInput.value = currentUser.username || "";
        selectedAvatar = currentUser.avatar || "🍳";

        avatarButtons.forEach(button => {
            if (button.textContent.trim() === selectedAvatar) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
    });
});
