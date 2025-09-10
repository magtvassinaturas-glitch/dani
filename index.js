import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getTMDBDetails } from "./tmdb.js";
import { sendGeminiResponse } from "./gemini.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Usuários que estão no modo catálogo
const catalogModeUsers = new Set();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para processar menu 1,2,3
async function processMenuOption(userId, option, userMessage) {
  switch (option) {
    case "1":
      await delay(4000);
      const greeting = await sendGeminiResponse(`Atendimento inicial para usuário: ${userMessage}`);
      return greeting;
    case "2":
      await delay(4000);
      return "💳 Para pagamento via PIX:\nChave: 94 98444-5961\nNome: Davi Eduardo Borges\nValor: R$ 30,00\nPor favor, envie o comprovante após o pagamento.";
    case "3":
      await delay(4000);
      return "🛟 Aguarde um momento, vou encaminhar seu atendimento para o suporte.";
    default:
      return "❌ Opção inválida. Por favor, selecione uma opção do menu (1 a 4).";
  }
}

app.post("/", async (req, res) => {
  try {
    const userId = req.body.originalDetectIntentRequest?.payload?.userId || "default_user";
    const userMessage = req.body.queryResult?.queryText?.trim() || "";

    console.log(`[Mensagem recebida] User: ${userId} Msg: ${userMessage}`);

    // Se mensagem for 4️⃣ ativa modo catálogo
    if (userMessage === "4") {
      catalogModeUsers.add(userId);
      await delay(4000);
      return res.status(200).json({
        fulfillmentText: "🎞️ Ótimo! Envie o nome do filme ou série que deseja buscar."
      });
    }

    // Se usuário está em modo catálogo
    if (catalogModeUsers.has(userId)) {
      if (userMessage.match(/^[1-4]$/)) {
        // usuário quer voltar para o menu
        catalogModeUsers.delete(userId);
        await delay(4000);
        return res.status(200).json({
          fulfillmentText: "📋 *Menu Principal*\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Catálogo"
        });
      }

      // Busca no TMDB
      const tmdbData = await getTMDBDetails(userMessage);
      if (tmdbData) {
        const reply = `🎬 *${tmdbData.title}*\n` +
                      `📅 Lançamento: ${tmdbData.release_date || "N/A"}\n` +
                      `📝 Sinopse: ${tmdbData.overview || "Sem sinopse disponível"}\n` +
                      `${tmdbData.media_type === "tv" ? `📺 Temporadas disponíveis: ${tmdbData.seasons}\n` : ""}` +
                      `${tmdbData.poster_path ? `🖼️ Poster: ${tmdbData.poster_path}` : ""}`;
        await delay(4000);
        return res.status(200).json({ fulfillmentText: reply });
      } else {
        await delay(4000);
        return res.status(200).json({ fulfillmentText: "Não encontrei esse título no catálogo. 😕" });
      }
    }

    // Mensagens para menu 1,2,3
    if (userMessage.match(/^[1-3]$/)) {
      const reply = await processMenuOption(userId, userMessage, userMessage);
      return res.status(200).json({ fulfillmentText: reply });
    }

    // Mensagem de boas-vindas ou qualquer outro texto
    await delay(4000);
    return res.status(200).json({
      fulfillmentText: "📋 *Menu Principal*\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Catálogo"
    });

  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ fulfillmentText: "Desculpe, não consegui responder agora." });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook rodando na porta ${PORT}`);
});
