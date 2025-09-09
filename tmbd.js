// tmdb.js - consulta ao TMDB usando fetch global (Node 18+)
export async function getTMDBDetails(title) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) throw new Error("TMDB_API_KEY não definida");

    // busca multi (movies + tv)
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(title)}&language=pt-BR`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (!data || !data.results || data.results.length === 0) {
      return null;
    }

    const item = data.results[0];
    // Se for série, pode necessitar de uma chamada extra para /tv/{id} para seasons
    let seasons = null;
    if (item.media_type === "tv") {
      try {
        const tvResp = await fetch(`https://api.themoviedb.org/3/tv/${item.id}?api_key=${encodeURIComponent(apiKey)}&language=pt-BR`);
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
    console.error("Erro em getTMDBDetails:", err);
    return null;
  }
}
