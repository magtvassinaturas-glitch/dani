const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// === CONFIGURAÇÕES VIA VARIÁVEIS DE AMBIENTE ===
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Abre o catálogo.db
let db = new sqlite3.Database('./catalogo.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error('Erro ao abrir DB:', err.message);
    else console.log('Conectado ao catálogo.db!');
});

function limparTitulo(titulo) {
    return titulo.replace(/S\d{2}E\d{2}/gi, '')
                 .replace(/S\d{2}/gi, '')
                 .trim();
}

function buscarNoCatalogoAsync(titulo) {
    const tituloLimpo = limparTitulo(titulo);
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM catalogo WHERE titulo LIKE ?", [`%${tituloLimpo}%`], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function buscarTMDB(titulo, tipo='movie') {
    const url = `https://api.themoviedb.org/3/search/${tipo}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(titulo)}`;
    try {
        const res = await axios.get(url);
        if (res.data.results && res.data.results.length > 0) {
            const info = res.data.results[0];
            return {
                titulo: info.title || info.name,
                sinopse: info.overview,
                poster: info.poster_path ? `https://image.tmdb.org/t/p/w500${info.poster_path}` : null,
                lancamento: info.release_date || info.first_air_date,
                temporadas: tipo === 'tv' ? info.number_of_seasons : null
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro TMDB:', error);
        return null;
    }
}

// === Função usando Gemini ===
async function chamarGemini(prompt) {
    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText",
            { prompt: { text: prompt } },
            { headers: { "Authorization": `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" } }
        );

        const resposta = response.data.candidates?.[0]?.output;
        console.log("Resposta Gemini:", resposta);
        return resposta || "Desculpe, não consegui responder agora.";
    } catch (err) {
        console.error("Erro Gemini:", err.response ? err.response.data : err.message);
        return "Desculpe, não consegui responder agora.";
    }
}

app.post('/webhook', async (req, res) => {
    const pesquisaUsuarioOriginal = req.body.queryResult.queryText;
    const pesquisaUsuario = limparTitulo(pesquisaUsuarioOriginal);

    const contextoMenu = req.body.queryResult.outputContexts.find(c => c.name.includes('menu_principal'));
    const opcaoMenu = contextoMenu ? contextoMenu.parameters.opcaoMenu : null;

    try {
        if(opcaoMenu === 4){
            const resultados = await buscarNoCatalogoAsync(pesquisaUsuario);
            if (resultados.length === 0) {
                return res.json({ fulfillmentText: `Não encontrei nenhum título correspondente a "${pesquisaUsuarioOriginal}".` });
            }
            const tipo = resultados[0].titulo.match(/S\d{2}/i) ? 'tv' : 'movie';
            const info = await buscarTMDB(pesquisaUsuario, tipo);
            if (!info) {
                return res.json({ fulfillmentText: `Encontrei no catálogo, mas não localizei detalhes no TMDB para "${pesquisaUsuarioOriginal}".` });
            }
            let responseText = `🎬 ${info.titulo}\n\n${info.sinopse}\n\n`;
            if (tipo === 'movie') responseText += `📅 Lançamento: ${info.lancamento}\n`;
            if (tipo === 'tv') responseText += `📺 Temporadas disponíveis: ${info.temporadas}\n`;
            if (info.poster) responseText += `${info.poster}\n`;
            responseText += `\nDeseja pesquisar outro título ou voltar ao menu?`;
            return res.json({ fulfillmentText: responseText });
        } else {
            const respostaChat = await chamarGemini(pesquisaUsuarioOriginal);
            return res.json({ fulfillmentText: respostaChat });
        }
    } catch (err) {
        console.error(err);
        return res.json({ fulfillmentText: "Ocorreu um erro ao processar sua solicitação." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook rodando na porta ${PORT}`);
});
