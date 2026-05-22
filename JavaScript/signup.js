"use strict";

/**
 * Espera que o HTML da página esteja completamente carregado
 * antes de executar a lógica do registo.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Procura o formulário de registo no HTML
    const form = document.getElementById("sign-up");

    // Se o formulário não existir, termina a execução
    if (!form) return;

    /**
     * Quando o utilizador submete o formulário,
     * esta função trata da validação e criação da conta.
     */
    form.addEventListener("submit", (event) => {
        // Impede o comportamento normal do formulário
        // (recarregar a página / enviar os dados para o action)
        event.preventDefault();

        // Vai buscar o email introduzido,
        // remove espaços extra e converte para minúsculas
        const email = document.getElementById("email_input").value.trim().toLowerCase();

        // Vai buscar a password introduzida
        const password = document.getElementById("pass_input").value.trim();

        // Vai buscar a data de nascimento selecionada
        const birthdate = document.getElementById("bdate_input").value;

        // Vai buscar o avatar selecionado;
        // se não houver nenhum, usa 🍳 por defeito
        const avatar = document.querySelector('input[name="avatar"]:checked')?.value || "🍳";

        // Verifica se todos os campos obrigatórios foram preenchidos
        if (!email || !password || !birthdate) {
            alert("Please fill in all fields.");
            return;
        }

        // Lê a lista de utilizadores guardados no localStorage;
        // se não existir, usa um array vazio
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Verifica se já existe um utilizador com o mesmo email
        const alreadyExists = users.some(user => user.email === email);

        // Se já existir, mostra aviso e termina
        if (alreadyExists) {
            alert("This email is already registered.");
            return;
        }

        // Verifica se a data de nascimento é inválida
        // (neste caso, se for hoje ou no futuro)
        const valideDate = new Date(birthdate) >= new Date();

        // Se a data não for válida, mostra aviso e termina
        if (valideDate) {
            alert("Your Egg hasn´t hatched yet");
            return;
        }

        // Cria um username automático a partir da parte do email antes do @
        const username = email.split("@")[0];

        // Cria o novo objeto de utilizador com os dados básicos
        // e estatísticas iniciais a zero
        const newUser = {
            username,
            email,
            password,
            birthdate,
            avatar,
            stats: {
                worldRank: 1,
                gamesPlayed: 0,
                timePlayedSeconds: 0,
                totalPoints: 0,
                modeHighScores: {
                    normal: 0,
                    timed: 0,
                    cautious: 0
                }
            }
        };

        // Adiciona o novo utilizador ao array de utilizadores
        users.push(newUser);

        // Ordena os utilizadores pelos pontos totais (do maior para o menor)
        users.sort((a, b) => Number(b.stats?.totalPoints || 0) - Number(a.stats?.totalPoints || 0));

        // Atualiza o rank global de todos os utilizadores
        users.forEach((user, index) => {
            if (!user.stats) user.stats = {};
            user.stats.worldRank = index + 1;
        });

        // Volta a procurar o utilizador recém-criado
        // já com o rank atualizado
        const savedUser = users.find(user => user.email === email);

        // Guarda a lista completa de utilizadores atualizada
        localStorage.setItem("users", JSON.stringify(users));

        // Guarda também o novo utilizador como utilizador autenticado
        localStorage.setItem("loggedInUser", JSON.stringify(savedUser));

        // Informa que a conta foi criada com sucesso
        alert("Account created successfully!");

        // Redireciona para a página de edição de conta/perfil
        window.location.href = "./edit_account.html";
    });
});
