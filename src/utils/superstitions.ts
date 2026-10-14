// Models
import { MESES, gameKey, type Draw, type Game, type Range } from "@/core/models";
// Utils
import { formatCount, pad } from "./format";

export type Stats = {
  all: number[];
  freq: Record<number, number>;
  delay: Record<number, number>;
  last: number[];
  recent: Set<number>;
  pastGames: Map<string, number>;
  drawCount: number;
};

export type Pick = { n: number; why: string };

// One thing to pick: the dezenas, a Super Sete column, the trevos, the team, the month.
export type Part = { label: string; range: Range; sets: Draw[]; names?: string[] };

export type PickContext = {
  range: Range;
  stats: Stats;
  random: () => number;
  windowLabel: string;
  column?: number;
  dates: string;
  name: string;
  bicho: number;
};

type Superstition = {
  name: string;
  base: string;
  line: string;
  how: string;
  real: string;
  heat?: "freq" | "delay";
  legend?: string;
  input?: "datas" | "nome" | "bicho";
  pick: (context: PickContext) => Pick[];
};

export const BICHOS = ["Avestruz", "Águia", "Burro", "Borboleta", "Cachorro", "Cabra", "Carneiro", "Camelo", "Cobra", "Coelho", "Cavalo", "Elefante", "Galo", "Gato", "Jacaré", "Leão", "Macaco", "Porco", "Pavão", "Peru", "Touro", "Tigre", "Urso", "Veado", "Vaca"];

export const buildParts = (game: Game, draws: Draw[], teams: string[]): Part[] => {
  if (game.kind === "columns") return Array.from({ length: 7 }, (_, column) => ({ label: `Coluna ${column + 1}`, range: game.main, sets: draws.map((draw) => ({ concurso: draw.concurso, numbers: [draw.numbers[column]] })) }));

  const parts: Part[] = [{ label: "Dezenas", range: game.main, sets: draws }];
  const extraSets = draws.flatMap((draw) => (draw.extra?.length ? [{ concurso: draw.concurso, numbers: draw.extra }] : []));
  if (game.extra === "time") parts.push({ label: "Time do Coração", range: { min: 1, max: teams.length, pick: 1, cols: 4, drawn: 1 }, sets: extraSets, names: teams });
  if (game.extra === "mes") parts.push({ label: "Mês de Sorte", range: { min: 1, max: 12, pick: 1, cols: 6, drawn: 1 }, sets: extraSets, names: MESES });
  if (game.extra === "trevos") parts.push({ label: "Trevos", range: { min: 1, max: 6, pick: 2, cols: 6, drawn: 2 }, sets: extraSets });
  return parts;
};

export const pickLabel = (part: Part, n: number) => (part.names ? part.names[n - 1] : part.range.max >= 10 ? pad(n) : String(n));

export const buildStats = (sets: Draw[], range: Range, window: number): Stats => {
  const all = Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);
  const freq: Record<number, number> = {};
  const delay: Record<number, number> = {};
  all.forEach((n) => {
    const since = sets.findIndex((set) => set.numbers.includes(n));
    freq[n] = 0;
    delay[n] = since < 0 ? sets.length : since;
  });
  sets.slice(0, window).forEach((set) => set.numbers.forEach((n) => freq[n]++));

  return {
    all,
    freq,
    delay,
    last: sets[0]?.numbers ?? [],
    recent: new Set(sets.slice(0, 10).flatMap((set) => set.numbers)),
    pastGames: new Map(sets.map((set) => [gameKey(set.numbers), set.concurso])),
    drawCount: sets.length,
  };
};

// Seeded, so a render is pure and the same seed gives the same game on the server and the client.
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};

const sample = (list: number[], k: number, random: () => number) => {
  const rest = [...list];
  const out: number[] = [];
  while (out.length < k && rest.length) out.push(rest.splice(Math.floor(random() * rest.length), 1)[0]);
  return out;
};

const take = (preferred: number[], c: PickContext) => {
  const first = sample(preferred, c.range.pick, c.random);
  return [...first, ...sample(c.stats.all.filter((n) => !first.includes(n)), c.range.pick - first.length, c.random)];
};

const rankBy = (c: PickContext, key: "freq" | "delay", direction: 1 | -1) => [...c.stats.all].sort((a, b) => direction * (c.stats[key][a] - c.stats[key][b]));

