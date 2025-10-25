import express from 'express';
import bodyParser from 'body-parser';
// import { fileURLToPath } from 'url'; // Não é necessário para este script simples

const app = express();
app.use(bodyParser.json()); 

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const CODE_DOWNLOADER = "6519181"; // Seu código
const SITE_RUSH = "https://rush.ninja/";

// =================================================================
// LISTA DE FRASES DA DANI (MENU INICIAL)
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
// LISTA DE VARIAÇÕES PARA O PITCH DE VENDAS (MENU PRINCIPAL - N1)
// =================================================================
const vendasDani = [
    // Variação 1
    (formattedFirstName, PLAN_VALUE) => [
        `Que maravilha, ${formattedFirstName}! Fico muito feliz que você queira fazer parte da família MAGTV! 🥳`,
        `Deixa eu te contar um pouco sobre o nosso plano: O **Mensal** custa apenas **R$ ${PLAN_VALUE}**.`,
        `Ele inclui acesso a mais de **2.000 canais**, **20 mil filmes**, **16 mil séries** e desenhos para toda a família! É conteúdo que não acaba mais! 🚀`,
        `Compatibilidade: Funciona perfeitamente em Smart TVs (Samsung, LG, Roku via IPTV) e dispositivos Android (Celulares, TV Box, Android TV) com nosso app exclusivo.`,
        `⚠️ Importante: *Não funciona em iOS* (iPhone/iPad).`,
        `Para te ajudar com a instalação, preciso de uma informação rapidinha: Você vai usar o serviço em SMARTV, ANDROIDTV ou Celular, e qual a marca do seu dispositivo, ${formattedFirstName}? Assim eu já te mando o tutorial certinho! 😉`
    ],
    // Variação 2
    (formattedFirstName, PLAN_VALUE) => [
        `Uau! Ótima escolha, ${formattedFirstName}! É um prazer ter você!`,
        `Nosso plano de assinatura é o **Mensal**, por um valor fixo de **R$ ${PLAN_VALUE}** (sem surpresas!).`,
        `O que você leva? Um catálogo completo com mais de **2.000 canais**, além de **20.000 filmes** e **16.000 séries** atualizadas semanalmente.`,
        `Onde você pode usar? Em qualquer Smart TV compatível (Samsung, LG, Roku) e todos os Androids (TV Box, Celular) usando a tecnologia P2P do nosso app.`,
        `🛑 Aviso: O serviço **não é compatível com aparelhos iOS** (iPhone/iPad).`,
        `Pronto para o teste? Antes, preciso saber: Qual a marca do seu dispositivo, ${formattedFirstName}? Assim já te envio o tutorial exato! 📺`
    ],
    // Variação 3
    (formattedFirstName, PLAN_VALUE) => [
        `Seja muito bem-vindo(a), ${formattedFirstName}! Você acaba de tomar a melhor decisão! 😎`,
        `Nosso plano é super simples: **Mensal** e acessível, apenas **R$ ${PLAN_VALUE}**.`,
        `Com esse valor, você libera um universo de mais de **2.000 canais** e milhares de filmes/séries (**20 mil** filmes e **16 mil** séries!).`,
        `A instalação é fácil na sua Smart TV (LG/Samsung/Roku) e em qualquer dispositivo Android (TV Box, Google TV, Celular) com nosso app.`,
        `Lembrete: **iOS está fora**! Não funciona em iPhone ou iPad.`,
        `Para começar seu teste, me diga: Qual a marca do seu dispositivo, ${formattedFirstName}? Vou te mandar o tutorial completo! 😉`
    ],
    // Variação 4
    (formattedFirstName, PLAN_VALUE) => [
        `Que alegria te atender, ${formattedFirstName}! Bem-vindo(a) à MAGTV!`,
        `O nosso **Plano Mensal** é o mais vendido, custando somente **R$ ${PLAN_VALUE}**.`,
        `Conteúdo de sobra! São mais de **2.000 canais** + todo o acervo de streaming (filmes, séries, animes) que ultrapassa as **36 mil** opções.`,
        `Onde assistir? Em Smart TVs (via IPTV) ou no seu Android (Celular/Box) com o app exclusivo.`,
        `🚫 Atenção: O sistema **não roda em iOS** (iPhone/iPad).`,
        `Vamos testar por 3 horas? Me informa a marca e o tipo do seu dispositivo (Smart TV, Android TV, Celular), ${formattedFirstName}? Te envio o guia na hora! 🥳`
    ],
    // Variação 5
    (formattedFirstName, PLAN_VALUE) => [
        `Fantástico, ${formattedFirstName}! Que bom ter você na nossa família Magtv!`,
        `Plano **Mensal** por apenas **R$ ${PLAN_VALUE}**. Valor único e sem fidelidade.`,
        `Você terá acesso total a mais de **2.000 canais**, **20 mil filmes** e **16 mil séries**! O tédio vai acabar!`,
        `Compatível com TVs Samsung, LG, Roku e todo o ecossistema Android (TV Box, Celular).`,
        `⚠️ Recado rápido: Usuários de **iOS (iPhone/iPad) não são suportados**.`,
        `Para liberarmos seu teste, me diga, ${formattedFirstName}: Qual a marca e o modelo do dispositivo onde você vai instalar? Assim acerto no tutorial! 📺`
    ],
    // Variação 6
    (formattedFirstName, PLAN_VALUE) => [
        `Olá, ${formattedFirstName}! Sua escolha foi perfeita!`,
        `O plano que você busca é o **Mensal**, e ele custa apenas **R$ ${PLAN_VALUE}**.`,
        `A experiência é completa: São mais de **2.000 canais** e um catálogo atualizado com mais de **36 mil** títulos entre séries, filmes e desenhos!`,
        `Funciona em todas as Smart TVs (via IPTV) e dispositivos Android (com o nosso aplicativo P2P).`,
        `Não se esqueça: **Não há compatibilidade com iOS**.`,
        `Me diga a marca do seu dispositivo, ${formattedFirstName}? Assim eu te ajudo a instalar o quanto antes! 😉`
    ],
    // Variação 7
    (formattedFirstName, PLAN_VALUE) => [
        `Que ótimo, ${formattedFirstName}! Vamos começar a sua experiência MAGTV!`,
        `Nosso plano é o **Mensal**, e o investimento é de só **R$ ${PLAN_VALUE}**.`,
        `Pelo valor, você ganha acesso ilimitado a **2.000 canais** e ao acervo VOD (Vídeo On Demand) com **20 mil filmes** e **16 mil séries**.`,
        `O serviço é perfeito para Smart TVs (LG, Samsung) e qualquer ANDROIDTV, TV Box ou celular Android.`,
        `🚫 Por favor, note: O serviço **não suporta iOS** (iPhone/iPad).`,
        `Para começar seu teste de 3 horas, ${formattedFirstName}, me informe qual a marca da sua TV ou dispositivo que você vai usar. É rapidinho! 🥳`
    ],
    // Variação 8
    (formattedFirstName, PLAN_VALUE) => [
        `Boas-vindas, ${formattedFirstName}! Fico muito feliz que você nos escolheu!`,
        `O nosso plano **Mensal** tem um valor super atrativo: **R$ ${PLAN_VALUE}**.`,
        `Com isso, você tem a sua disposição mais de **2.000 canais** e um vasto catálogo de **20.000 filmes** e **16.000 séries** para maratonar!`,
        `Compatibilidade garantida em Smart TVs, TV Box e dispositivos Android.`,
        `⚠️ Alerta: **Não suportamos iOS** (iPhone/iPad).`,
        `Vamos liberar as 3 horas de teste? Qual a marca e o tipo do seu dispositivo, ${formattedFirstName}? Preciso dessa info para te dar o tutorial certo! 📺`
    ]
];
// =================================================================


