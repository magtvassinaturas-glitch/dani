const express = require('express');
const app = express();
app.use(express.json());

// CONFIGURAÇÕES DO BOT
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";
const TELEPHONE = "94 98444-5961";
const SITE_RUSH = "https://rush.ninja/";
const CODE_DOWNLOADER = "904291";

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

// Rota para o webhook do Dialogflow
app.post('/webhook', (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    let fulfillmentText = "";

    // Lógica principal do bot, baseada no nome da intenção
    if (intentName === "Novo Cliente") {
      fulfillmentText = `Ótimo!

Então, nosso plano de assinatura é o **Mensal**, e custa apenas **R$ 30,00**.

Ele inclui:
- Mais de **2.000** canais abertos e fechados
- Mais de **20 mil** filmes
- Mais de **14 mil** séries e novelas
- Animes e desenhos

Você pode usar em **Smart TVs Samsung, LG, Roku** (via IPTV) e em dispositivos **Android** (celulares, TV Box, Android TV) através do nosso app exclusivo.
⚠️ Importante: **não funciona em iOS** (iPhone/iPad).

Você tem direito a 3 horas de teste grátis. Vamos começar?`;
      
    } else if (intentName === "NovoCliente - Sim") {
        fulfillmentText = `Antes de começarmos, qual a marca da sua TV?`;

    } else if (intentName === "NovoCliente - Sim - SmartTV" || intentName === "NovoCliente - Sim - Samsung" || intentName === "NovoCliente - Sim - LG") {
      fulfillmentText = `Ótimo! Já sei o que fazer.

Você tem direito a um teste grátis de 3 horas. Aguarde um momento para eu criar seu acesso!

---
📺 **Tutorial para TVs Samsung e LG**

* Aperte o botão **Home** no controle remoto.
* Navegue até a **loja de aplicativos**.
* Use a pesquisa e digite **"XCloud TV"**.
* Selecione o aplicativo e clique em **Instalar** (ou Baixar).
* Quando a instalação estiver concluída, clique em **Abrir**.

Pronto! É só inserir seu login e senha que vamos fornecer!
Se não conseguir, me avise que vou te encaminhar para o suporte.`;

    } else if (intentName === "NovoCliente - Sim - Roku") {
      fulfillmentText = `Ah, entendi! Então sua TV usa o sistema **Roku TV**.

Ótimo! Agora vou te passar o passo a passo para instalar o nosso app.

---
📺 **Tutorial para Roku TV**

* Aperte o botão **Home** no controle remoto.
* Vá até **Canais de Streaming** na tela principal.
* Selecione a opção **Procurar Canais**.
* No campo de busca, digite **"XCloud TV"**.
* Selecione o aplicativo e clique em **Adicionar Canal**.
* Aguarde a instalação e clique em **Ir para o canal**.

Você tem direito a um teste grátis de 3 horas. Aguarde um momento para criar seu acesso!
Se não conseguir, me avise que vou te encaminhar para o suporte.`;

    } else if (intentName === "NovoCliente - Sim - AndroidTV" || intentName === "NovoCliente - Sim - Sony" || intentName === "NovoCliente - Sim - Multilaser" || intentName === "NovoCliente - Sim - Philips") {
      fulfillmentText = `Ótimo! Sua TV usa o sistema **Android TV**, então você vai conseguir usar nosso serviço tranquilamente.

Você tem direito a um teste grátis de 3 horas. Vou te enviar agora o tutorial para a instalação do nosso aplicativo.

---
📺 **Tutorial para Android TV**

* Na sua Android TV, acesse a **Play Store**.
* Procure pelo aplicativo **"Downloader"** e clique em Instalar.
* Abra o aplicativo Downloader.
* No campo para digitar, coloque o código: **${CODE_DOWNLOADER}** e clique em Go.
* Se o aplicativo pedir, dê a permissão para o Downloader poder instalar outros aplicativos.
* Aguarde a instalação ser concluída.

Pronto! É só me avisar quando o app estiver instalado que eu te passo seu acesso para o teste grátis.
Se não conseguir, me avise que vou te encaminhar para o suporte.`;

    } else if (intentName === "NovoCliente - Sim - Celular" || intentName === "NovoCliente - Sim - Smartphone") {
      fulfillmentText = `Perfeito!

Você tem direito a um teste grátis de 3 horas. Vou te enviar agora o tutorial para a instalação do nosso aplicativo no seu celular.

---
📱 **Tutorial para Celular Android**

* Abra o navegador Google Chrome no seu celular.
* Na barra de endereço, digite o seguinte site: **${SITE_RUSH}**
* Na página que abrir, procure o app **"P2P Rush Original"**.
* Clique no botão **Baixar** e aguarde o download.
* Quando o download terminar, clique no arquivo baixado para instalar o aplicativo.
* Se for a primeira vez, pode ser que o celular peça permissão para instalar de fontes desconhecidas; basta aceita.

Pronto! É só me avisar quando o app estiver instalado que eu te passo seu acesso para o teste grátis.
Se não conseguir, me avise que vou te encaminhar para o suporte.`;
    } else if (intentName === "Pagamento") {
      fulfillmentText = `Para realizar o pagamento ou renovar, é só usar a chave PIX abaixo:

Chave PIX: ${PIX_KEY}
Nome: ${PIX_NAME}
Valor: R$ ${PLAN_VALUE}

Assim que você fizer o pagamento, me envie o comprovante, por favor! 😉`;

    } else if (intentName === "Suporte") {
      fulfillmentText = "Certo, vou te conectar com o nosso suporte.\n\nPor favor, me diga seu nome completo.";

    } else if (intentName === "Suporte - Nome") {
        const userName = req.body.queryResult.parameters['given-name'] || req.body.queryResult.parameters['person']?.givenName;
        if (userName) {
            fulfillmentText = `Certo, ${userName}.

Aguarde um momento, vou encaminhar seu atendimento para o suporte.`;
        } else {
            fulfillmentText = "Certo. Aguarde um momento, vou encaminhar seu atendimento para o suporte.";
        }
    } else if (intentName === "Default Welcome Intent") {
      const greeting = getGreeting();
      fulfillmentText = `Olá! ${greeting}, Seja bem-vindo(a) à MAGTV! Meu nome é Dani.

Como posso te ajudar hoje?
1️⃣ Novo Cliente
2️⃣ Pagamento
3️⃣ Suporte`;

    } else if (intentName === "Default Fallback Intent") {
      fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
      
    } else {
        // Mensagem genérica para intenções que não foram mapeadas aqui
        fulfillmentText = `Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções do menu principal (1️⃣ Novo Cliente, 2️⃣ Pagamento ou 3️⃣ Suporte) ou entre em contato com o suporte em nosso número de WhatsApp.`;
    }

    const dialogflowResponse = {
      "fulfillmentText": fulfillmentText
    };

    res.json(dialogflowResponse);

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
