import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Para TMDB
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Função delay para humanizar mensagens
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função para consultar TMDB
async function getTMDBDetails(title) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) throw new Error("TMDB_API_KEY não definida");

    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=pt-BR`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return null;
    }

    const item = searchData.results[0];
    return {
      title: item.title || item.name,
      overview: item.overview,
      release_date: item.release_date || item.first_air_date,
      media_type: item.media_type,
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      seasons: item.number_of_seasons || null
    };
  } catch (err) {
    console.error("Erro TMDB:", err);
    return null;
  }
}

// Função de atendimento Gemini simulada (para exemplo)
async function atendimentoGemini(clienteMensagem) {
  // Aqui você integra sua API Gemini real
  return `Olá! Aqui é a Dani do Atendimento Magtv! 👋\nVocê disse: "${clienteMensagem}"`;
}

// Função para processar mensagens
async function processMessage(message) {
  // Aqui você define seu menu
  const lower = message.toLowerCase();

  if (lower.includes("menu") || lower.match(/1|2|3|4/)) {
    return "📋 *Menu Principal*\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Catálogo\n➡️ Envie o número da opção (1 a 4).";
  }

  if (lower.includes("1")) {
    return await atendimentoGemini(message);
  }

  if (lower.includes("4")) {
    return "Digite o título do filme ou série que deseja consultar:";
  }

  return "Desculpe, não consegui entender. Por favor, escolha uma opção do menu.";
}

// Rota principal (Webhook)
app.post("/", async (req, res) => {
  try {
    const userMessage = req.body.queryResult?.queryText || req.body.mensagem || "";
    console.log(`[Mensagem recebida]: ${userMessage}`);

    // Se for opção catálogo
    if (userMessage.trim().length > 0 && !userMessage.match(/1|2|3|4/)) {
      const tmdbData = await getTMDBDetails(userMessage);
      if (tmdbData) {
        const reply = `🎬 *${tmdbData.title}*\n📅 Lançamento: ${tmdbData.release_date || "N/A"}\n📝 Sinopse: ${tmdbData.overview || "Sem sinopse disponível"}${tmdbData.media_type === "tv" ? `\n📺 Temporadas disponíveis: ${tmdbData.seasons}` : ""}\n${tmdbData.poster_path ? tmdbData.poster_path : ""}`;
        return res.status(200).json({ fulfillmentText: reply });
      }
    }

    const reply = await processMessage(userMessage);

    // Delay simulado para humanização
    await delay(4000);

    res.status(200).json({ fulfillmentText: reply });
  } catch (err) {
    console.error("Erro no webhook:", err);
    res.status(500).json({ fulfillmentText: "Desculpe, não consegui responder agora." });
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`Webhook rodando na porta ${PORT}`);
});