// Função para obter a saudação do dia (BOM DIA / BOA TARDE / BOA NOITE)
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

// Mapeia o array de texto para o formato de mensagens do Dialogflow (para enviar sequencialmente)
const mapToFulfillmentMessages = (messages) => {
    return messages.map(text => ({ text: { text: [text] } }));
};

// =================================================================
// FUNÇÃO PARA GERAR A SAUDAÇÃO PERSONALIZADA E O MENU (USANDO VARIAÇÕES)
// =================================================================
const getPersonalizedMenu = (nomeCliente) => {
    
    // **USANDO VARIAÇÕES DE FRASES AQUI (frasesDani)**
    const indexAleatorio = Math.floor(Math.random() * frasesDani.length);
    let saudacao = frasesDani[indexAleatorio];

    const nomeFormatado = nomeCliente.split(' ')[0].charAt(0).toUpperCase() + nomeCliente.split(' ')[0].slice(1).toLowerCase();
    saudacao = saudacao.replace('[Nome do Cliente]', nomeFormatado);
    
    const menuPrincipal = `
Como posso te ajudar hoje? Por favor, escolha uma das opções abaixo:

1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte
    `;

    // **SAÍDA SEQUENCIAL**
    return mapToFulfillmentMessages([saudacao, menuPrincipal]);
};

