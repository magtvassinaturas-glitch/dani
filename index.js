import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { getTMDBDetails } from './tmdb.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// Função delay humanizada
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Menu principal
const mainMenu = async (res) => {
  await delay(1000);
  res.json({ message: "📋 *Menu Principal*\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Catálogo\n➡️ Envie o número da opção (1 a 4)." });
};

// Webhook principal
app.post('/', async (req, res) => {
  const body = req.body;
  const userMessage = (body.message || "").toLowerCase().trim();

  // Saudação inicial
  if (userMessage.includes('oi') || userMessage.includes('olá') || userMessage.includes('boa')) {
    await mainMenu(res);
    return;
  }

  // Opção 4: Catálogo
  if (userMessage === "4") {
    const data = await getTMDBDetails("Matrix"); // Exemplo fixo, depois pode usar body.message real
    await delay(1500);
    res.json({ message: `🎬 ${data.title}\n📖 ${data.overview}\n📅 Lançamento: ${data.release_date}` });
    return;
  }

  // Resposta padrão
  await delay(1000);
  res.json({ message: "Desculpe, não consegui entender. Por favor, escolha uma opção do menu (1 a 4)." });
});

app.listen(PORT, () => {
  console.log(`Webhook rodando na porta ${PORT}!`);
});
