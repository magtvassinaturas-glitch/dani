// ==============================================================================
// Webhook Fulfillment para Dialogflow (Node.js) com dialogflow-fulfillment
// ==============================================================================

const { WebhookClient, Payload } = require('dialogflow-fulfillment');

// Lista de Frases da Dani (Global e acessível a todos os handlers)
const frasesDani = [
    "Olá [Nome do Cliente]! Seja muito bem-vindo(a) à MAGTV! Meu nome é Dani. ", 
    "Olá [Nome do Cliente]! Que bom que você veio! 😊 Eu sou a Dani, da MAGTV. ", 
    "Olá [Nome do Cliente]! Eu sou a Dani, atendente da MAGTV. É um prazer falar com você! 😊 ",
    "Uau! Que bom que você veio [Nome do Cliente]! Eu sou a Dani, a sua assistente na MAGTV! Estou super animada para te ajudar hoje! ",
    "Ah, que ótimo te ver por aqui [Nome do Cliente]! Pode contar comigo, a Dani! Meu objetivo é deixar tudo mais fácil para você na MAGTV. ",
    "Seja muito, muito bem-vindo(a) [Nome do Cliente]! Você está falando com a Dani, e eu cuido de tudo por aqui na MAGTV com o maior prazer! ",
    "Olá [Nome do Cliente]! É a Dani quem está te atendendo na MAGTV! É um prazer! "
];

// O Handler Principal que o Cloud Function/Express usa
exports.dialogflowFirebaseFulfillment = (request, response) => {
    const agent = new WebhookClient({ request, response });

    // ==========================================================================
    // Função de Tratamento (Handler) para as Intents de Saudação
    // ==========================================================================
    function handleSaudacao(agent) {
        
        // 1. Extrai o nome do parâmetro 'nomeuser'
        const nomeCliente = agent.parameters.nomeuser;
        
        // ** (Não precisamos verificar a Intent, pois esta função só é mapeada para elas) **

        if (nomeCliente) {
            // 2. Escolhe uma frase aleatória
            const indexAleatorio = Math.floor(Math.random() * frasesDani.length);
            let saudacao = frasesDani[indexAleatorio];

            // 3. Personaliza e formata o nome
            const nomeFormatado = nomeCliente.charAt(0).toUpperCase() + nomeCliente.slice(1).toLowerCase();
            saudacao = saudacao.replace('[Nome do Cliente]', nomeFormatado);
            
            // 4. O Menu Principal
            const menuPrincipal = `
Como posso te ajudar hoje? Por favor, escolha uma das opções abaixo:

1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte
            `;

            // 5. Usa .add() para enviar as mensagens. 
            // A biblioteca envia a primeira e a segunda mensagem sequencialmente, 
            // criando o efeito de "delay" entre elas.
            agent.add(saudacao);
            agent.add(menuPrincipal);
            
        } else {
            // Fallback caso a Intent seja acionada sem o nome (não deve ocorrer se o parâmetro for obrigatório)
            agent.add("Parece que não consegui capturar seu nome. Por favor, me diga seu nome para eu poder te ajudar.");
        }
    }

    // ==========================================================================
    // Mapeamento (Dispatch) de Intents para as Funções
    // ==========================================================================
    let intentMap = new Map();
    
    // Mapeamento para as suas intents
    intentMap.set('Menu Principal - N1', handleSaudacao);
    intentMap.set('Menu Principal - N3 - select.number', handleSaudacao);
    
    // Você adicionaria outras intents aqui:
    // intentMap.set('SuaOutraIntent', suaOutraFuncaoDeTratamento);

    // Executa o mapeamento
    agent.handleRequest(intentMap);
};

// ==============================================================================
// * FIM DO CÓDIGO *
// ==============================================================================
