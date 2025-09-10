// tmdb.js - versão de teste com log
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY não definida! Confira suas Environment Variables no Render.");
} else {
  console.log("✅ TMDB_API_KEY encontrada:", TMDB_API_KEY.substring(0, 8) + "…"); // não mostra tudo por segurança
}

export async function buscarFilmeOuSerie(query) {
  try {
    if (!TMDB_API_KEY) return null;

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(
      TMDB_API_KEY
    )}&language=pt-BR&query=${encodeURIComponent(query)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("TMDB status:", resp.status);
      return null;
    }
    const data = await resp.json();
    if (!data?.results?.length) return null;

    const item = data.results[0];
    let seasons = null;
    if (item.media_type === "tv") {
      try {
        const tvResp = await fetch(
          `https://api.themoviedb.org/3/tv/${item.id}?api_key=${encodeURIComponent(
            TMDB_API_KEY
          )}&language=pt-BR`
        );
        const tvData = await tvResp.json();
        seasons = tvData?.number_of_seasons ?? null;
      } catch (e) {
        seasons = null;
      }
    }

    return {
      title: item.title || item.name || "Sem título",
      overview: item.overview || "Sem sinopse.",
      release_date: item.release_date || item.first_air_date || "—",
      media_type: item.media_type || "movie",
      seasons
    };
  } catch (err) {
    console.error("Erro em buscarFilmeOuSerie:", err);
    return null;
  }
}
