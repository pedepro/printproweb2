// Função para assinar o plano Start
function subscribe(plan) {
    if (plan === 'start') {
        // Mensagem de confirmação
        alert('Você será redirecionado para a página de formulário para completar sua assinatura do plano Start.');

        // Navegação para a pasta "formulario"
        window.location.href = '../formulario/';
    }
}


// Função para contato com a equipe de vendas no plano My Software
function contactSales() {
    const phoneNumber = '5549920009371'; // Número de telefone no formato internacional
    const message = 'Olá, quero assinar o plano My Software Personalizado PrintPro'; // Mensagem para enviar

    // URL para redirecionar ao WhatsApp
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Redirecionar o usuário para o WhatsApp
    window.location.href = whatsappURL;
}


document.getElementById('register-link').addEventListener('click', function() {
    // Redirecionar para a pasta formulário
    window.location.href = '../login';
});