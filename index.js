import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";

const app = express();
const db = new sqlite3.Database("./catalogo.db");

app.use(bodyParser.json());

// Estado simples para armazenar progresso do cliente (em memória)
const estadoClientes = {};

app.post("/webhook", (req, res) => {
  const session = req.body.session || "default";
  const pergunta = req.body.queryResult.queryText.toLowerCase();

  // Inicia estado do cliente
  if (!estadoClientes[session]) {
    estadoClientes[session] = { etapa: "inicio", nome: "" };
  }

  let resposta = "";

  // ===== FLUXO =====
  if (estadoClientes[session].etapa === "inicio") {
    resposta = "Olá! Eu sou a Dani, atendente virtual da *MAGTV IPTV* 😃✨\nQual o seu nome?";
    estadoClientes[session].etapa = "aguardando_nome";
  }

  else if (estadoClientes[session].etapa === "aguardando_nome") {
    estadoClientes[session].nome = pergunta;
    resposta = `Prazer, ${estadoClientes[session].nome}! 👋\nEscolha uma opção:\n\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Consultar Conteúdo (catálogo)`;
    estadoClientes[session].etapa = "menu";
  }

  else if (estadoClientes[session].etapa === "menu") {
    if (pergunta.includes("1") || pergunta.includes("novo cliente")) {
      resposta = "Temos apenas 1 plano:\n👉 *Mensal: R$ 30,00*\n\nInclui mais de *2.000 canais* abertos e fechados, mais de *20 mil filmes*, *14 mil séries e novelas*, além de *animes e desenhos*.\n\nFunciona em **Smart TVs Samsung, LG, Roku**, e dispositivos **Android (celulares, TV Box, Android TV)** com nosso app exclusivo.\n⚠️ Não funciona em iOS (iPhone/iPad).\n\nEm qual dispositivo você pretende usar (SMARTV, ANDROIDTV ou Celular)? Qual a marca do aparelho?";
      estadoClientes[session].etapa = "novo_cliente";
    }
    else if (pergunta.includes("2") || pergunta.includes("pagamento")) {
      resposta = "💳 Para renovar ou pagar sua assinatura:\n👉 *Chave PIX:* 94 98444-5961\n👉 *Nome:* Davi Eduardo Borges\n👉 *Valor:* R$ 30,00\n\nApós o pagamento, envie o comprovante aqui ✅";
    }
    else if (pergunta.includes("3") || pergunta.includes("suporte")) {
      resposta = "Certo! Para o suporte, preciso do seu *Nome e Sobrenome*.";
      estadoClientes[session].etapa = "suporte";
    }
    else if (pergunta.includes("4") || pergunta.includes("consultar")) {
      resposta = "Digite o nome do filme, série, novela, anime ou desenho que deseja buscar 🎬";
      estadoClientes[session].etapa = "catalogo";
    }
    else {
      resposta = "Não entendi sua escolha 🤔. Digite o número da opção:\n1️⃣ Novo Cliente\n2️⃣ Pagamento\n3️⃣ Suporte\n4️⃣ Consultar Conteúdo";
    }
  }

  else if (estadoClientes[session].etapa === "novo_cliente") {
    resposta = "Você tem direito a um *teste grátis de 3 horas*! 🎉\nAguarde um momento, vou encaminhar seu atendimento para o suporte humano.";
    estadoClientes[session].etapa = "fim";
  }

  else if (estadoClientes[session].etapa === "suporte") {
    resposta = "Obrigado! 🙏 Aguarde um momento, vou encaminhar seu atendimento para o suporte humano.";
    estadoClientes[session].etapa = "fim";
  }

  else if (estadoClientes[session].etapa === "catalogo") {
    db.all("SELECT titulo FROM catalogo WHERE titulo LIKE ?", [`%${pergunta}%`], (err, rows) => {
      if (err) {
        return res.json({ fulfillmentText: "⚠️ Erro ao consultar catálogo." });
      }
      if (rows.length > 0) {
        const lista = rows.map(r => r.titulo).slice(0, 5).join(", ");
        return res.json({ fulfillmentText: `✅ Encontrei: ${lista} ...` });
      } else {
        return res.json({ fulfillmentText: "Infelizmente não encontrei este título no catálogo 😕, mas temos milhares de outras opções. Deseja que eu sugira algo parecido?" });
      }
    });
    return;
  }

  // ===== RESPOSTA =====
  res.json({ fulfillmentText: resposta });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});