// =================================================================
// FUNÇÃO PARA GERAR O PITCH DE VENDAS ALEATÓRIO (USANDO VARIAÇÕES)
// =================================================================
const getVendasPitch = (nomeCliente, PLAN_VALUE) => {
    
    const firstName = nomeCliente.split(' ')[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // **USANDO VARIAÇÕES DE PITCH AQUI (vendasDani)**
    const indexAleatorio = Math.floor(Math.random() * vendasDani.length);
    const pitchFunction = vendasDani[indexAleatorio];

    const pitchMessages = pitchFunction(formattedFirstName, PLAN_VALUE);
    
    // **SAÍDA SEQUENCIAL**
    return mapToFulfillmentMessages(pitchMessages);
};
// =================================================================
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (MANTIDAS)
// =================================================================
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

const getAndroidTVInstallTutorial = () => {
    const messages = [
        "📺 Tutorial para Android TV (TV Box)",
        "1. Como Instalar o Aplicativo P2P Rush Original.",
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

const getAndroidCelularInstallTutorial = () => {
    const messages = [
        "📱 Tutorial para Celular Android",
        "Como Instalar o Aplicativo P2P Rush Original", 
        "* Abra o navegador Google Chrome no seu celular.",
        `* Na barra de endereço, digite o seguinte site: ${SITE_RUSH}`,
        "* Na página que abrir, encontre o aplicativo com o nome P2P Rush Original.", 
        "* Clique no botão Baixar e aguarde o download.",
        "* Quando o download terminar, clique no arquivo baixado para instalar o aplicativo. Se for a primeira vez, pode ser que o celular peça permissão para instalar de fontes desconhecidas; basta aceitar.",
        "Aguarde um momento para criar seu Acesso!"
    ];
    return mapToFulfillmentMessages(messages);
};

// FUNÇÃO ROBUSTA DE EXTRAÇÃO DE NOME
function extractUserName(req) {
    // 1. Tenta extrair do parâmetro 'nomeuser'
    const nomeUserParam = req.body.queryResult.parameters && req.body.queryResult.parameters['nomeuser'];
    if (nomeUserParam) {
        if (typeof nomeUserParam === 'string' && nomeUserParam.length > 0) return nomeUserParam;
        if (typeof nomeUserParam === 'object' && nomeUserParam.name) return nomeUserParam.name;
    }
    
    // 2. Tenta extrair do contexto
    if (req.body.queryResult.outputContexts) {
        for (const context of req.body.queryResult.outputContexts) {
            if (context.parameters && context.parameters.nomeuser) {
                const contextNomeUser = context.parameters.nomeuser;
                if (typeof contextNomeUser === 'string' && contextNomeUser.length > 0) return contextNomeUser;
                if (typeof contextNomeUser === 'object' && contextNomeUser.name) return contextNomeUser.name;
            }
        }
    }
    return null;
}


// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    let response = {};
    let fulfillmentMessages = [];

    const userName = extractUserName(req);
    
    // =================================================================
    // ***** LÓGICA DE INTENTS *****
    // =================================================================
    
    if (intentName === "Default Welcome Intent") {
        
        if (userName) {
             // Nome capturado (via contexto): Envia a saudação personalizada e o menu (SEQUENCIAL + VARIAÇÃO)
            fulfillmentMessages = getPersonalizedMenu(userName);
        } else {
            // Nome NÃO capturado: Envia a saudação com cumprimento e pede o nome (SEQUENCIAL)
            const greeting = getGreeting();
            fulfillmentMessages = mapToFulfillmentMessages([
                `Olá! 👋 ${greeting}!`,
                `Recebemos sua mensagem! Antes de prosseguir, me conta rapidinho: qual é o seu nome? 😊`
            ]);
        }
        
    }
    
    else if (intentName === "CAPTURA DE NOME") { 
        
        let nomeParaSaudacao = userName || "Cliente"; 
        
        // Nome capturado: Envia a saudação personalizada e o menu (SEQUENCIAL + VARIAÇÃO)
        fulfillmentMessages = getPersonalizedMenu(nomeParaSaudacao);
        
    }


    // ----------------------------------------------------------------
    // 1. INTENÇÕES DO MENU PRINCIPAL (TODAS USAM SEQUENCIAL)
    // ----------------------------------------------------------------
    else if (intentName === "Menu Principal - N1") { 
        
        let nomeParaPitch = userName || "Cliente"; 
        
        // Sempre usa a variação de pitch aleatória (SEQUENCIAL + VARIAÇÃO)
        fulfillmentMessages = getVendasPitch(nomeParaPitch, PLAN_VALUE);
        
    } else if (intentName === "Menu Principal - N2 - select.number") { 
        
        // Opção 2: Pagamento (SEQUENCIAL)
        fulfillmentMessages = mapToFulfillmentMessages([
            `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:
Chave PIX: ${PIX_KEY}`,
            `Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}`,
            `Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`
        ]);

    } else if (intentName === "Menu Principal - N3 - select.number" || intentName === "Suporte - Nome Capturado") { 
        
        const formattedFirstName = userName ? userName.split(' ')[0].charAt(0).toUpperCase() + userName.split(' ')[0].slice(1).toLowerCase() : "Cliente";
        
        response.fulfillmentText = `Certo, ${formattedFirstName}. Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        
    } else if (intentName === "TESTE") {
        response.fulfillmentText = `Aguarde um momento...`;

    // ----------------------------------------------------------------
    // 2. FLUXO DE TUTORIAIS (TODAS USAM SEQUENCIAL)
    // ----------------------------------------------------------------
    } else if (intentName === "TUTORIAL SMARTV") {
        fulfillmentMessages = getSmartTVInstallTutorial();

    } else if (intentName === "TUTORIAL ROKU") {
        fulfillmentMessages = getRokuInstallTutorial();

    } else if (intentName === "TUTORIAL ANDROIDTV" || intentName === "TUTORIAL CELULAR") { 
        if (req.body.queryResult.intent.displayName === "TUTORIAL CELULAR") {
             fulfillmentMessages = getAndroidCelularInstallTutorial();
        } else {
             fulfillmentMessages = getAndroidTVInstallTutorial();
        }
       

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
        // Fallback (SEQUENCIAL)
        fulfillmentMessages = mapToFulfillmentMessages([
            `Desculpe, não entendi.`,
            `Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`
        ]);
        
    } else {
        // Outros casos (SEQUENCIAL)
        fulfillmentMessages = mapToFulfillmentMessages([
            `Desculpe, não entendi sua mensagem.`,
            `Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`
        ]);
    }

    // Lógica final de retorno: prioriza fulfillmentMessages (SEQUENCIAL)
    if (fulfillmentMessages.length > 0) {
        response.fulfillmentMessages = fulfillmentMessages;
        if (response.fulfillmentText) delete response.fulfillmentText;
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
