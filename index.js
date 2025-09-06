const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// === CONFIGURAÇÕES ===
const GEMINI_API_KEY = "AIzaSyCzxGaTZOEmfYimIXihmRprOUK68aieJxI";
const TMDB_API_KEY = "92e56e9320cc546a391ed450be8acf1b";

// Abre o catálogo.db
let db = new sqlite3.Database('./catalogo.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error('Erro ao abrir DB:', err.message);
    else console.log('Conectado ao catálogo.db!');
});

// Função para limpar título
function limparTitulo(titulo) {
    return titulo.replace(/S\d{2}E\d{2}/gi, '')
                 .replace(/S\d{2}/gi, '')
                 .trim();
}

// Função de busca no catálogo transformada em Promise
function buscarNoCatalogoAsync(titulo) {
    const tituloLimpo = limparTitulo(titulo);
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM catalogo WHERE titulo LIKE ?", [`%${tituloLimpo}%`], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Função para buscar no TMDB
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

// Função para chamar Gemini
async function chamarGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("Erro Gemini:", err);
        return "Desculpe, não consegui responder agora.";
    }
}

// === WEBHOOK PRINCIPAL ===
app.post('/webhook', async (req, res) => {
    const pesquisaUsuarioOriginal = req.body.queryResult.queryText;
    const pesquisaUsuario = limparTitulo(pesquisaUsuarioOriginal);

    // Verifica contexto do menu
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
            const respostaGemini = await chamarGemini(pesquisaUsuarioOriginal);
            return res.json({ fulfillmentText: respostaGemini });
        }
    } catch (err) {
        console.error(err);
        return res.json({ fulfillmentText: "Ocorreu um erro ao processar sua solicitação." });
    }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook rodando na porta ${PORT}`);
});