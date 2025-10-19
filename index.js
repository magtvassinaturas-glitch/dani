const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
app.use(bodyParser.json()); 

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "30,00"; 
const CODE_DOWNLOADER = "5977492"; 
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

    // Formata o nome (apenas a primeira letra maiúscula)
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
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (RESTANTE DO CÓDIGO)
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

// 2. TUTORIAL ROKU (CONTEÚDO RESTAURADO)
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

// 3. TUTORIAL ANDROID TV / TV BOX (CONTEÚDO RESTAURADO)
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


// 4. PERGUNTA DE DESAMBIGUAÇÃO (Marca Ambígüa)
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
    // === 1. LOG DETALHADO PARA O RENDER ===
    console.log("=================================================");
    console.log(`REQ. Intent Acionada: ${req.body.queryResult.intent.displayName}`);
    console.log("REQ. Contextos Ativos:", JSON.stringify(req.body.queryResult.outputContexts || req.body.queryResult.activeContexts || []));
    console.log("=================================================");
    
    const intentName = req.body.queryResult.intent.displayName;
    let response = {};
    let fulfillmentMessages = [];
    
    // --- LÓGICA DE RECUPERAÇÃO DE NOME (Foco em sessao_cliente) ---
    let userName = null;
    const contexts = req.body.queryResult.outputContexts || req.body.queryResult.activeContexts || [];
    
    // Tenta pegar o nome da Intent atual
    let nomeUserParam = req.body.queryResult.parameters['nomeuser'] || req.body.queryResult.parameters['person']; 
    
    // Tenta pegar do contexto 'sessao_cliente' (se o nome já foi capturado)
    const sessionContext = contexts.find(c => c.name.includes('/contexts/sessao_cliente'));
    
    if (sessionContext && sessionContext.parameters && sessionContext.parameters.nomeuser) {
        nomeUserParam = sessionContext.parameters.nomeuser;
    }

    if (nomeUserParam) {
        // **!!! CORREÇÃO CRÍTICA DO ERRO 500 E FORMATAÇÃO !!!**
        if (typeof nomeUserParam === 'object' && (nomeUserParam.name || nomeUserParam.displayName)) {
            userName = nomeUserParam.name || nomeUserParam.displayName; 
        } else if (typeof nomeUserParam === 'string' && nomeUserParam.length > 0) {
            userName = nomeUserParam;
        }

        if (userName) {
             const REJECTED_NAMES = ['madeira', 'teste', 'eu', 'sim', 'nao', 'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'suporte', 'pix'];
             const normalizedName = userName.toLowerCase().trim();
             if (REJECTED_NAMES.includes(normalizedName.split(' ')[0]) || normalizedName.length <= 2) {
                 userName = null; 
             } else {
                 // Formata o nome para uso na resposta (apenas a primeira palavra)
                 const firstName = userName.split(' ')[0];
                 userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
             }
        }
    }
    // ----------------------------------------------------------------


    // =================================================================
    // ***** LÓGICA DE SAUDAÇÃO INICIAL (Default Welcome Intent) *****
    // =================================================================
    if (intentName === "Default Welcome Intent") {
        
        if (userName) {
             // Se o nome foi capturado, envia a saudação personalizada e o menu.
            fulfillmentMessages = getPersonalizedMenu(userName);
            response.fulfillmentMessages = fulfillmentMessages;
            return res.json(response); 
        }
        
        // Lógica estática SE O NOME NÃO FOI CAPTURADO
        const greeting = getGreeting();
        response.fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.\n\nComo posso te ajudar hoje?\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte`;
        
    }


    // ----------------------------------------------------------------
    // 1. INTENÇÕES DO MENU PRINCIPAL (Tratamento das Opções)
    // ----------------------------------------------------------------
    if (intentName === "Menu Principal - N1") { 
        // Opção 1: Novo Cliente 
        
        const nomeParaSaudacao = userName ? userName : "Cliente"; 

        fulfillmentMessages = mapToFulfillmentMessages([
            `Que maravilha ${nomeParaSaudacao}! Fico muito feliz que você queira fazer parte da família MAGTV! 🤩`,
            `Deixa eu te contar um pouco sobre o nosso plano:`,
            `Plano Mensal: **R$ ${PLAN_VALUE}**`, 
            `Ele inclui:
- Mais de **2.000** canais abertos e fechados
- Mais de **20 mil** filmes e **14 mil** séries`,
            `Nosso serviço funciona perfeitamente em:
 * Smart TVs: Samsung, LG, Roku.
 * Dispositivos Android: Celulares, TV Box e Android TV.`,
            `⚠️ Importante: Por enquanto, não funcionamos em dispositivos iOS (iPhone/iPad).`,
            `Para te ajudar com a instalação, preciso de uma informação rapidinha:
Você vai usar o serviço em SMARTV, ANDROIDTV ou Celular, e qual a marca do seu dispositivo? Assim eu já te mando o tutorial certinho! 😉`
        ]);
        
        response.fulfillmentMessages = fulfillmentMessages;
        return res.json(response); 

    } else if (intentName === "Menu Principal - N2 - select.number") { 
        // Opção 2: Pagamento 
        fulfillmentMessages = mapToFulfillmentMessages([
            `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:
Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}
Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`
        ]);
        response.fulfillmentMessages = fulfillmentMessages;
        return res.json(response);

    } else if (intentName === "Menu Principal - N3 - select.number") { 
        // Opção 3: Suporte (HANDOVER/PAUSA)
        
        let responseText = `Certo. Aguarde um momento. Vou encaminhar seu atendimento para o suporte humano para te ajudar melhor.`;
        
        if (userName) {
            responseText = `Certo, ${userName}.
Aguarde um momento. Vou encaminhar seu atendimento para o suporte humano para te ajudar melhor.`;
        }
        
        response.fulfillmentText = responseText;
        
        // **!!! CHAVE DA PAUSA / HANDOVER !!!**
        // O Dialogflow precisa ter o contexto de saída 'atendimento_humano' com lifespan=1.
        // O Webhook reforça isso (e o Fallback no DF precisa ter lifespan=0 na Entrada).
        response.outputContexts = [{
            name: req.body.session + '/contexts/atendimento_humano',
            lifespanCount: 1, // Este é o comando de pausa!
            parameters: {}
        }];
        
        return res.json(response); 
        
    } else if (intentName === "Suporte - Nome Capturado") {
        // Se esta Intent for acionada, ela também é uma forma de Handover
        // (Apenas para garantir que todas as Intents de Suporte ativam o Handover)
        const responseText = `Certo. Vou encaminhar seu atendimento para o suporte humano.`;
        
        response.fulfillmentText = responseText;
        response.outputContexts = [{
            name: req.body.session + '/contexts/atendimento_humano',
            lifespanCount: 1, 
            parameters: {}
        }];
        return res.json(response);
    } 

    // ----------------------------------------------------------------
    // 2. FLUXO DE TUTORIAIS (Mantido para o futuro)
    // ----------------------------------------------------------------
    // ... (Mantenha o resto do código de TUTORIAL SMARTV, ROKU, ANDROIDTV, etc.)

    // ----------------------------------------------------------------
    // 3. INTENÇÕES PADRÃO (Fallback/Resto)
    // ----------------------------------------------------------------
    
    // O Default Fallback Intent é tratado pelo Dialogflow; o Webhook só responde se for acionado,
    // o que não deve acontecer se o Fallback estiver configurado corretamente com o lifespan=0.

    if (fulfillmentMessages.length > 0) {
        response.fulfillmentMessages = fulfillmentMessages;
    } 

    res.json(response);

  } catch (error) {
    // === 2. LOG DE ERRO ===
    console.error("ERRO CRÍTICO NA REQUISIÇÃO: ", error);
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
