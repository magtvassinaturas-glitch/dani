import express from "express";
import bodyParser from "body-parser";
import { buscarFilmeOuSerie } from "./tmdb.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

console.log("Webhook rodando na porta", PORT);

// Função para simular delay humanizado
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Função para enviar mensagens (simulada, adapte para seu webhook real)
async function enviarMensagem(clienteId, mensagem) {
  console.log(`[Mensagem para ${clienteId}]:`, mensagem);
  await delay(4000); // 4s de delay
}

// Função principal de atendimento
async function atendimentoDani(clienteId, input, estado) {
  switch (estado.menu) {
    case "inicio":
      await enviarMensagem(clienteId, "Olá! Aqui é a Dani do Atendimento Magtv! 👋");
      await enviarMensagem(clienteId, "Como se chama?");
      estado.menu = "aguardando_nome";
      break;

    case "aguardando_nome":
      estado.nome = input;
      await enviarMensagem(clienteId, `Prazer ${estado.nome}! 👋`);
      await enviarMensagem(clienteId, "📋 *Menu Principal*:\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Catálogo");
      estado.menu = "menu";
      break;

    case "menu":
      if (input === "1") {
        estado.menu = "novo_cliente";
        await enviarMensagem(clienteId, "Ótimo! Vou te explicar nosso plano de assinatura.");
        await enviarMensagem(clienteId, "👉 Mensal: R$30,00");
        await enviarMensagem(clienteId, "Inclui mais de 2.000 canais, 20.000 filmes, 14.000 séries, animes e desenhos.");
        await enviarMensagem(clienteId, "Nosso serviço funciona em Smart TVs Samsung, LG, Roku e dispositivos Android via nosso app exclusivo.");
        await enviarMensagem(clienteId, "Gostaria de fazer o teste gratuito de 3 horas?");
        estado.menu = "teste_gratuito";
      } else if (input === "4") {
        estado.menu = "catalogo";
        await enviarMensagem(clienteId, "Digite o nome do filme ou série que deseja pesquisar:");
      } else {
        await enviarMensagem(clienteId, "Opção inválida. Por favor, escolha de 1 a 4.");
      }
      break;

    case "teste_gratuito":
      if (input.toLowerCase() === "sim") {
        await enviarMensagem(clienteId, "Ótimo! Vamos começar o tutorial de instalação.");
        estado.menu = "tutorial_inicial";
      } else {
        await enviarMensagem(clienteId, "Sem problemas! Obrigado pelo seu interesse. 😊");
        estado.menu = "menu";
      }
      break;

    case "catalogo":
      const resultado = await buscarFilmeOuSerie(input);
      if (!resultado) {
        await enviarMensagem(clienteId, "Não encontrei esse título 😕. Tente outro.");
      } else {
        let msg = `🎬 Título: ${resultado.title}\n📝 Sinopse: ${resultado.overview}\n📅 Lançamento: ${resultado.release_date}`;
        if (resultado.media_type === "tv") {
          msg += `\n📺 Temporadas disponíveis: ${resultado.seasons || "—"}`;
        }
        await enviarMensagem(clienteId, msg);
      }
      await enviarMensagem(clienteId, "Deseja pesquisar outro título ou voltar ao menu principal?");
      estado.menu = "menu";
      break;

    default:
      await enviarMensagem(clienteId, "Desculpe, não consegui entender. Voltando ao menu principal.");
      estado.menu = "menu";
      break;
  }
}

// Simulação de estado do cliente
const clientes = {};

// Endpoint webhook
app.post("/", async (req, res) => {
  const clienteId = req.body.clienteId || "teste";
  const mensagem = req.body.mensagem || "";

  if (!clientes[clienteId]) {
    clientes[clienteId] = { menu: "inicio" };
  }

  await atendimentoDani(clienteId, mensagem, clientes[clienteId]);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
