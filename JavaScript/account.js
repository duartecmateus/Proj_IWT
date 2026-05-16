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
    const highScore = document.getElementById("high-score");
    const gamesPlayed = document.getElementById("games-played");
    const timePlayed = document.getElementById("time-played");

    if (!profileForm || !usernameInput || !cancelButton || !logoutButton) return;

    let selectedAvatar = loggedInUser.avatar || "🍳";

    usernameInput.value = loggedInUser.username || "";

    const stats = loggedInUser.stats || {
        worldRank: 1,
        highScore: 0,
        gamesPlayed: 0,
        timePlayedSeconds: 0
    };

    if (worldRank) worldRank.textContent = `#${Number(stats.worldRank || 1)}`;
    if (highScore) highScore.textContent = Number(stats.highScore || 0).toLocaleString("pt-PT");
    if (gamesPlayed) gamesPlayed.textContent = Number(stats.gamesPlayed || 0);
    if (timePlayed) timePlayed.textContent = formatTimePlayed(stats.timePlayedSeconds || 0);

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
