const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const CODE_DOWNLOADER = "5977492";
const SITE_RUSH = "https://rush.ninja/";

// 🔕 Lista de sessões em atendimento humano
const atendimentosHumanos = {};

// =================================================================
// FUNÇÃO AUXILIAR PARA CHECAR SE BOT ESTÁ PAUSADO
// =================================================================
function isBotPausado(sessionId) {
  return atendimentosHumanos[sessionId];
}

// =================================================================
// FUNÇÕES E TEXTOS DO BOT (RESUMO DAS ORIGINAIS)
// =================================================================

// Frases da Dani
const frasesDani = [
  "Olá [Nome do Cliente]! Seja muito bem-vindo(a) à MAGTV! Meu nome é Dani.",
  "Olá [Nome do Cliente]! Que bom que você veio! 😊 Eu sou a Dani, da MAGTV.",
  "Olá [Nome do Cliente]! Eu sou a Dani, atendente da MAGTV. É um prazer falar com você! 😊",
  "Uau! Que bom que você veio [Nome do Cliente]! Eu sou a Dani, a sua assistente na MAGTV! Estou super animada para te ajudar hoje!",
  "Ah, que ótimo te ver por aqui [Nome do Cliente]! Pode contar comigo, a Dani! Meu objetivo é deixar tudo mais fácil para você na MAGTV.",
  "Seja muito, muito bem-vindo(a) [Nome do Cliente]! Você está falando com a Dani, e eu cuido de tudo por aqui na MAGTV com o maior prazer!",
  "Olá [Nome do Cliente]! É a Dani quem está te atendendo na MAGTV! É um prazer!"
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

const mapToFulfillmentMessages = (messages) => {
  return messages.map(text => ({ text: { text: [text] } }));
};

const getPersonalizedMenu = (nomeCliente) => {
  const indexAleatorio = Math.floor(Math.random() * frasesDani.length);
  let saudacao = frasesDani[indexAleatorio];
  const nomeFormatado = nomeCliente.split(' ')[0].charAt(0).toUpperCase() + nomeCliente.split(' ')[0].slice(1).toLowerCase();
  saudacao = saudacao.replace('[Nome do Cliente]', nomeFormatado);
  const menuPrincipal = `Como posso te ajudar hoje? Por favor, escolha uma das opções abaixo:

1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte`;
  return mapToFulfillmentMessages([saudacao, menuPrincipal]);
};

// =================================================================
// WEBHOOK PRINCIPAL
// =================================================================
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const queryText = req.body.queryResult.queryText || "";
    const session = req.body.session || "";
    const sessionId = session.split("/").pop();
    let response = {};
    let fulfillmentMessages = [];

    // 🔕 Se o bot estiver pausado
    if (isBotPausado(sessionId)) {
      // Reativar com "MAGTV agradece"
      if (queryText.toLowerCase().includes("magtv agradece")) {
        delete atendimentosHumanos[sessionId];
        console.log(`✅ Bot reativado para ${sessionId}`);
        return res.json({
          fulfillmentText: "🤖 O atendimento automático foi reativado! Posso continuar te ajudando. 😉"
        });
      }
      console.log(`⏸️ Bot pausado para ${sessionId}. Ignorando mensagem: ${queryText}`);
      return res.json({ fulfillmentText: "" });
    }

    // Lógica de saudação
    if (intentName === "Default Welcome Intent") {
      const greeting = getGreeting();
      response.fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.\n\nComo posso te ajudar hoje?\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte`;
    }

    // Opção 2: Pagamento
    if (intentName === "Menu Principal - N2 - select.number") {
      fulfillmentMessages = mapToFulfillmentMessages([
        `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:
Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: ${PLAN_VALUE}
Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`
      ]);
    }

    // Suporte - Nome Capturado => ativa pausa
    if (intentName === "Suporte - Nome Capturado") {
      atendimentosHumanos[sessionId] = true;
      console.log(`🔕 Atendimento humano iniciado para ${sessionId}`);
      response.fulfillmentText = "Certo! Aguarde um momento, vou encaminhar seu atendimento para o suporte.";
      return res.json(response);
    }

    // Fallback padrão
    if (!response.fulfillmentText && fulfillmentMessages.length === 0) {
      response.fulfillmentText = "Desculpe, não entendi. Por favor, escolha 1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte.";
    }

    if (fulfillmentMessages.length > 0) response.fulfillmentMessages = fulfillmentMessages;
    res.json(response);

  } catch (error) {
    console.error("Erro na requisição:", error);
    res.status(500).json({ fulfillmentText: "Ocorreu um erro na integração. Por favor, tente novamente." });
  }
});

app.get('/', (req, res) => {
  res.send('O bot está online e funcionando com sistema de pausa MAGTV!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