const poolSize = (c: PickContext) => Math.max(c.range.pick + 2, Math.round(c.stats.all.length * 0.3));

// What the crowd avoids, per Wang et al. (2016): above 31, even, round, the edges of the slip.
const crowdTags = (n: number, range: Range) => {
  if ([7, 11, 13].includes(n) || (range.max > 31 && n <= 31)) return [];

  const column = (n - range.min) % range.cols;
  return [n > 31 && "fora das datas", n % 10 === 0 && "redondo", n % 2 === 0 && "par", (column === 0 || column === range.cols - 1) && "na borda do volante"].filter((tag): tag is string => !!tag);
};

type Raw = { value: number; why: string };

// Turns derived numbers into a pick: wraps each into the range and fills the rest by chance.
const fromRaw = (raw: Raw[], c: PickContext): Pick[] => {
  const size = c.stats.all.length;
  const wrap = (value: number) => c.range.min + ((((value - c.range.min) % size) + size) % size);
  const source = c.column === undefined ? raw : raw.slice(c.column % Math.max(raw.length, 1));
  const out: Pick[] = [];
  source.forEach((item) => {
    const n = wrap(item.value);
    if (out.length < c.range.pick && !out.some((pick) => pick.n === n)) out.push({ n, why: item.why });
  });

  const rest = sample(c.stats.all.filter((n) => !out.some((pick) => pick.n === n)), c.range.pick - out.length, c.random);
  return [...out, ...rest.map((n) => ({ n, why: raw.length ? "completa o jogo" : "sem dados, foi no acaso" }))];
};

const dateRaw = (text: string): Raw[] =>
  text
    .split(/[,;]/)
    .map((part) => part.trim().split("/").map(Number))
    .filter((parts) => parts[0] > 0)
    .flatMap(([day, month, year]) => {
      const out: Raw[] = [{ value: day, why: `dia ${pad(day)}` }];
      if (month) out.push({ value: month, why: `mês ${pad(month)}` }, { value: day + month, why: `${pad(day)}/${pad(month)}: dia + mês` });
      if (year) out.push({ value: year % 100, why: `ano ${pad(year % 100)}` }, { value: day + String(year).split("").reduce((sum, digit) => sum + Number(digit), 0), why: `dia ${pad(day)} + dígitos de ${year}` });
      return out;
    });

// Pythagorean table: A=1 … I=9, J=1 …
const nameRaw = (text: string): Raw[] => {
  const letters = text.normalize("NFD").replace(/[^a-zA-Z]/g, "").toUpperCase().split("");
  let sum = 0;
  return letters.map((letter, i) => {
    sum += ((letter.charCodeAt(0) - 65) % 9) + 1;
    return { value: sum, why: `soma até a ${i + 1}ª letra (${letter}) = ${sum}` };
  });
};

// Jogo do bicho: group g owns the dezenas 4g-3 … 4g, and group 25 ends on 00.
const bichoRaw = (group: number): Raw[] =>
  [0, 1, -1, 2, -2, 3, -3].flatMap((step) => {
    const g = ((group - 1 + step + 25) % 25) + 1;
    const label = `grupo ${pad(g)} · ${BICHOS[g - 1]}`;
    return [0, 1, 2, 3].map((offset) => ({ value: (4 * g - 3 + offset) % 100, why: step ? `vizinho: ${label}` : label }));
  });

export type SuperstitionId = "surpresinha" | "quentes" | "frios" | "atrasados" | "repeteco" | "fugitivos" | "contra" | "equilibrado" | "datas" | "nome" | "sonho" | "inedito";

