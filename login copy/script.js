// script.js

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Tentativa de login:", { email, password });

    const query = `
        query loginUser($email: String!, $password: String!) {
            user_printpro(where: {email: {_eq: $email}, password: {_eq: $password}}) {
                token
            }
        }
    `;

    const variables = { email, password };

    try {
        const response = await fetch('https://backend.pedepro.com.br/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': 'dz9uee0D8fyyYzQsv2piE1MLcVZklkc7'
            },
            body: JSON.stringify({ query, variables })
        });

        const result = await response.json();
        console.log("Resposta do Hasura:", result);

        const user = result?.data?.user_printpro[0];

        if (user?.token) {
            // Salvar o token no localStorage
            localStorage.setItem('userToken', user.token);
            console.log("Token armazenado:", user.token);

            // Redirecionar para a pasta dashboard
            window.location.href = '../dashboard';
        } else {
            alert('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
    } catch (error) {
        console.error("Erro ao tentar realizar o login:", error);
        alert('Erro ao tentar se conectar com o servidor.');
    }
});

document.getElementById('register-link').addEventListener('click', function() {
    // Redirecionar para a pasta formulário
    window.location.href = '../formulario';
});
