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

        const username = email.split("@")[0];

        const newUser = {
            username: username,
            email: email,
            password: password,
            birthdate: birthdate,
            avatar: avatar,
            stats: {
                worldRank: "#847",
                highScore: "0",
                gamesPlayed: "0",
                timePlayed: "0h 0m"
            }
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(newUser));

        alert("Account created successfully!");
        window.location.href = "./edit_account.html";
    });
});
