document.getElementById('subscription-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Obter os valores do formulário (incluindo senha)
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;
    const password = document.getElementById('password').value;

    console.log("Dados do formulário:", { name, phone, email, cpf, password });

    // Montar o payload para enviar para o n8n
    const body = {
        name: name,
        email: email,
        cpfCnpj: cpf,
        mobilePhone: phone,
        password: password // Adicionando a senha no payload
    };

    const url = 'https://n8n.zapnerd.cloud/webhook/singin';

    console.log("Enviando dados para o n8n:", body);

    try {
        // Fazer a requisição para o n8n
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        console.log("Resposta da requisição para o n8n:", data);

        if (response.ok) {
            const userData = data[0]?.insert_user_printpro?.returning[0];

            if (userData?.token) {
                // Armazenar o token no localStorage
                localStorage.setItem('userToken', userData.token);
                console.log("Token armazenado no localStorage:", userData.token);

                // Redirecionar para a pasta dashboard
                window.location.href = '../dashboard';
            } else {
                alert('Ocorreu um erro ao obter o token');
                console.error("Token não encontrado na resposta:", userData);
            }
        } else {
            alert('Ocorreu um erro ao criar o cliente no n8n');
            console.error(data);
        }
    } catch (error) {
        alert('Ocorreu um erro ao tentar se conectar com o servidor');
        console.error(error);
    }
});

// Função para aplicar a máscara no campo CPF
function mascaraCPF(campo) {
    var valor = campo.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    if (valor.length <= 11) {
        // Aplica a máscara no CPF (XXX.XXX.XXX-XX)
        campo.value = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

document.getElementById('register-link').addEventListener('click', function() {
    // Redirecionar para a pasta formulário
    window.location.href = '../login';
});