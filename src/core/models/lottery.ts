export type GameId = "megasena" | "lotofacil" | "quina" | "lotomania" | "timemania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "loteca" | "federal";

export type Range = { min: number; max: number; pick: number; cols: number; drawn: number };

export type Game = {
  id: GameId;
  name: string;
  path: string;
  kind: "numbers" | "columns" | "loteca" | "federal";
  color: string;
  colorDark: string;
  format: string;
  odds: string;
  main: Range;
  extra?: "time" | "mes" | "trevos";
  special?: string;
};

const NO_RANGE: Range = { min: 0, max: 0, pick: 0, cols: 1, drawn: 0 };

// Keys are the CAIXA API slugs; path is the site's route. Colours stay readable under white (light) and dark text (dark).
export const GAMES: Record<GameId, Game> = {
  megasena: { id: "megasena", name: "Mega-Sena", path: "mega-sena", kind: "numbers", color: "#1a7d56", colorDark: "#5fd3a0", format: "6 dezenas de 01 a 60", odds: "1 em 50.063.860", main: { min: 1, max: 60, pick: 6, cols: 10, drawn: 6 }, special: "Mega da Virada" },
  lotofacil: { id: "lotofacil", name: "Lotofácil", path: "lotofacil", kind: "numbers", color: "#930089", colorDark: "#e58ade", format: "15 dezenas de 01 a 25", odds: "1 em 3.268.760", main: { min: 1, max: 25, pick: 15, cols: 5, drawn: 15 }, special: "Lotofácil da Independência" },
  quina: { id: "quina", name: "Quina", path: "quina", kind: "numbers", color: "#3b1fa3", colorDark: "#a99bff", format: "5 dezenas de 01 a 80", odds: "1 em 24.040.016", main: { min: 1, max: 80, pick: 5, cols: 10, drawn: 5 }, special: "Quina de São João" },
  lotomania: { id: "lotomania", name: "Lotomania", path: "lotomania", kind: "numbers", color: "#b35c00", colorDark: "#ffad5c", format: "50 dezenas de 00 a 99", odds: "1 em 11.372.635", main: { min: 0, max: 99, pick: 50, cols: 10, drawn: 20 } },
  timemania: { id: "timemania", name: "Timemania", path: "timemania", kind: "numbers", color: "#2f6a12", colorDark: "#8fd46a", format: "10 dezenas de 01 a 80 + Time do Coração", odds: "1 em 26.472.637", main: { min: 1, max: 80, pick: 10, cols: 10, drawn: 7 }, extra: "time" },
  duplasena: { id: "duplasena", name: "Dupla Sena", path: "dupla-sena", kind: "numbers", color: "#a61324", colorDark: "#ff8a95", format: "6 dezenas de 01 a 50 · 2 sorteios", odds: "1 em 15.890.700", main: { min: 1, max: 50, pick: 6, cols: 10, drawn: 6 }, special: "Dupla de Páscoa" },
  diadesorte: { id: "diadesorte", name: "Dia de Sorte", path: "dia-de-sorte", kind: "numbers", color: "#8f5a12", colorDark: "#f0b860", format: "7 dezenas de 01 a 31 + Mês de Sorte", odds: "1 em 2.629.575", main: { min: 1, max: 31, pick: 7, cols: 7, drawn: 7 }, extra: "mes" },
  supersete: { id: "supersete", name: "Super Sete", path: "super-sete", kind: "columns", color: "#5f7400", colorDark: "#c9e05a", format: "1 número de 0 a 9 em cada uma das 7 colunas", odds: "1 em 10.000.000", main: { min: 0, max: 9, pick: 1, cols: 10, drawn: 1 } },
  maismilionaria: { id: "maismilionaria", name: "+Milionária", path: "mais-milionaria", kind: "numbers", color: "#2e3078", colorDark: "#a3a8ff", format: "6 dezenas de 01 a 50 + 2 trevos", odds: "1 em 238.360.500", main: { min: 1, max: 50, pick: 6, cols: 10, drawn: 6 }, extra: "trevos" },
  loteca: { id: "loteca", name: "Loteca", path: "loteca", kind: "loteca", color: "#c2410c", colorDark: "#ff9a6b", format: "1, X ou 2 em 14 jogos de futebol", odds: "1 em 4.782.969 no chute", main: NO_RANGE },
  federal: { id: "federal", name: "Federal", path: "federal", kind: "federal", color: "#1d3f9e", colorDark: "#8fa8ff", format: "bilhete já numerado", odds: "1 em 100.000 por bilhete", main: NO_RANGE },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];

export const gameByPath = (path: string) => GAME_IDS.map((id) => GAMES[id]).find((game) => game.path === path);

export const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const LOTECA_OUTCOMES = ["1", "X", "2"];

// One history entry. extra holds Time do Coração / Mês de Sorte as a 1-based index, or the trevos.
export type Draw = { concurso: number; numbers: number[]; extra?: number[] };

export type History = { draws: Draw[]; teams: string[] };

export type Result = {
  concurso: number;
  date: string;
  numbers: string[];
  secondNumbers: string[];
  trevos: string[];
  extra: string;
  isAccumulated: boolean;
  tiers: { label: string; winners: number; prize: number }[];
  collected: number;
  nextConcurso: number;
  nextDate: string;
  nextEstimate: number;
  nextAccumulated: number;
  specialAccumulated: number;
  matches: { home: string; away: string; homeGoals: number; awayGoals: number }[];
};

