import fetch from "node-fetch";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Função para buscar filme ou série
export async function buscarFilmeOuSerie(query) {
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return "😔 Não encontrei nada com esse nome.";
    }

    return data.results
      .slice(0, 5) // limita a 5 resultados
      .map((item) => {
        const titulo = item.title || item.name;
        const ano =
          (item.release_date || item.first_air_date || "????").split("-")[0];
        return `🎬 ${titulo} (${ano})`;
      })
      .join("\n");
  } catch (error) {
    console.error("Erro ao buscar no TMDB:", error);
    return "⚠️ Ocorreu um erro ao consultar o catálogo. Tente novamente.";
  }
}
