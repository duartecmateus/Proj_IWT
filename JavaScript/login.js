"use strict";

/**
 * Espera que todo o HTML da página esteja carregado
 * antes de começar a executar a lógica de login.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Procura o formulário de login no HTML
    const form = document.getElementById("login-form");

    // Se o formulário não existir, termina a execução
    if (!form) return;

    /**
     * Quando o utilizador submete o formulário,
     * esta função trata da validação e autenticação.
     */
    form.addEventListener("submit", (event) => {
        // Impede o comportamento normal do formulário
        // (recarregar a página / enviar para o action)
        event.preventDefault();

        // Vai buscar o email introduzido pelo utilizador,
        // remove espaços extra e converte para minúsculas
        const email = document.getElementById("email_input").value.trim().toLowerCase();

        // Vai buscar a password introduzida pelo utilizador
        // e remove espaços extra
        const password = document.getElementById("pass_input").value.trim();

        // Verifica se os dois campos foram preenchidos
        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }

        // Lê a lista de utilizadores guardados no localStorage
        // Se não existir nenhum, usa um array vazio
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Procura um utilizador com email e password correspondentes
        const foundUser = users.find(user =>
            user.email === email && user.password === password
        );

        // Se não encontrar nenhum utilizador válido, mostra erro
        if (!foundUser) {
            alert("Invalid email or password.");
            return;
        }

        // Guarda o utilizador autenticado como utilizador atual da sessão
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));

        // Informa o utilizador de que o login foi bem-sucedido
        alert("Login successful!");

        // Redireciona para a página de edição de conta/perfil
        window.location.href = "./edit_account.html";
    });
});