// servicebus2.caixa.gov.br/portaldeloterias/api/<slug>[/<concurso>], only the fields read here.
export type CaixaRaw = {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[] | null;
  listaDezenasSegundoSorteio: string[] | null;
  trevosSorteados?: string[] | null;
  nomeTimeCoracaoMesSorte: string | null;
  acumulado: boolean;
  listaRateioPremio: { descricaoFaixa: string; numeroDeGanhadores: number; valorPremio: number }[];
  valorArrecadado: number;
  numeroConcursoProximo: number;
  dataProximoConcurso: string;
  valorEstimadoProximoConcurso: number;
  valorAcumuladoProximoConcurso: number;
  valorAcumuladoConcursoEspecial: number;
  listaResultadoEquipeEsportiva: { nuSequencial: number; nomeEquipeUm: string; nomeEquipeDois: string; nuGolEquipeUm: number; nuGolEquipeDois: number }[] | null;
};

// loteriascaixa-api.herokuapp.com/api/<slug>, newest first. Dupla Sena puts both draws in dezenas.
export type HistoryRow = { concurso: number; dezenas: string[]; trevos: string[]; timeCoracao: string | null; mesSorte: string | null };

// CAIXA pads empty text with NUL characters and team names with spaces before the state.
export const cleanText = (text: string | null | undefined) => (text ?? "").replace(/\u0000/g, "").replace(/\s*\/\s*/, "/").replace(/\s+/g, " ").trim();

export const resultFromCaixa = (raw: CaixaRaw): Result => ({
  concurso: raw.numero,
  date: raw.dataApuracao,
  numbers: raw.listaDezenas ?? [],
  secondNumbers: raw.listaDezenasSegundoSorteio ?? [],
  trevos: raw.trevosSorteados ?? [],
  extra: cleanText(raw.nomeTimeCoracaoMesSorte),
  isAccumulated: raw.acumulado,
  tiers: raw.listaRateioPremio.map((tier) => ({ label: tier.descricaoFaixa, winners: tier.numeroDeGanhadores, prize: tier.valorPremio })),
  collected: raw.valorArrecadado,
  nextConcurso: raw.numeroConcursoProximo,
  nextDate: raw.dataProximoConcurso,
  nextEstimate: raw.valorEstimadoProximoConcurso,
  nextAccumulated: raw.valorAcumuladoProximoConcurso,
  specialAccumulated: raw.valorAcumuladoConcursoEspecial,
  matches: [...(raw.listaResultadoEquipeEsportiva ?? [])]
    .sort((a, b) => a.nuSequencial - b.nuSequencial)
    .map((match) => ({ home: cleanText(match.nomeEquipeUm), away: cleanText(match.nomeEquipeDois), homeGoals: match.nuGolEquipeUm, awayGoals: match.nuGolEquipeDois })),
});

// Timemania always has 80 clubs, but the list changes over the years: walking back from the newest
// draw until 80 are found keeps today's list without the retired and renamed ones.
const TEAM_COUNT = 80;

const currentTeams = (rows: HistoryRow[]) => {
  const teams = new Set<string>();
  for (const row of rows) {
    if (teams.size === TEAM_COUNT) break;
    if (cleanText(row.timeCoracao)) teams.add(cleanText(row.timeCoracao));
  }
  return [...teams].sort();
};

export const historyFromRows = (game: Game, rows: HistoryRow[]): History => {
  const teams = game.extra === "time" ? currentTeams(rows) : [];
  const draws = rows.flatMap((row): Draw[] => {
    const numbers = row.dezenas.map(Number);
    if (game.id === "duplasena") return [{ concurso: row.concurso, numbers: numbers.slice(0, 6) }, { concurso: row.concurso, numbers: numbers.slice(6) }];

    let extra: number[] | undefined;
    const team = teams.indexOf(cleanText(row.timeCoracao));
    if (game.extra === "time" && team >= 0) extra = [team + 1];
    if (game.extra === "mes" && row.mesSorte) extra = [MESES.indexOf(row.mesSorte) + 1];
    if (game.extra === "trevos") extra = row.trevos.map(Number);
    return [{ concurso: row.concurso, numbers, extra }];
  });

  return { draws, teams };
};

// The history API can trail CAIXA by a draw; the newest result fills the gap.
export const withLatest = (game: Game, history: History, result: Result): Draw[] => {
  if (history.draws[0]?.concurso >= result.concurso) return history.draws;

  const numbers = result.numbers.map(Number);
  if (game.id === "duplasena") return [{ concurso: result.concurso, numbers }, { concurso: result.concurso, numbers: result.secondNumbers.map(Number) }, ...history.draws];

  let extra: number[] | undefined;
  if (game.extra === "time" && history.teams.includes(result.extra)) extra = [history.teams.indexOf(result.extra) + 1];
  if (game.extra === "mes" && MESES.includes(result.extra)) extra = [MESES.indexOf(result.extra) + 1];
  if (game.extra === "trevos") extra = result.trevos.map(Number);
  return [{ concurso: result.concurso, numbers, extra }, ...history.draws];
};

export const gameKey = (numbers: number[]) => [...numbers].sort((a, b) => a - b).join("-");

export const matchOutcome = (match: Result["matches"][number]) => (match.homeGoals > match.awayGoals ? 0 : match.homeGoals === match.awayGoals ? 1 : 2);
