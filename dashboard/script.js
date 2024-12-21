// script.js

async function fetchUserData(token) {
    const userQuery = `
        query getUserByToken($token: uuid!) {
            user_printpro(where: {token: {_eq: $token}}) {
                id
                name
                email
                phone
                cpf
                customer_assas_id
                token
                assinatura
            }
        }
    `;

    const response = await fetch('https://backend.pedepro.com.br/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': 'dz9uee0D8fyyYzQsv2piE1MLcVZklkc7',
        },
        body: JSON.stringify({ query: userQuery, variables: { token } }),
    });

    const data = await response.json();
    return data?.data?.user_printpro[0];
}

async function fetchSubscriptionDetails(assinaturaId, clientId) {
    const payload = {
        assinaturaId,
        clientId
    };

    console.log('Payload enviado:', payload);

    try {
        const response = await fetch(
            'https://n8n.zapnerd.cloud/webhook/f1814223-1207-4790-8506-92badff28121',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        console.log('Status da resposta:', response.status);

        const data = await response.json();
        console.log('Dados retornados:', data);

        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error; // Repassa o erro para tratamento em nível superior
    }
}



async function loadDashboard() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert('Usuário não autenticado. Redirecionando para login.');
        window.location.href = '../login';
        return;
    }

    try {
        const user = await fetchUserData(token);
        if (!user) {
            alert('Usuário não encontrado. Redirecionando para login.');
            window.location.href = '../login';
            return;
        }

        // Armazenar dados no window
        window.user = user;

        // Preencher os campos do usuário
        document.getElementById('user-name').textContent = user.name || 'Não informado';
        document.getElementById('user-email').textContent = user.email || 'Não informado';
        document.getElementById('user-phone').textContent = user.phone || 'Não informado';
        document.getElementById('user-cpf').textContent = user.cpf || 'Não informado';
        document.getElementById('user-assinatura').textContent = user.assinatura || 'Sem assinatura';

        // Verifica se o usuário não possui assinatura
        if (!user.assinatura) {
            document.getElementById('subscription-info').innerHTML = `
                <p>Você não possui uma assinatura ativa.</p>
                <button id="create-subscription-btn" class="btn-primary">Criar Assinatura</button>
            `;

            // Adiciona evento ao botão "Criar Assinatura"
            document.getElementById('create-subscription-btn').addEventListener('click', async function () {
                const clientId = user.customer_assas_id;

                if (!clientId) {
                    alert('Não foi possível encontrar o ID do cliente.');
                    return;
                }

                const payload = {
                    clientId,
                };

                try {
                    const response = await fetch('https://n8n.zapnerd.cloud/webhook/create/subscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        alert('Assinatura criada com sucesso!');
                        location.reload(); // Recarrega a página após criar a assinatura
                    } else {
                        alert('Falha ao criar a assinatura. Tente novamente.');
                    }
                } catch (error) {
                    console.error('Erro ao criar a assinatura:', error);
                    alert('Erro ao criar a assinatura. Tente novamente.');
                }
            });

            return;
        }

        const subscriptionData = await fetchSubscriptionDetails(user.assinatura, user.id);
        if (subscriptionData?.length > 0 && subscriptionData[0]?.data?.length > 0) {
            const subscription = subscriptionData[0].data[0]; // Acessa a assinatura dentro do objeto retornado

            console.log('Dados da assinatura processados:', subscription);

            document.getElementById('subscription-description').textContent = subscription.description || 'Sem descrição';
            document.getElementById('subscription-value').textContent = subscription.value || '0,00';
            document.getElementById('subscription-status').textContent = subscription.status || 'Desconhecido';
            document.getElementById('subscription-due-date').textContent = subscription.dueDate || 'Sem data';
        } else {
            document.getElementById('subscription-info').innerHTML = '<p>Não foi possível carregar os detalhes da assinatura.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
        alert('Erro ao carregar o dashboard.');
    }
}



// Carregar o dashboard ao inicializar a página
loadDashboard();



