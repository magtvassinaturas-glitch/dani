const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// CONFIGURAÇÕES
const OPENAI_API_KEY = "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";
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const PIX_KEY = "94 98444-5961";
const PIX_NAME = "Davi Eduardo Borges";
const PLAN_VALUE = "R$ 30,00";

// Rota para o webhook do Dialogflow
app.post('/webhook', async (req, res) => {
  try {
    const reqBody = req.body;
    const userQuery = reqBody.queryResult.queryText.toLowerCase().trim();
    let fulfillmentText = "";

    // Lógica para as opções de menu (1, 2, 3)
    if (userQuery.includes("1") || userQuery.includes("novo cliente") || userQuery.includes("plano") || userQuery.includes("assinatura")) {
      fulfillmentText = `Olá, sou a Dani da MAGTV, sua assistente virtual. 😊
      
Nosso plano de assinatura é único e custa apenas ${PLAN_VALUE} por mês.
Ele inclui mais de 2.000 canais abertos e fechados, 20 mil filmes, 14 mil séries e novelas, animes e desenhos.
Nosso serviço funciona em Smart TVs Samsung, LG e Roku (via IPTV) e em dispositivos Android (celulares, TV Box, Android TV) através do nosso app exclusivo.
⚠️ Importante: não funciona em iOS (iPhone/iPad).
      
Para eu te ajudar com o tutorial de instalação, por favor, me diga: você vai usar em uma **SMART TV**, **ANDROID TV** ou em um **Celular**? E qual a marca do seu aparelho?
      
Você tem direito a um teste grátis de 3 horas. Vou te encaminhar para o suporte para criarmos o seu acesso.`;

    } else if (userQuery.includes("2") || userQuery.includes("pagamento") || userQuery.includes("renovar")) {
      fulfillmentText = `Para renovar seu plano, por favor, faça o pagamento via PIX:
👉 Chave PIX: ${PIX_KEY}
👉 Nome: ${PIX_NAME}
👉 Valor: ${PLAN_VALUE}
      
Após o pagamento, por favor, envie o comprovante para que eu possa confirmar e liberar seu acesso!`;

    } else if (userQuery.includes("3") || userQuery.includes("suporte") || userQuery.includes("problema")) {
      fulfillmentText = "Certo, vou te conectar com o nosso suporte.\n\nPor favor, me diga seu nome completo.";

    } else if (userQuery.includes("iphone") || userQuery.includes("ios") || userQuery.includes("ipad")) {
      fulfillmentText = "Lamento, mas o nosso serviço não é compatível com dispositivos iOS (iPhone e iPad).";

    } else if (userQuery.includes("smart tv") || userQuery.includes("lg") || userQuery.includes("samsung") || userQuery.includes("tcl") || userQuery.includes("philco") || userQuery.includes("semp")) {
      fulfillmentText = "Para eu te ajudar com o tutorial, preciso saber qual o sistema da sua TV.\n\n";
      fulfillmentText += "A tela inicial tem a loja de apps da Google (o símbolo de um triângulo colorido do Play Store) ou o menu tem a opção 'Canais de Streaming' (com a logo do Roku)?\n\n";
      fulfillmentText += "Essa informação vai me ajudar a te guiar para o tutorial correto.";

    } else if (userQuery.includes("roku")) {
      fulfillmentText = "Certo! Para instalar o XCloud TV na sua Roku TV, siga estes passos:\n\n";
      fulfillmentText += "* Aperte o botão Home no controle remoto para ir para a tela principal.\n";
      fulfillmentText += "* Vá até 'Canais de Streaming'.\n";
      fulfillmentText += "* Selecione 'Procurar Canais'.\n";
      fulfillmentText += "* No campo de busca, digite 'XCloud TV'.\n";
      fulfillmentText += "* Selecione o app e clique em 'Adicionar Canal'.\n";
      fulfillmentText += "* Depois de instalar, clique em 'Ir para o canal'.\n";
      fulfillmentText += "* Agora, é só inserir seu login e senha que vamos fornecer!\n\n";
      fulfillmentText += "Aguarde um momento, vou te encaminhar para o suporte para criarmos seu acesso.";

    } else if (userQuery.includes("android tv") || userQuery.includes("sony") || userQuery.includes("multilaser") || userQuery.includes("philips")) {
      fulfillmentText = "Ótimo! Para instalar o aplicativo Rush One na sua Android TV, siga os passos:\n\n";
      fulfillmentText += "* Na sua Android TV, acesse a Play Store.\n";
      fulfillmentText += "* Procure pelo aplicativo 'Downloader' e clique em Instalar.\n";
      fulfillmentText += "* Abra o aplicativo Downloader.\n";
      fulfillmentText += "* No campo para digitar, coloque o código: 904291 e clique em 'Go'.\n";
      fulfillmentText += "* Dê permissão para o Downloader instalar outros apps.\n";
      fulfillmentText += "* Aguarde a instalação ser concluída.\n\n";
      fulfillmentText += "Aguarde um momento, vou te encaminhar para o suporte para criarmos seu acesso.";

    } else if (userQuery.includes("celular")) {
      fulfillmentText = "Perfeito! Para instalar o aplicativo Rush Original no seu celular Android, siga os passos:\n\n";
      fulfillmentText += "* Abra o navegador Google Chrome.\n";
      fulfillmentText += "* Digite o site: https://rush.ninja/\n";
      fulfillmentText += "* Encontre o app 'P2P Rush Original' e clique em 'Baixar'.\n";
      fulfillmentText += "* Quando o download terminar, clique no arquivo baixado para instalar. Aceite a permissão para instalar de fontes desconhecidas se necessário.\n\n";
      fulfillmentText += "Aguarde um momento, vou te encaminhar para o suporte para criarmos seu acesso.";
      
    } else {
      // Usa a API da OpenAI para respostas gerais
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: userQuery
        }]
      };

      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
      };

      try {
        const openaiResponse = await axios.post(OPENAI_API_ENDPOINT, payload, options);
        fulfillmentText = openaiResponse.data.choices[0].message.content;
      } catch (error) {
        console.error("Erro na chamada à API da OpenAI:", error.response ? error.response.data : error.message);
        fulfillmentText = `Desculpe, não consegui gerar uma resposta. Detalhe do erro: ${error.message}`;
      }
    }

    const dialogflowResponse = {
      "fulfillmentText": fulfillmentText
    };

    res.json(dialogflowResponse);

  } catch (error) {
    console.error("Erro na requisição: ", error);
    res.status(500).json({
      "fulfillmentText": `Ocorreu um erro na integração. Por favor, tente novamente ou entre em contato com o suporte.`
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
