const express = require('express');
// Foi removido: const app = express(); app.use(express.json());
// Substituído por:
const bodyParser = require('body-parser'); 
const app = express();
app.use(bodyParser.json());

// 2. Configuração Inicial do Servidor
const PORT = process.env.PORT || 3000; 

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

    // Garante que apenas o primeiro nome seja formatado e usado
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
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (Recuperadas e Completas)
// =================================================================

// 1. TUTORIAL SMART TV (SAMSUNG / LG)
const getSmartTVInstallTutorial = () => {
    const messages = [
        "📺 Como instalar o XCloud TV na sua TV",
        "Siga as instruções abaixo para a marca da sua TV e comece a assistir.",
        "Passo a passo para TVs *Samsung e LG*.",
        "1. Aperte o botão Home no controle remoto para abrir a tela principal.",
        "2. Navegue até a loja de aplicativos (geralmente identificada por um ícone de sacola de compras ou uma lupa de busca).",
        "3. Use o campo de pesquisa e digite *\"XCloud TV\"*.",
        "4. Selecione o aplicativo e clique em *Instalar* (ou Baixar). Quando a instalação estiver concluída, clique em *Abrir*.",
        "5. Agora é só inserir seu login e senha para acessar todo o conteúdo.",
        "Envie a palavra **TESTE** para enviarmos o seu acesso!"
    ];
    return mapToFulfillmentMessages(messages);
};

// 2. TUTORIAL ROKU
const getRokuInstallTutorial = () => {
    const messages = [
        "📺 Como instalar o XCloud TV na sua TV",
        "Passo a passo para *Sistema Roku TV*:",
        "1. Aperte o botão Home no controle remoto 🎚",
        "2. Vá até *Canais de Streaming* na tela principal.",
        "3. Selecione a opção *Procurar Canais*.",
        "4. No campo de busca, digite *\"XCloud TV\"*.",
        "5. Selecione o aplicativo e clique em *Adicionar Canal*.",
        "6. Aguarde a instalação e clique em *Ir para o canal*.",
        "Por fim, envie a palavra **TESTE** para enviarmos o seu login e senha!"
    ];
    return mapToFulfillmentMessages(messages);
};

// 3. TUTORIAL ANDROID TV / TV BOX
const getAndroidTVInstallTutorial = () => {
    const messages = [
        "📺 Tutorial para Android TV (TV Box)",
        "1. Como Instalar o Aplicativo Rush One.",
        "2. Na sua Android TV, acesse a *Play Store*.",
        "3. Se for Google TV, a Play Store fica nas configurações na aba de apps!",
        "4. Após abrir o Play Store, procure pelo aplicativo chamado *\"Downloader\"* e clique em *Instalar*.",
        "5. Abra o aplicativo Downloader.",
        "6. No campo para digitar, coloque o código: **" + CODE_DOWNLOADER + "** e clique em Go.",
        "7. Se o aplicativo pedir, dê a permissão para o Downloader poder instalar o aplicativo.",
        "* Aguarde a instalação ser concluída.",
        "Envie a palavra **TESTE** para enviarmos o seu acesso!"
    ];
    return mapToFulfillmentMessages(messages);
};


// 4. PERGUNTA DE DESAMBIGUAÇÃO (Marca Ambígua)
const getAmbiguousBrandQuestion = (marca) => {
    const messages = [
        `Certo, ${marca}! É uma marca excelente. 😉`,
        `As TVs da ${marca} podem ter o sistema **Android TV** (ou Google TV) ou o sistema **Roku TV**.`,
        `Para eu te ajudar com o tutorial exato, preciso saber qual o sistema da sua TV.`,
        `Me diz uma coisa: a tela inicial dela tem a loja de apps da Google (o símbolo de um triângulo colorido do Play Store) ou o menu tem a opção 'Canais de Streaming' (com a logo do Roku)?`
    ];
    return mapToFulfillmentMessages(messages);
};


// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    
    let response = {};
    let fulfillmentMessages = [];

    // --- LÓGICA DE RECUPERAÇÃO DE NOME SALVO (GLOBAL) ---
    let userName = null;
    const contexts = req.body.queryResult.outputContexts || req.body.queryResult.activeContexts || [];
    
    // Procura o contexto 'sessao_cliente'
    const sessionContext = contexts.find(c => c.name.includes('/contexts/sessao_cliente'));
    
    // Prioriza o nome salvo no contexto ('person' ou 'nomeuser')
    if (sessionContext && sessionContext.parameters) {
        if (sessionContext.parameters.person) {
            userName = sessionContext.parameters.person;
        } else if (sessionContext.parameters.nomeuser) {
            userName = sessionContext.parameters.nomeuser;
        }
    }

    // Se não achou no contexto, tenta pegar da INTENT atual
    if (!userName) {
        const nomeUserParam = req.body.queryResult.parameters['nomeuser'] || req.body.queryResult.parameters['person']; 
        if (nomeUserParam && typeof nomeUserParam === 'string' && nomeUserParam.length > 0) {
            userName = nomeUserParam;
        }
    }
    // ----------------------------------------------------


    // =================================================================
    // ***** LÓGICA DE INTENTS (Estrutura ajustada com else if) *****
    // Isso resolve o problema de conflito no fluxo e o erro 500.
    // =================================================================
    if (intentName === "Default Welcome Intent") {
        
        if (userName) {
            fulfillmentMessages = getPersonalizedMenu(userName);
            response.fulfillmentMessages = fulfillmentMessages;
        } else {
            const greeting = getGreeting();
            response.fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.\n\nComo posso te ajudar hoje?\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte`;
        }

    } else if (intentName === "Menu Principal - N1") { 
        // Opção 1: Novo Cliente 
        
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
            
        } else { 
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
        }
        
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
        // ***** OPÇÃO 3: SUPORTE (LÓGICA DE PULAR PERGUNTA) *****
        
        if (userName) {
            // NOME SALVO: Pula a pergunta.
            const firstName = userName.split(' ')[0];
            const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            
            response.fulfillmentText = `Certo, ${formattedFirstName}. Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
            
        } else { 
            // NOME NÃO SALVO: Deixa o Slot Filling da Intent N3 funcionar.
        } 
        
    } else if (intentName === "Suporte - Nome Capturado") { 
        // Plano B: Nome recém-capturado.
        
        let responseText = `Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        
        if (userName) { 
            const firstName = userName.split(' ')[0];
            const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            
            responseText = `Certo, ${formattedFirstName}.
Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        }
        
        response.fulfillmentText = responseText;
        
    } else if (intentName === "TESTE") {
        response.fulfillmentText = `Aguarde um momento...`;

    } else if (intentName === "TUTORIAL SMARTV") {
        fulfillmentMessages = getSmartTVInstallTutorial();

    } else if (intentName === "TUTORIAL ROKU") {
        fulfillmentMessages = getRokuInstallTutorial();

    } else if (intentName === "TUTORIAL ANDROIDTV") { 
        fulfillmentMessages = getAndroidTVInstallTutorial();

    } else if (intentName === "Sistemas de Confirmação") { 
        // Lógica de desambiguação
        const lowerQuery = req.body.queryResult.queryText.toLowerCase();

        if (lowerQuery.includes('android') || lowerQuery.includes('google') || lowerQuery.includes('playstore') || lowerQuery.includes('triângulo') || lowerQuery.includes('apps google')) {
             fulfillmentMessages = getAndroidTVInstallTutorial(); 
        
        } else if (lowerQuery.includes('roku') || lowerQuery.includes('streaming') || lowerQuery.includes('roxo') || lowerQuery.includes('canais')) {
             fulfillmentMessages = getRokuInstallTutorial();
             
        } else {
             response.fulfillmentText = "Não consegui identificar o sistema. Me diga apenas uma palavra: 'Android' ou 'Roku'?";
        }

    } else if (intentName === "Default Fallback Intent") {
        // Fallback
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
        
    } else {
         // Último Catch-all
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
    }

    // Lógica final de retorno
    if (fulfillmentMessages.length > 0) {
        response.fulfillmentMessages = fulfillmentMessages;
    } 

    res.json(response);

  } catch (error) {
    console.error("Erro na requisição (Final): ", error);
    res.status(500).json({
      "fulfillmentText": `Ocorreu um erro na integração. Por favor, tente novamente.`
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('O bot está online e funcionando!');
});

// Inicializa o servidor usando a constante PORT definida no início.
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