// Função para exibir as cobranças no dashboard
async function displayCharges(data) {
    const chargesContainer = document.getElementById('charges-container');
    chargesContainer.innerHTML = ''; // Limpa a lista de cobranças

    if (data.length === 0) {
        chargesContainer.innerHTML = '<p>Nenhuma cobrança encontrada.</p>';
        return;
    }

    // Define as cores suaves para cada status
    const statusColors = {
        PENDING: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
        RECEIVED: 'rgba(0, 255, 0, 0.2)', // Verde claro
        CONFIRMED: 'rgba(0, 255, 0, 0.2)', // Verde claro
        OVERDUE: 'rgba(255, 0, 0, 0.2)', // Vermelho claro
        REFUNDED: 'rgba(0, 255, 0, 0.2)', // Verde claro
        RECEIVED_IN_CASH: 'rgba(0, 255, 0, 0.2)', // Verde claro
        REFUND_REQUESTED: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
        REFUND_IN_PROGRESS: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
        CHARGEBACK_REQUESTED: 'rgba(255, 0, 0, 0.2)', // Vermelho claro
        CHARGEBACK_DISPUTE: 'rgba(255, 0, 0, 0.2)', // Vermelho claro
        AWAITING_CHARGEBACK_REVERSAL: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
        DUNNING_REQUESTED: 'rgba(255, 0, 0, 0.2)', // Vermelho claro
        DUNNING_RECEIVED: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
        AWAITING_RISK_ANALYSIS: 'rgba(255, 255, 0, 0.2)', // Amarelo claro
    };

    data.forEach(charge => {
        // Criar elemento de cobrança
        const chargeElement = document.createElement('div');
        chargeElement.classList.add('charge-item');

        // Define a cor de fundo com base no status
        const backgroundColor = statusColors[charge.status] || 'rgba(255, 255, 255, 0.2)'; // Branco suave como padrão
        chargeElement.style.backgroundColor = backgroundColor;

        chargeElement.innerHTML = `
            <p><strong>ID:</strong> ${charge.id}</p>
            <p><strong>Status:</strong> ${charge.status}</p>
            <p><strong>Data de Vencimento:</strong> ${charge.dueDate}</p>
            <p><strong>Valor:</strong> R$ ${charge.value}</p>
            <button class="view-invoice-btn" data-url="${charge.invoiceUrl}">Ver Fatura</button>
        `;

        // Adiciona o item de cobrança ao container
        chargesContainer.appendChild(chargeElement);

        // Adiciona o evento para abrir a fatura em um popup
        const viewInvoiceBtn = chargeElement.querySelector('.view-invoice-btn');
        viewInvoiceBtn.addEventListener('click', function() {
            const invoiceUrl = this.getAttribute('data-url');
            openInvoicePopup(invoiceUrl);
        });
    });
}



// Função para abrir a fatura em uma nova guia
function openInvoicePopup(invoiceUrl) {
    // Abre a fatura em uma nova guia
    window.open(invoiceUrl, '_blank');
}


// Função para enviar requisição ao clicar em "Ver Cobranças"
document.getElementById('view-charges-btn').addEventListener('click', async function() {
    const assinaturaId = window.user.assinatura; // Pega o ID da assinatura armazenado no objeto `window.user`
    
    if (!assinaturaId) {
        alert('Assinatura não encontrada.');
        return;
    }

    const payload = {
        assinaturaId: assinaturaId,
    };

    try {
        const response = await fetch('https://n8n.zapnerd.cloud/webhook/027c46d3-cb07-40bd-bdff-e8acc85eeb9d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Dados de cobrança:', data);

        // Renderiza as cobranças no dashboard
        displayCharges(data?.data || []);
    } catch (error) {
        console.error('Erro ao buscar cobranças:', error);
        alert('Erro ao buscar cobranças.');
    }
});




function copyText(elementId) {
    const copyText = document.getElementById(elementId);
    copyText.select();
    copyText.setSelectionRange(0, 99999); // Para dispositivos móveis

    document.execCommand("copy");
    alert("Texto copiado: " + copyText.value);
}

// Atualiza o valor do campo com o ID da assinatura quando disponível
function waitForUserAndUpdateToken() {
    const tokenInput = document.getElementById('print-token');
    
    const intervalId = setInterval(() => {
        const assinaturaId = window.user?.assinatura; // Obtém o ID da assinatura
        
        if (assinaturaId) {
            tokenInput.value = assinaturaId; // Define o valor do input
            clearInterval(intervalId); // Para de verificar após encontrar o valor
        }
    }, 100); // Verifica a cada 100ms

    // Define um valor padrão até que o ID da assinatura seja carregado
    tokenInput.value = 'Carregando...';
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', waitForUserAndUpdateToken);

// Adiciona o evento de clique no botão de cancelar assinatura
document.getElementById('cancel-subscription-btn').addEventListener('click', async function () {
    // Exibe o popup de confirmação
    const userConfirmation = confirm('Você tem certeza que deseja cancelar a assinatura?');

    if (userConfirmation) {
        const assinaturaId = window.user?.assinatura;
        const clientId = window.user?.customer_assas_id;

        if (!assinaturaId || !clientId) {
            alert('Não foi possível encontrar os dados da assinatura ou do cliente.');
            return;
        }

        const payload = {
            assinaturaId,
            clientId,
        };

        try {
            const response = await fetch(
                'https://n8n.zapnerd.cloud/webhook/canselassinatura/assas',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                alert('Assinatura cancelada com sucesso!');
            } else {
                alert('Falha ao cancelar a assinatura. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao cancelar a assinatura:', error);
            alert('Erro ao cancelar a assinatura. Tente novamente.');
        } finally {
            // Recarrega a página após a conclusão
            location.reload();
        }
    }
});



