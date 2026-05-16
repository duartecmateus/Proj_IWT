"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email_input").value.trim().toLowerCase();
        const password = document.getElementById("pass_input").value.trim();

        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const foundUser = users.find(user =>
            user.email === email && user.password === password
        );

        if (!foundUser) {
            alert("Invalid email or password.");
            return;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        alert("Login successful!");
        window.location.href = "./edit_account.html";
    });
});
