"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("sign-up");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email_input").value.trim().toLowerCase();
        const password = document.getElementById("pass_input").value.trim();
        const birthdate = document.getElementById("bdate_input").value;
        const avatar = document.querySelector('input[name="avatar"]:checked')?.value || "🍳";

        if (!email || !password || !birthdate) {
            alert("Please fill in all fields.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const alreadyExists = users.some(user => user.email === email);

        if (alreadyExists) {
            alert("This email is already registered.");
            return;
        }
        
        const valideDate = new Date(birthdate) >= new Date();

        if (valideDate) {
            alert("Your Egg hasn´t hatched yet");
            return;
        }

        const username = email.split("@")[0];

        const newUser = {
            username,
            email,
            password,
            birthdate,
            avatar,
            stats: {
                worldRank: 1,
                highScore: 0,
                gamesPlayed: 0,
                timePlayedSeconds: 0
            }
        };

        users.push(newUser);

        // simple local ranking
        users.sort((a, b) => (b.stats?.highScore || 0) - (a.stats?.highScore || 0));
        users.forEach((user, index) => {
            if (!user.stats) user.stats = {};
            user.stats.worldRank = index + 1;
        });

        const savedUser = users.find(user => user.email === email);

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(savedUser));

        alert("Account created successfully!");
        window.location.href = "./edit_account.html";
    });
});
