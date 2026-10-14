// Models
import { GAMES, matchOutcome, type GameId, type Result } from "./lottery";

// parts[0] is the main pick: dezenas, the 7 Super Sete digits, or 14 Loteca outcomes (0 = 1, 1 = X, 2 = 2).
// extra keeps the labels as shown: the team, the month, or the trevos.
export type SavedGame = {
  id: string;
  gameId: GameId;
  concurso: number;
  superstition: string;
  numbers: number[];
  extra: string[];
  createdAt: string;
  isCoffeeDismissed: boolean;
};

export type Prize = { label: string; prize: number };

// CAIXA names tiers "5 acertos", "4 acertos + 2 trevos", "1º (14 acertos)"; the hit count is the contract.
const matchesTier = (label: string, hits: number, trevoHits: number) => {
  const match = label.match(/(\d+) acertos/);
  if (!match || Number(match[1]) !== hits) return false;

  if (label.includes("2 trevos")) return trevoHits === 2;
  if (label.includes("1 ou nenhum")) return trevoHits < 2;
  if (label.includes("1 trevo")) return trevoHits === 1;
  return true;
};

export const checkGame = (saved: SavedGame, result: Result) => {
  const game = GAMES[saved.gameId];
  const drawn = result.numbers.map(Number);
  const trevoHits = saved.extra.filter((trevo) => result.trevos.map(Number).includes(Number(trevo))).length;
  const prizes: Prize[] = [];

  let hits = saved.numbers.filter((n) => drawn.includes(n)).length;
  if (game.kind === "columns") hits = saved.numbers.filter((digit, column) => drawn[column] === digit).length;
  if (game.kind === "loteca") hits = saved.numbers.filter((outcome, i) => result.matches[i] && matchOutcome(result.matches[i]) === outcome).length;

  const isSplit = game.id === "duplasena";
  const firstTiers = isSplit ? result.tiers.slice(0, result.tiers.length / 2) : result.tiers;
  const firstTier = firstTiers.find((tier) => matchesTier(tier.label, hits, trevoHits));
  if (firstTier) prizes.push({ label: isSplit ? `1º sorteio: ${firstTier.label}` : firstTier.label, prize: firstTier.prize });

  const secondHits = saved.numbers.filter((n) => result.secondNumbers.map(Number).includes(n)).length;
  const secondTier = isSplit ? result.tiers.slice(result.tiers.length / 2).find((tier) => matchesTier(tier.label, secondHits, 0)) : undefined;
  if (secondTier) prizes.push({ label: `2º sorteio: ${secondTier.label}`, prize: secondTier.prize });

  const isExtraHit = (game.extra === "time" || game.extra === "mes") && saved.extra[0] === result.extra;
  const extraTier = isExtraHit ? result.tiers.find((tier) => !/\d+ acertos/.test(tier.label)) : undefined;
  if (extraTier) prizes.push({ label: extraTier.label, prize: extraTier.prize });

  return { hits, secondHits: isSplit ? secondHits : undefined, isExtraHit, prizes, total: prizes.reduce((sum, prize) => sum + prize.prize, 0) };
};
