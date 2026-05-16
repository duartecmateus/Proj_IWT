"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const navLoginLink = document.getElementById("nav-login-link");
    if (!navLoginLink) return;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    const username = loggedInUser.username || "ACCOUNT";
    const avatar = loggedInUser.avatar || "";

    navLoginLink.textContent = `${avatar} ${username}`.trim();
    navLoginLink.href = "./edit_account.html";
});