export const SUPERSTITIONS: Record<SuperstitionId, Superstition> = {
  surpresinha: {
    name: "Surpresinha",
    base: "Matemática",
    line: "O acaso escolhe. É o que o globo faz de qualquer jeito.",
    how: "Sorteio uniforme entre todas as dezenas, igual ao botão da lotérica.",
    real: "O jogo mais honesto que existe. A chance é a mesma de qualquer outro.",
    pick: (c) => sample(c.stats.all, c.range.pick, c.random).map((n) => ({ n, why: "puro acaso" })),
  },
  quentes: {
    name: "Quentes",
    base: "Estatística de bar",
    line: "Os que mais saíram. Tão em fase.",
    how: "Conta quantas vezes cada dezena saiu no período que você escolher e sorteia entre as que mais saíram.",
    real: "O globo não lembra do passado. Dezena quente é só uma que teve sorte até aqui.",
    heat: "freq",
    legend: "Mais escuro = saiu mais vezes no período escolhido.",
    pick: (c) => take(rankBy(c, "freq", -1).slice(0, poolSize(c)), c).map((n) => ({ n, why: `saiu ${c.stats.freq[n]}× em ${c.windowLabel}` })),
  },
  frios: {
    name: "Frios",
    base: "Folclore",
    line: "Os que menos saíram. Uma hora eles vêm.",
    how: "O contrário: sorteia entre as dezenas que menos saíram no período.",
    real: "Também não muda nada. Mas tem quem jure que é a vez delas.",
    heat: "freq",
    legend: "Mais claro = saiu menos vezes no período escolhido.",
    pick: (c) => take(rankBy(c, "freq", 1).slice(0, poolSize(c)), c).map((n) => ({ n, why: `só ${c.stats.freq[n]}× em ${c.windowLabel}` })),
  },
  atrasados: {
    name: "Atrasados",
    base: "Falácia do apostador",
    line: "Há mais sorteios sem aparecer. Tão devendo.",
    how: "Ordena as dezenas pelo número de sorteios sem sair e pega as do topo.",
    real: "É a falácia do apostador: achar que o atraso aumenta a chance. Cada sorteio começa do zero.",
    heat: "delay",
    legend: "Mais escuro = mais sorteios sem sair.",
    pick: (c) => take(rankBy(c, "delay", -1).slice(0, c.range.pick + 2), c).map((n) => ({ n, why: `${c.stats.delay[n]} sorteios sem sair` })),
  },
  repeteco: {
    name: "Repeteco",
    base: "Folclore",
    line: "Repete o último resultado. Raio cai duas vezes?",
    how: "Repete as dezenas do último sorteio e completa o resto no acaso.",
    real: "Mesma chance de sempre. A pesquisa mostra que o apostador de vez em quando adora repetir o último resultado.",
    legend: "Contorno = saiu no último sorteio.",
    pick: (c) => take(c.stats.last, c).map((n) => ({ n, why: c.stats.last.includes(n) ? "saiu no último sorteio" : "completa o jogo" })),
  },
  fugitivos: {
    name: "Fugitivos",
    base: "Folclore",
    line: "Só números que não saíram nos últimos 10 sorteios.",
    how: "Tira do volante tudo que saiu nos últimos 10 sorteios e sorteia no que sobrou.",
    real: "Nada muda. É o jeito de jogar o que ninguém acabou de ver no jornal.",
    legend: "Riscado = saiu em algum dos últimos 10 sorteios.",
    pick: (c) => take(c.stats.all.filter((n) => !c.stats.recent.has(n)), c).map((n) => ({ n, why: c.stats.recent.has(n) ? "completa o jogo" : `fora há ${c.stats.delay[n]} sorteios` })),
  },
  contra: {
    name: "Contra a multidão",
    base: "Tem paper",
    line: "Foge de datas, do 7, de sequências e de desenhos no volante.",
    how: "Dá pontos para o que o povo evita: acima de 31, par, redondo, na borda do volante. Corta o 7, o 11 e o 13.",
    real: "Não aumenta a chance de ganhar. Se sair, você divide o prêmio com menos gente.",
    legend: "Cinza = zona das datas (01 a 31), onde a multidão joga.",
    pick: (c) => {
      const ranked = c.stats.all.map((n) => ({ n, tags: crowdTags(n, c.range) })).sort((a, b) => b.tags.length - a.tags.length);
      const chosen = sample(ranked.slice(0, poolSize(c)).map((item) => item.n), c.range.pick, c.random);
      return chosen.map((n) => ({ n, why: crowdTags(n, c.range).join(" · ") || "fora do óbvio" }));
    },
  },
  equilibrado: {
    name: "Equilibrado",
    base: "Estatística de bar",
    line: "Metade par, metade ímpar, espalhado pelo volante.",
    how: "Metade par, metade ímpar, uma dezena em cada faixa do volante.",
    real: "Parece estatística e não muda nada. E o povo já espalha os números assim, então nem foge da multidão.",
    pick: (c) =>
      Array.from({ length: c.range.pick }, (_, i) => {
        const low = c.range.min + Math.floor((i * c.stats.all.length) / c.range.pick);
        const high = c.range.min + Math.floor(((i + 1) * c.stats.all.length) / c.range.pick) - 1;
        const band = c.stats.all.filter((n) => n >= low && n <= high);
        const parity = band.filter((n) => (n % 2 === 0) === (i % 2 === 0));
        const n = sample(parity.length ? parity : band, 1, c.random)[0];
        return { n, why: `${n % 2 === 0 ? "par" : "ímpar"} · faixa ${pad(low)}–${pad(high)}` };
      }),
  },
  datas: {
    name: "Datas especiais",
    base: "Folclore",
    line: "Aniversários, casamento, o dia do penta.",
    how: "Tira dia, mês, ano e somas das datas que você digitar.",
    real: "Mesma chance, prêmio pior: datas vão só até 31, e é ali que todo mundo joga.",
    input: "datas",
    pick: (c) => fromRaw(dateRaw(c.dates), c),
  },
  nome: {
    name: "Numerologia",
    base: "Esoterismo",
    line: "Seu nome vira número pela tabela pitagórica.",
    how: "Cada letra do nome vira um número (A=1 … I=9, J=1 …), e as somas viram dezenas.",
    real: "Seu nome não conhece o globo. Mas é bonito.",
    input: "nome",
    pick: (c) => fromRaw(nameRaw(c.name), c),
  },
  sonho: {
    name: "Sonhei com…",
    base: "Tradição",
    line: "A tabela do bicho: sonhou com cobra, joga 33 a 36.",
    how: "Tabela do jogo do bicho: cada bicho tem 4 dezenas. Sonhou com cobra (grupo 9)? 33, 34, 35 e 36, e completa com os bichos vizinhos.",
    real: "Tradição pura. Chance igual a qualquer outro jogo.",
    input: "bicho",
    pick: (c) => fromRaw(bichoRaw(c.bicho), c),
  },
  inedito: {
    name: "Inédito",
    base: "Matemática",
    line: "Um jogo que nunca saiu na história. (Quase todos.)",
    how: "Sorteia até achar um jogo que nunca saiu inteiro na história do concurso.",
    real: "Quase todo jogo é inédito: a Mega-Sena tem mais de 50 milhões de combinações e só alguns milhares de concursos.",
    pick: (c) => {
      let numbers = sample(c.stats.all, c.range.pick, c.random);
      for (let tries = 0; tries < 50 && c.stats.pastGames.has(gameKey(numbers)); tries++) numbers = sample(c.stats.all, c.range.pick, c.random);

      const isNew = !c.stats.pastGames.has(gameKey(numbers));
      return numbers.map((n) => ({ n, why: isNew ? `fora dos ${formatCount(c.stats.drawCount)} resultados` : "puro acaso" }));
    },
  },
};

export const SUPERSTITION_IDS = Object.keys(SUPERSTITIONS) as SuperstitionId[];

export const LOTECA_SUPERSTITIONS = {
  surpresinha: { name: "Surpresinha", base: "Matemática", line: "O acaso crava 1, X ou 2 em cada jogo.", weights: [1, 1, 1] },
  mandante: { name: "Em casa ninguém perde", base: "Folclore", line: "Coluna 1 em quase tudo. A torcida empurra.", weights: [8, 1, 1] },
  zebra: { name: "Dia de zebra", base: "Folclore", line: "Visitante em quase tudo. Hoje é dia.", weights: [1, 1, 8] },
  empate: { name: "Empate é tradição", base: "Folclore", line: "Meio em quase tudo. Clássico é clássico.", weights: [1, 8, 1] },
};

export type LotecaSuperstitionId = keyof typeof LOTECA_SUPERSTITIONS;

export const pickLoteca = (id: LotecaSuperstitionId, random: () => number) => {
  const [home, draw, away] = LOTECA_SUPERSTITIONS[id].weights;
  return Array.from({ length: 14 }, () => {
    const roll = random() * (home + draw + away);
    return roll < home ? 0 : roll < home + draw ? 1 : 2;
  });
};
