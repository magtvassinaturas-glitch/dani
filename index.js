import express from "express";
import cors from "cors";

// Criando o servidor
const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite receber JSON no body

// Rota raiz (Webhook)
app.post("/", (req, res) => {
  try {
    const userMessage = req.body.queryResult?.queryText || req.body.mensagem || "";
    console.log(`[Mensagem recebida]: ${userMessage}`);

    // Resposta mínima para o Dialogflow
    res.status(200).json({
      fulfillmentText: "Olá! Aqui é a Dani do Atendimento Magtv! 👋"
    });

  } catch (err) {
    console.error("Erro no webhook:", err);
    res.status(500).json({
      fulfillmentText: "Desculpe, não consegui responder agora."
    });
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`Webhook rodando na porta ${PORT}`);
});
