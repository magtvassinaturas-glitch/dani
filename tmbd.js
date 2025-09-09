// tmdb.js - função de consulta catálogo + TMDB
import fetch from 'node-fetch';

export const getTMDBDetails = async (title) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const search = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`);
    const data = await search.json();
    if (!data.results || data.results.length === 0) {
      return { title: "Não encontrado", overview: "-", release_date: "-", type: "-", seasons: 0 };
    }
    const item = data.results[0];
    return {
      title: item.title || item.name || "Sem título",
      overview: item.overview || "-",
      release_date: item.release_date || item.first_air_date || "-",
      type: item.media_type,
      seasons: item.number_of_seasons || 0
    };
  } catch (err) {
    console.error("Erro TMDB:", err);
    return { title: "Erro ao consultar", overview: "-", release_date: "-", type: "-", seasons: 0 };
  }
};
