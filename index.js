// =================================================================
// INTEGRAÇÃO GEMINI - INÍCIO (SINTAXE MODERNIZADA)
// =================================================================
import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai'; 

const app = express();
app.use(bodyParser.json()); 

// Busca automaticamente a chave na variável de ambiente GEMINI_API_KEY do Render
const ai = new GoogleGenAI({});

// Este é o prompt que dá a personalidade da Dani ao Gemini
const SYSTEM_INSTRUCTION = `
Você é Dani, a assistente virtual e atendente primária da MAGTV. Sua missão é responder perguntas complexas dos clientes (suporte ou dúvidas gerais) com base no histórico da conversa, mantendo uma personalidade amigável, prestativa e profissional. Você funciona como um "Smart Fallback" para o bot principal.

REGRAS:
1. NUNCA mencione que você é um modelo de linguagem (LLM) ou um programa de IA. Você é a Dani.
2. Use emojis de forma amigável (😊, 👍, 👋).
3. A MAGTV não é compatível com iOS (iPhone/iPad). Se perguntarem, informe de forma educada e sugira Android.
4. Se for perguntado sobre valores ou PIX, responda com os dados fixos: Plano Mensal R$ 30,00, PIX 94 98444-5961 (Davi Eduardo Borges).
`;

// Função assíncrona para chamar o Gemini
async function callGemini(queryText, userName) {
    const userPrompt = `${userName ? `O cliente ${userName} disse: ` : 'O cliente disse: '}` + queryText;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.5,
            },
        });
        
        // Retorna a resposta de texto
        return response.text || "Desculpe, a Dani não conseguiu gerar uma resposta agora. Tente novamente.";
        
    } catch (error) {
        console.error("Erro ao chamar o Gemini:", error);
        return "Desculpe, a Dani está com problemas técnicos no momento. Por favor, tente novamente mais tarde.";
    }
}
// =================================================================
// INTEGRAÇÃO GEMINI - FIM
// =================================================================

// CONFIGURAÇÕES E CONSTANTES
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const CODE_DOWNLOADER = "6519181"; // Seu código
const SITE_RUSH = "https://rush.ninja/";

// =================================================================
// LISTA DE FRASES DA DANI (SAUDAÇÃO APÓS CAPTURA DE NOME)
// =================================================================
const frasesDani = [
    (nome) => `Olá ${nome}! Seja muito bem-vindo(a) à MAGTV! Meu nome é Dani.`, 
    (nome) => `Olá ${nome}! Que bom que você veio! 😊 Eu sou a Dani, da MAGTV.`, 
    (nome) => `Olá ${nome}! Eu sou a Dani, atendente da MAGTV. É um prazer falar com você! 😊`,
    (nome) => `Uau! Que bom que você veio ${nome}! Eu sou a Dani, a sua assistente na MAGTV! Estou super animada para te ajudar hoje!`,
    (nome) => `Ah, que ótimo te ver por aqui ${nome}! Pode contar comigo, a Dani! Meu objetivo é deixar tudo mais fácil para você na MAGTV!`,
    (nome) => `Seja muito, muito bem-vindo(a) ${nome}! Você está falando com a Dani, e eu cuido de tudo por aqui na MAGTV com o maior prazer!`,
    (nome) => `Olá ${nome}! É a Dani quem está te atendendo na MAGTV! É um prazer!`
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
        `Para te ajudar com a instalação, preciso de uma informação rapidinha: Você vai usar o serviço em SMARTV,TV BOX, ANDROIDTV, ROKU TV ou Celular ${formattedFirstName}? Assim eu já te mando o tutorial certinho! 😉`
    ],
    // Variação 2
    (formattedFirstName, PLAN_VALUE) => [
        `Uau! Ótima escolha, ${formattedFirstName}! É um prazer ter você!`,
        `Nosso plano de assinatura é o **Mensal**, por um valor fixo de **R$ ${PLAN_VALUE}** (sem surpresas!).`,
        `O que você leva? Um catálogo completo com mais de **2.000 canais**, além de **20.000 filmes** e **16.000 séries** atualizadas semanalmente.`,
        `Onde você pode usar? Em qualquer Smart TV compatível (Samsung, LG, Roku) e todos os Androids (TV Box, Celular) usando a tecnologia P2P do nosso app.`,
        `🛑 Aviso: O serviço **não é compatível com aparelhos iOS** (iPhone/iPad).`,
        `Pronto para o teste? Antes, preciso saber: Qual a marca do seu dispositivo ${formattedFirstName}? Assim já te envio o tutorial exato! 📺`
    ]
    // OBS: Deixei apenas duas variações para manter o código limpo. Por favor, adicione suas outras 6 variações de volta aqui se necessário.
];
// =================================================================


