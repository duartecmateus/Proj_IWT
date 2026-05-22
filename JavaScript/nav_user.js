"use strict";

/**
 * Espera que o HTML da página esteja completamente carregado
 * antes de executar a lógica que altera o link de login.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Procura o link da navegação que normalmente mostra "LOGIN"
    const navLoginLink = document.getElementById("nav-login-link");

    // Se esse link não existir na página, termina
    if (!navLoginLink) return;

    // Vai buscar o utilizador autenticado atualmente guardado no localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Se não existir nenhum utilizador autenticado, mantém o link como está
    if (!loggedInUser) return;

    // Vai buscar o username do utilizador;
    // se não existir, usa "ACCOUNT" como texto por defeito
    const username = loggedInUser.username || "ACCOUNT";

    // Vai buscar o avatar do utilizador;
    // se não existir, usa string vazia
    const avatar = loggedInUser.avatar || "";

    // Altera o texto do link para mostrar avatar + username
    navLoginLink.textContent = `${avatar} ${username}`.trim();

    // Altera o destino do link para a página da conta/perfil
    navLoginLink.href = "./edit_account.html";
});
