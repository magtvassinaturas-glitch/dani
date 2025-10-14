const express = require('express');
const app = express();
app.use(express.json());

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const CODE_DOWNLOADER = "5977492"; // Seu código
const SITE_RUSH = "https://rush.ninja/";

// =================================================================
// LISTA DE FRASES DA DANI (PARA ALEATORIEDADE E PERSONALIZAÇÃO)
// =================================================================
const frasesDani = [
    "Olá [Nome do Cliente]! Seja muito bem-vindo(a) à MAGTV! Meu nome é Dani. ", 
    "Olá [Nome do Cliente]! Que bom que você veio! 😊 Eu sou a Dani, da MAGTV. ", 
    "Olá [Nome do Cliente]! Eu sou a Dani, atendente da MAGTV. É um prazer falar com você! 😊 ",
    "Uau! Que bom que você veio [Nome do Cliente]! Eu sou a Dani, a sua assistente na MAGTV! Estou super animada para te ajudar hoje! ",
    "Ah, que ótimo te ver por aqui [Nome do Cliente]! Pode contar comigo, a Dani! Meu objetivo é deixar tudo mais fácil para você na MAGTV. ",
    "Seja muito, muito bem-vindo(a) [Nome do Cliente]! Você está falando com a Dani, e eu cuido de tudo por aqui na MAGTV com o maior prazer! ",
    "Olá [Nome do Cliente]! É a Dani quem está te atendendo na MAGTV! É um prazer! "
];
// =================================================================

// Função para obter a saudação do dia
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
}

// Mapeia o array de texto para o formato de mensagens do Dialogflow
const mapToFulfillmentMessages = (messages) => {
    return messages.map(text => ({ text: { text: [text] } }));
};

// =================================================================
// FUNÇÃO PARA GERAR A SAUDAÇÃO PERSONALIZADA E O MENU COM DELAY
// =================================================================
const getPersonalizedMenu = (nomeCliente) => {
    
    const indexAleatorio = Math.floor(Math.random() * frasesDani.length);
    let saudacao = frasesDani[indexAleatorio];

    // Garante que apenas o primeiro nome seja formatado corretamente
    const nomeFormatado = nomeCliente.split(' ')[0].charAt(0).toUpperCase() + nomeCliente.split(' ')[0].slice(1).toLowerCase();
    saudacao = saudacao.replace('[Nome do Cliente]', nomeFormatado);
    
    const menuPrincipal = `
Como posso te ajudar hoje? Por favor, escolha uma das opções abaixo:

1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte
    `;

    return mapToFulfillmentMessages([saudacao, menuPrincipal]);
};

// =================================================================
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (Inalteradas)
// =================================================================

const getSmartTVInstallTutorial = () => {
    const messages = [
        "📺 Como instalar o XCloud TV na sua TV",
        "Passo a passo para TVs *Samsung e LG*.",
        "Envie a palavra **TESTE** para enviarmos o seu acesso!"
    ];
    return mapToFulfillmentMessages(messages);
};

const getRokuInstallTutorial = () => {
    const messages = [
        "📺 Como instalar o XCloud TV na sua TV",
        "Passo a passo para *Sistema Roku TV*:",
        "Por fim, envie a palavra **TESTE** para enviarmos o seu login e senha!"
    ];
    return mapToFulfillmentMessages(messages);
};

const getAndroidTVInstallTutorial = () => {
    const messages = [
        "📺 Tutorial para Android TV (TV Box)",
        "No campo para digitar, coloque o código: **" + CODE_DOWNLOADER + "** e clique em Go.",
        "Envie a palavra **TESTE** para enviarmos o seu acesso!"
    ];
    return mapToFulfillmentMessages(messages);
};

const getAmbiguousBrandQuestion = (marca) => {
    const messages = [
        `Certo, ${marca}! É uma marca excelente. 😉`,
        `Me diz uma coisa: a tela inicial dela tem a loja de apps da Google ou o menu tem a opção 'Canais de Streaming'?`
    ];
    return mapToFulfillmentMessages(messages);
};


// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const queryText = req.body.queryResult.queryText;
    let response = {};
    let fulfillmentMessages = [];

    // Tenta capturar o nome do cliente usando o parâmetro 'nomeuser'
    const nomeUserParam = req.body.queryResult.parameters['nomeuser']; 
    let userName = null;

    if (nomeUserParam) {
        if (typeof nomeUserParam === 'string' && nomeUserParam.length > 0) {
            userName = nomeUserParam;
        // ***** Extração reforçada para o formato { "name": "Davi" } E o formato { "displayName": "Davi" } *****
        } else if (typeof nomeUserParam === 'object') {
            if (nomeUserParam.name) {
                userName = nomeUserParam.name;
            } else if (nomeUserParam.displayName) {
                userName = nomeUserParam.displayName;
            }
        }
    }
    
    // =================================================================
    // ***** LÓGICA DE SAUDAÇÃO INICIAL (Default Welcome Intent) *****
    // =================================================================
    if (intentName === "Default Welcome Intent") {
        
        if (userName) {
             // Se o nome foi capturado, envia a saudação personalizada e o menu.
            fulfillmentMessages = getPersonalizedMenu(userName);
            response.fulfillmentMessages = fulfillmentMessages;
            // Retorna imediatamente. Se isso não funcionar, o problema é puramente no DXP.
            return res.json(response); 
        }
        
        // Lógica estática SE O NOME NÃO FOI CAPTURADO (primeira vez que o bot fala)
        const greeting = getGreeting();
        response.fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.\n\nComo posso te ajudar hoje?\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte`;
        
    }


    // ----------------------------------------------------------------
    // 1. INTENÇÕES DO MENU PRINCIPAL (TRATAMENTO DE NOME E FLUXO)
    // ----------------------------------------------------------------
    if (intentName === "Menu Principal - N1") { 
        // Opção 1: Novo Cliente 
        
        // Se o nome está na requisição (veio via contexto), usa o nome na resposta
        if (userName) {
            
            const firstName = userName.split(' ')[0];
            const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            
            fulfillmentMessages = mapToFulfillmentMessages([
                `Que maravilha ${formattedFirstName}! Fico muito feliz que você queira fazer parte da família MAGTV! 🤩`,
                `Deixa eu te contar um pouco sobre o nosso plano:`,
                `Plano Mensal: **R$ ${PLAN_VALUE}**`, 
                `Ele inclui:
- Mais de **2.000** canais abertos e fechados
- Mais de **20 mil** filmes
- Mais de **14 mil** séries e novelas
- Animes e desenhos para toda a família! É conteúdo que não acaba mais! 🥳`,
                `Nosso serviço funciona perfeitamente em:
 * Smart TVs: Samsung, LG, Roku (usando a tecnologia IPTV).
 * Dispositivos Android: Celulares, TV Box e Android TV (com nosso app exclusivo).`,
                `⚠️ Importante: Por enquanto, não funcionamos em dispositivos iOS (iPhone/iPad).`,
                `Para te ajudar com a instalação, preciso de uma informação rapidinha:
Você vai usar o serviço em SMARTV, ANDROIDTV ou Celular, e qual a marca do seu dispositivo? Assim eu já te mando o tutorial certinho! 😉`
            ]);
            
            response.fulfillmentMessages = fulfillmentMessages;
            return res.json(response); 

        } 
        
        // Lógica genérica se não há nome
        fulfillmentMessages = mapToFulfillmentMessages([
            `Ótimo!`,
            `Então, nosso plano de assinatura é o **Mensal**, e custa apenas **R$ 30,00**.`,
            `Ele inclui:
- Mais de **2.000** canais abertos e fechados
- Mais de **20 mil** filmes
- Mais de **14 mil** séries e novelas
- Animes e desenhos`,
            `Você pode usar em **Smart TVs Samsung, LG, Roku** (via IPTV) e em dispositivos **Android** (celulares, TV Box, Android TV) através do nosso app exclusivo.`,
            `⚠️ Importante: **não funciona em iOS** (iPhone/iPad).`,
            `Você tem direito a 3 horas de teste grátis. Vamos começar?`
        ]);
        
        
    } else if (intentName === "Menu Principal - N2 - select.number") { 
        // Opção 2: Pagamento 
        fulfillmentMessages = mapToFulfillmentMessages([
            `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:
Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}
Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`
        ]);

    } else if (intentName === "Menu Principal - N3 - select.number") { 
        // Opção 3: Suporte 
        
        // Se o nome foi capturado, usa a saudação personalizada e o menu (caso o fluxo volte aqui)
        if (userName) {
            fulfillmentMessages = getPersonalizedMenu(userName);
            response.fulfillmentMessages = fulfillmentMessages;
            return res.json(response); 
        } 
        
    } else if (intentName === "Suporte - Nome Capturado") { 
        
        let responseText = `Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        
        if (userName) {
            const firstName = userName.split(' ')[0];
            const formattedFirstName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
            
            responseText = `Certo, ${formattedFirstName}.
Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        }
        
        response.fulfillmentText = responseText;
        
    } else if (intentName === "TESTE") {
        response.fulfillmentText = `Aguarde um momento...`;

    // ----------------------------------------------------------------
    // 2. FLUXO DE TUTORIAIS
    // ----------------------------------------------------------------

    } else if (intentName === "TUTORIAL SMARTV") {
        fulfillmentMessages = getSmartTVInstallTutorial();

    } else if (intentName === "TUTORIAL ROKU") {
        fulfillmentMessages = getRokuInstallTutorial();

    } else if (intentName === "TUTORIAL ANDROIDTV") { 
        fulfillmentMessages = getAndroidTVInstallTutorial();

    } else if (intentName === "Sistemas de Confirmação") { 
        
        const lowerQuery = req.body.queryResult.queryText.toLowerCase();

        if (lowerQuery.includes('android') || lowerQuery.includes('google') || lowerQuery.includes('playstore') || lowerQuery.includes('triângulo') || lowerQuery.includes('apps google')) {
             fulfillmentMessages = getAndroidTVInstallTutorial(); 
        
        } else if (lowerQuery.includes('roku') || lowerQuery.includes('streaming') || lowerQuery.includes('roxo') || lowerQuery.includes('canais')) {
             fulfillmentMessages = getRokuInstallTutorial();
             
        } else {
             response.fulfillmentText = "Não consegui identificar o sistema. Me diga apenas uma palavra: 'Android' ou 'Roku'?";
        }


    // ----------------------------------------------------------------
    // 3. INTENÇÕES PADRÃO (Fallback/Resto)
    // ----------------------------------------------------------------
    } else if (intentName === "Default Fallback Intent") {
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
        
    } else {
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
    }

    // Lógica final de retorno: prioriza fulfillmentMessages (com delay)
    if (fulfillmentMessages.length > 0) {
        response.fulfillmentMessages = fulfillmentMessages;
    } 

    res.json(response);

  } catch (error) {
    console.error("Erro na requisição: ", error);
    res.status(500).json({
      "fulfillmentText": `Ocorreu um erro na integração. Por favor, tente novamente.`
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('O bot está online e funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