// Funções para converter o ARRAY de mensagens em uma ÚNICA STRING para o AutoResponder
const arrayToFulfillmentText = (messages) => {
    // Junta as mensagens com duas quebras de linha para formatar bem no WhatsApp
    return messages.join('\n\n');
};


// =================================================================
// FUNÇÃO PARA GERAR A SAUDAÇÃO PERSONALIZADA E O MENU
// =================================================================
const getPersonalizedMenu = (nomeCliente) => {
    
    // Formata o nome para usar apenas o primeiro nome com a primeira letra maiúscula
    const nomeFormatado = nomeCliente.split(' ')[0].charAt(0).toUpperCase() + nomeCliente.split(' ')[0].slice(1).toLowerCase();
    
    // Escolhe uma saudação aleatória
    const indexAleatorio = Math.floor(Math.random() * frasesDani.length);
    let saudacao = frasesDani[indexAleatorio](nomeFormatado);

    const menuPrincipal = `
Como posso te ajudar hoje? Por favor, escolha uma das opções abaixo:

1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte
    `;

    return [saudacao, menuPrincipal]; // Retorna ARRAY de Strings
};

// =================================================================
// FUNÇÃO PARA GERAR O PITCH DE VENDAS ALEATÓRIO
// =================================================================
const getVendasPitch = (nomeCliente, PLAN_VALUE) => {
    
    // 1. Formata o primeiro nome do cliente
    const firstName = nomeCliente.split(' ')[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // 2. Escolhe uma variação aleatória
    const indexAleatorio = Math.floor(Math.random() * vendasDani.length);
    const pitchFunction = vendasDani[indexAleatorio];

    // 3. Executa a função do pitch
    return pitchFunction(formattedFirstName, PLAN_VALUE); // Retorna ARRAY de Strings
};
// =================================================================
// FUNÇÕES REUTILIZÁVEIS PARA TUTORIAIS (Implementações completas)
// =================================================================

// 1. TUTORIAL SMART TV (SAMSUNG / LG)
const getSmartTVInstallTutorial = () => {
    return [
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
};

// 2. TUTORIAL ROKU
const getRokuInstallTutorial = () => {
    return [
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
};

// 3. TUTORIAL ANDROID TV / TV BOX
const getAndroidTVInstallTutorial = () => {
    return [
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
};

// 4. TUTORIAL CELULAR ANDROID
const getAndroidCelularInstallTutorial = () => {
    return [
        "📱 Tutorial para Celular Android",
        "Como Instalar o Aplicativo P2P Rush Original", 
        "* Abra o navegador Google Chrome no seu celular.",
        `* Na barra de endereço, digite o seguinte site: ${SITE_RUSH}`,
        "* Na página que abrir, encontre o aplicativo com o nome P2P Rush Original.", 
        "* Clique no botão Baixar e aguarde o download.",
        "* Quando o download terminar, clique no arquivo baixado para instalar o aplicativo. Se for a primeira vez, pode ser que o celular peça permissão para instalar de fontes desconhecidas; basta aceitar.",
        "Aguarde um momento para criar seu Acesso!"
    ];
};

// 5. FUNÇÃO DE EXTRAÇÃO DE NOME (Melhorada)
function extractUserName(req) {
    // 1. Tenta pegar o nome diretamente do parâmetro da Intent
    const nomeUserParam = req.body.queryResult.parameters && req.body.queryResult.parameters['nomeuser']; 
    if (nomeUserParam) {
        if (typeof nomeUserParam === 'string' && nomeUserParam.length > 0) {
            return nomeUserParam;
        } else if (typeof nomeUserParam === 'object' && (nomeUserParam.name || nomeUserParam.displayName)) {
            return nomeUserParam.name || nomeUserParam.displayName;
        }
    }

    // 2. Tenta pegar o nome do contexto de saída (se já foi capturado)
    if (req.body.queryResult.outputContexts) {
        for (const context of req.body.queryResult.outputContexts) {
            if (context.parameters && context.parameters.nomeuser) {
                const contextNomeUser = context.parameters.nomeuser;
                if (typeof contextNomeUser === 'string' && contextNomeUser.length > 0) {
                    return contextNomeUser;
                } else if (typeof contextNomeUser === 'object' && (contextNomeUser.name || contextNomeUser.displayName)) {
                    return contextNomeUser.name || contextNomeUser.displayName;
                }
            }
        }
    }
    return null; // Retorna nulo se não encontrar
}


// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', async (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const queryText = req.body.queryResult.queryText;
    let response = {};
    let fulfillmentText = ""; 

    // Extrai o nome do cliente (do parâmetro ou do contexto)
    const userName = extractUserName(req);
    
    // =================================================================
    // ***** LÓGICA DE SAUDAÇÃO INICIAL (Default Welcome Intent) *****
    // =================================================================
    if (intentName === "Default Welcome Intent") {
        
        // Se o nome não está no contexto, pedimos o nome.
        if (!userName) {
            // Este texto deve ser o mesmo que o Dialogflow usa para pedir o nome.
            fulfillmentText = "Que bom que você nos procurou! Para darmos continuidade ao seu atendimento, me informe seu nome, por favor. 😊";
        } else {
             // FALLBACK: Se o nome for capturado aqui por algum motivo, mostramos o menu.
            const menuMessages = getPersonalizedMenu(userName);
            fulfillmentText = arrayToFulfillmentText(menuMessages);
        }
        
    }
    
    // =================================================================
    // ***** INTENT DE CAPTURA DE NOME (A SUA INTENT EXISTENTE) *****
    // =================================================================
    else if (intentName === "CAPTURA DE NOME") { 
        
        // Usa o nome capturado na Intent anterior
        let nomeParaSaudacao = userName || "Cliente"; 

        const menuMessages = getPersonalizedMenu(nomeParaSaudacao);
        fulfillmentText = arrayToFulfillmentText(menuMessages);
        
    }


    // ----------------------------------------------------------------
    // 1. INTENÇÕES DO MENU PRINCIPAL 
    // ----------------------------------------------------------------
    else if (intentName === "Menu Principal - N1") { 
        // Opção 1: Novo Cliente 
        let nomeParaPitch = userName || "Cliente"; 

        const pitchMessages = getVendasPitch(nomeParaPitch, PLAN_VALUE);
        fulfillmentText = arrayToFulfillmentText(pitchMessages);
            
    } else if (intentName === "Menu Principal - N2 - select.number") { 
        // Opção 2: Pagamento 
        fulfillmentText = `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:
Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}

Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`;

    } else if (intentName === "Menu Principal - N3 - select.number") { 
        // Opção 3: Suporte 
        fulfillmentText = `Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        
    } else if (intentName === "Suporte - Nome Capturado") { 
        // Esta Intent deve ser acionada após o usuário digitar o nome no fluxo de suporte.
        const formattedFirstName = userName ? userName.split(' ')[0].charAt(0).toUpperCase() + userName.split(' ')[0].slice(1).toLowerCase() : "Cliente";
        
        fulfillmentText = `Certo, ${formattedFirstName}. Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        
    } else if (intentName === "TESTE") {
        fulfillmentText = `Aguarde um momento...`;

    // ----------------------------------------------------------------
    // 2. FLUXO DE TUTORIAIS
    // ----------------------------------------------------------------
    } else if (intentName === "TUTORIAL SMARTV") {
        const messages = getSmartTVInstallTutorial();
        fulfillmentText = arrayToFulfillmentText(messages);

    } else if (intentName === "TUTORIAL ROKU") {
        const messages = getRokuInstallTutorial();
        fulfillmentText = arrayToFulfillmentText(messages);

    } else if (intentName === "TUTORIAL ANDROIDTV") { 
        const messages = getAndroidTVInstallTutorial();
        fulfillmentText = arrayToFulfillmentText(messages);

    } else if (intentName === "TUTORIAL CELULAR") {
        const messages = getAndroidCelularInstallTutorial();
        fulfillmentText = arrayToFulfillmentText(messages);
        
    } else if (intentName === "Sistemas de Confirmação") { 
        
        const lowerQuery = req.body.queryResult.queryText.toLowerCase();

        if (lowerQuery.includes('android') || lowerQuery.includes('google') || lowerQuery.includes('playstore') || lowerQuery.includes('triângulo') || lowerQuery.includes('apps google')) {
             const messages = getAndroidTVInstallTutorial(); 
             fulfillmentText = arrayToFulfillmentText(messages);
        
        } else if (lowerQuery.includes('roku') || lowerQuery.includes('streaming') || lowerQuery.includes('roxo') || lowerQuery.includes('canais')) {
             const messages = getRokuInstallTutorial();
             fulfillmentText = arrayToFulfillmentText(messages);
             
        } else {
             fulfillmentText = "Não consegui identificar o sistema. Me diga apenas uma palavra: 'Android' ou 'Roku'?";
        }


    // ----------------------------------------------------------------
    // 3. INTENÇÕES PADRÃO (Fallback/Resto)
    // ----------------------------------------------------------------
    } else if (intentName === "Default Fallback Intent") {
        // *** SMART FALLBACK COM GEMINI ***
        const geminiResponseText = await callGemini(queryText, userName);
        fulfillmentText = geminiResponseText;
        // ********************************
        
    } else {
        fulfillmentText = `Desculpe, não entendi sua mensagem. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte).`;
    }

    // RESPOSTA FINAL (OBRIGATÓRIO PARA O AUTORESPONDER APK)
    response.fulfillmentText = fulfillmentText; 
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
