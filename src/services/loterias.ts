// Next
import { unstable_cache } from "next/cache";
// Models
import { historyFromRows, resultFromCaixa, type CaixaRaw, type Game, type History, type HistoryRow, type Result } from "@/core/models";

const CAIXA_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const HISTORY_URL = "https://loteriascaixa-api.herokuapp.com/api";

// CAIXA answers a concurso that hasn't been drawn yet with a 500.
export const getResult = async (game: Game, concurso?: number): Promise<Result | null> => {
  try {
    const response = await fetch(`${CAIXA_URL}/${game.id}${concurso ? `/${concurso}` : ""}`, { next: { revalidate: 600 } });
    if (!response.ok) return null;

    const raw: CaixaRaw = await response.json();
    return raw?.numero ? resultFromCaixa(raw) : null;
  } catch {
    return null;
  }
};

// The "latest" endpoint can trail the per-concurso one by a draw, so the next number is tried too.
export const getLatestResult = async (game: Game) => {
  const latest = await getResult(game);
  if (!latest) return null;

  return (await getResult(game, latest.concurso + 1)) ?? latest;
};

// The raw history runs to 6 MB, over the 2 MB fetch-cache limit, so the trimmed draws are cached instead.
// It throws on failure so a bad response is never cached for the hour.
const fetchHistory = unstable_cache(
  async (game: Game): Promise<History> => {
    const response = await fetch(`${HISTORY_URL}/${game.id}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`history ${game.id}: ${response.status}`);

    const rows: HistoryRow[] = await response.json();
    return historyFromRows(game, rows);
  },
  ["history"],
  { revalidate: 3600 }
);

export const getHistory = async (game: Game): Promise<History | null> => {
  try {
    return await fetchHistory(game);
  } catch {
    return null;
  }
};
