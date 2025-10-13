const express = require('express');
const app = express();
app.use(express.json());

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const CODE_DOWNLOADER = "5977492"; // Seu código
const SITE_RUSH = "https://rush.ninja/";

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

// =================================================================
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (RETORNANDO ARRAY DE MENSAGENS)
// =================================================================

// Mapeia o array de texto para o formato de mensagens do Dialogflow
const mapToFulfillmentMessages = (messages) => {
    return messages.map(text => ({ text: { text: [text] } }));
};

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
        "Agora o passo a passo para *Sistema Roku TV*:",
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

// 3. TUTORIAL ANDROID / CELULAR
const getAndroidMobileInstallTutorial = () => {
    const messages = [
        "📱 Tutorial para Celular Android",
        "1. Como Instalar o Aplicativo Rush One",
        "2. Abra o navegador *Google Chrome* no seu celular.",
        "3. Na barra de endereço, digite o seguinte site: " + SITE_RUSH,
        "4. Na página que abrir, encontre o aplicativo com o nome *Rush One!*",
        "5. Clique no botão *Baixar* e aguarde o download.",
        "6. Quando o download terminar, clique no arquivo baixado para *instalar o aplicativo*.",
        "7. Se for a primeira vez, pode ser que o celular peça permissão para instalar de fontes desconhecidas; basta aceitar.",
        "8. Após instalar é só abrir o aplicativo, nos envie a palavra **TESTE**!"
    ];
    return mapToFulfillmentMessages(messages);
};

// 4. TUTORIAL ANDROID TV / TV BOX
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

// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    let response = {};
    let fulfillmentMessages = [];

    // ----------------------------------------------------------------
    // 1. INTENÇÕES DO MENU PRINCIPAL (N1 com Delay, N2, N3)
    // ----------------------------------------------------------------
    if (intentName === "Menu Principal - N1") {
        // RESPOSTA DO MENU 1 QUEBRADA EM MÚLTIPLAS MENSAGENS COM DELAY
        fulfillmentMessages = [
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
        ];
        fulfillmentMessages = mapToFulfillmentMessages(fulfillmentMessages);
        
    } else if (intentName === "Menu Principal - N2 - select.number") {
        response.fulfillmentText = `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:

Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}

Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`;

    } else if (intentName === "Menu Principal - N3 - select.number") {
        response.fulfillmentText = "Certo, vou te conectar com o nosso suporte.\n\nPor favor, me diga seu nome completo.";

    } else if (intentName === "Suporte - Nome") {
        const userName = req.body.queryResult.parameters['given-name'] || req.body.queryResult.parameters['person']?.givenName;
        const nameText = userName ? `Certo, ${userName}.` : 'Certo.';
        response.fulfillmentText = `${nameText}\n\nAguarde um momento, vou encaminhar seu atendimento para o suporte.`;

    // ----------------------------------------------------------------
    // 2. TUTORIAIS DE INSTALAÇÃO
    // ----------------------------------------------------------------
    } else if (intentName === "TUTORIAL SMARTV") {
        fulfillmentMessages = getSmartTVInstallTutorial();

    } else if (intentName === "TUTORIAL ROKU") {
        fulfillmentMessages = getRokuInstallTutorial();

    } else if (intentName === "TUTORIAL ANDROID") {
        // Tenta inferir se é celular ou TV Box/Android TV pelo texto da query
        const originalQuery = req.body.queryResult.queryText.toLowerCase();
        
        if (originalQuery.includes('celular') || originalQuery.includes('smartphone')) {
             fulfillmentMessages = getAndroidMobileInstallTutorial();
        } else {
             fulfillmentMessages = getAndroidTVInstallTutorial();
        }

    // ----------------------------------------------------------------
    // 3. INTENÇÃO DE PONTE: TESTE (Resposta simples para transição humana)
    // ----------------------------------------------------------------
    } else if (intentName === "TESTE") {
        // Ponto de transição para o atendimento humano.
        response.fulfillmentText = `Aguarde um momento...`;

    // 4. INTENÇÕES PADRÃO
    } else if (intentName === "Default Welcome Intent") {
        const greeting = getGreeting();
        response.fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.\n\nComo posso te ajudar hoje?\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte`;

    } else if (intentName === "Default Fallback Intent") {
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
        
    } else {
        response.fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
    }

    // Retorna fulfillmentMessages se houver, caso contrário, usa fulfillmentText
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
