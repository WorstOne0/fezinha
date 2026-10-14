"use client";

// Next
import { useMemo, useState } from "react";
// Models
import { GAMES, gameKey, type Draw, type GameId } from "@/core/models";
// Components
import { SectionHeader } from "@/components";
import EffectCard from "./effect_card";
import GameActions from "./game_actions";
import NumberGrid from "./number_grid";
import SuperstitionList from "./superstition_list";
// Utils
import { BICHOS, SUPERSTITIONS, SUPERSTITION_IDS, buildParts, buildStats, formatCount, hash, pad, pickLabel, rng, type SuperstitionId } from "@/utils";

const WINDOWS = [
  { value: 100, label: "Últimos 100" },
  { value: 500, label: "Últimos 500" },
  { value: Infinity, label: "Todos" },
];

const INPUT = "h-[4.4rem] px-[1.2rem] rounded-control border border-line bg-surface-2 text-title text-[1.5rem] outline-none focus:border-action";
const PILL = "rounded-control border font-semibold cursor-pointer";
const PILL_ON = "border-action bg-action-tint text-action";
const PILL_OFF = "border-line bg-surface text-body hover:bg-surface-2";
const REASONS_SHOWN = 15;

export default function GeneratorView({ gameId, draws, teams, nextConcurso }: { gameId: GameId; draws: Draw[]; teams: string[]; nextConcurso: number }) {
  const [mode, setMode] = useState<SuperstitionId>("atrasados");
  const [seed, setSeed] = useState(1);
  const [windowSize, setWindowSize] = useState(100);
  const [dates, setDates] = useState("14/02/1992, 30/06/2002");
  const [name, setName] = useState("Maria Aparecida");
  const [bicho, setBicho] = useState(9);

  const game = GAMES[gameId];
  const isColumns = game.kind === "columns";
  const superstition = SUPERSTITIONS[mode];
  const parts = useMemo(() => buildParts(game, draws, teams), [game, draws, teams]);
  const partStats = useMemo(() => parts.map((part) => buildStats(part.sets, part.range, windowSize)), [parts, windowSize]);

  const random = rng(hash([game.id, mode, seed, windowSize, dates, name, bicho].join(":")));
  const windowLabel = `${formatCount(Math.min(windowSize, draws.length))} sorteios`;
  const picked = parts.map((part, i) => ({
    part,
    stats: partStats[i],
    picks: superstition.pick({ range: part.range, stats: partStats[i], random, windowLabel, column: isColumns ? i : undefined, dates, name, bicho }).sort((a, b) => a.n - b.n),
  }));

  const main = picked[0];
  const extras = isColumns ? [] : picked.slice(1);
  const balls = isColumns ? picked.map((item, i) => ({ label: String(item.picks[0].n), caption: `col. ${i + 1}` })) : main.picks.map((pick) => ({ label: pickLabel(main.part, pick.n), caption: "" }));
  const numbers = isColumns ? picked.map((item) => item.picks[0].n) : main.picks.map((pick) => pick.n);
  const extraLabels = extras.flatMap((item) => item.picks.map((pick) => pickLabel(item.part, pick.n)));
  const extraText = extras.map((item) => `${item.part.label}: ${item.picks.map((pick) => pickLabel(item.part, pick.n)).join(" e ")}`).join(" · ");
  const reasons = picked.flatMap((item, i) => item.picks.map((pick) => ({ key: `${i}-${pick.n}`, label: pickLabel(item.part, pick.n), why: i === 0 && !isColumns ? pick.why : `${item.part.label}: ${pick.why}` })));

  const canRepeat = !isColumns && main.part.range.pick === main.part.range.drawn;
  const repeatedIn = canRepeat ? main.stats.pastGames.get(gameKey(numbers)) : undefined;
  const ballSize = balls.length <= 7 ? "h-[6rem] w-[6rem] text-[2.2rem]" : balls.length <= 15 ? "h-[4.8rem] w-[4.8rem] text-[1.8rem]" : "h-[3.8rem] w-[3.8rem] text-[1.4rem]";

  let effect = "Zero";
  let effectText = `Todo jogo simples da ${game.name} tem ${game.odds}, com ou sem superstição. O globo não lembra do passado.`;
  if (mode === "contra") {
    effect = "Zero na chance. Mais no prêmio.";
    effectText = "Não aumenta a chance de ganhar. Muda quanto você leva: quase ninguém joga esses números, então se sair, você divide o prêmio com menos gente. É a única superstição daqui com pesquisa por trás.";
  }
  if (mode === "datas" && game.main.max > 31) {
    effect = "Zero. E divide mais.";
    effectText = "Mesma chance de sempre, prêmio pior: datas só vão até 31, e é ali que a multidão joga. Se sair, você racha com muita gente.";
  }

  const buildInput = () => {
    if (superstition.input === "datas")
      return (
        <label className="flex flex-col gap-[0.6rem]">
          <span className="label">Suas datas · dd/mm/aaaa, separadas por vírgula</span>
          <input value={dates} onChange={(event) => setDates(event.target.value)} className={INPUT} />
        </label>
      );

    if (superstition.input === "nome")
      return (
        <label className="flex flex-col gap-[0.6rem]">
          <span className="label">Seu nome completo</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={INPUT} />
        </label>
      );

    if (superstition.input === "bicho")
      return (
        <div className="flex flex-col gap-[0.8rem]">
          <span className="label">Sonhou com qual bicho?</span>
          <div className="flex flex-wrap gap-[0.6rem]">
            {BICHOS.map((animal, i) => (
              <button key={animal} type="button" onClick={() => setBicho(i + 1)} className={`h-[3.2rem] px-[1rem] text-[1.3rem] ${PILL} ${bicho === i + 1 ? PILL_ON : PILL_OFF}`}>
                {pad(i + 1)} {animal}
              </button>
            ))}
          </div>
        </div>
      );

    if (superstition.heat === "freq")
      return (
        <div className="flex flex-wrap gap-[0.6rem]" role="group" aria-label="Período">
          {WINDOWS.map((window) => (
            <button key={window.label} type="button" onClick={() => setWindowSize(window.value)} className={`h-[3.6rem] px-[1.4rem] text-[1.4rem] ${PILL} ${windowSize === window.value ? PILL_ON : PILL_OFF}`}>
              {window.label}
            </button>
          ))}
        </div>
      );

    return null;
  };

  return (
    <section className="flex flex-col gap-[1.6rem]">
      <SectionHeader label="Gerar um jogo" aside={<span className="text-[1.3rem] text-meta">{formatCount(draws.length)} sorteios de histórico</span>} />

      <div className="flex flex-wrap items-start gap-[2rem]">
        <SuperstitionList items={SUPERSTITION_IDS.map((id) => ({ id, ...SUPERSTITIONS[id] }))} selected={mode} onSelect={(id) => setMode(id as SuperstitionId)} />

        <div className="grow-[999] basis-[56rem] min-w-0 flex flex-col gap-[2rem]">
          <div className="surface p-[2rem] sm:p-[2.4rem] flex flex-col gap-[2rem]">
            <SectionHeader label={`${game.name} · ${game.format}`} aside={<span className="hidden sm:inline text-[1.3rem] text-meta">{game.odds}</span>} />
            <div>
              <h2 className="text-[2.8rem] font-bold tracking-[-0.01em] text-title">{superstition.name}</h2>
              <p className="mt-[0.4rem] text-[1.5rem] text-meta">{superstition.line}</p>
            </div>

            {buildInput()}

            <div className="flex flex-wrap gap-[1rem]">
              {balls.map((ball, i) => (
                <span key={`${ball.label}-${i}`} className="flex flex-col items-center gap-[0.4rem]">
                  <span className={`flex items-center justify-center rounded-full bg-action text-on-action font-bold ${ballSize}`}>{ball.label}</span>
                  {ball.caption && <span className="text-[1.1rem] text-meta">{ball.caption}</span>}
                </span>
              ))}
            </div>

            {extras.length > 0 && (
              <div className="flex flex-wrap gap-[0.8rem]">
                {extras.map((item) => (
                  <span key={item.part.label} className="h-[3.6rem] px-[1.2rem] flex items-center gap-[0.8rem] rounded-control border border-line bg-surface-2 text-[1.4rem]">
                    <span className="label">{item.part.label}</span>
                    <span className="font-bold text-title">{item.picks.map((pick) => pickLabel(item.part, pick.n)).join(" e ")}</span>
                  </span>
                ))}
              </div>
            )}

            {canRepeat && (
              <p className="text-[1.3rem] text-meta">
                {repeatedIn ? `Esse jogo já saiu inteiro no concurso ${repeatedIn}.` : `Esse jogo nunca saiu inteiro em ${formatCount(main.stats.drawCount)} sorteios.`}
              </p>
            )}

            <GameActions
              game={game}
              superstition={superstition.name}
              numbers={numbers}
              labels={balls.map((ball) => ball.label)}
              extra={extraLabels}
              extraText={extraText}
              nextConcurso={nextConcurso}
              onReroll={() => setSeed(Math.floor(Math.random() * 1e9))}
            />
          </div>

          <div className="surface p-[2rem] sm:px-[2.4rem] flex flex-col gap-[0.4rem]">
            <SectionHeader label="Por que esses números" aside={reasons.length > REASONS_SHOWN && <span className="text-[1.3rem] text-meta">e mais {reasons.length - REASONS_SHOWN}</span>} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(26rem,1fr))] gap-x-[2.4rem]">
              {reasons.slice(0, REASONS_SHOWN).map((reason) => (
                <div key={reason.key} className="py-[1rem] flex items-center gap-[1.2rem] border-b border-line">
                  <span className="h-[3.2rem] min-w-[3.2rem] px-[0.8rem] flex items-center justify-center shrink-0 rounded-full bg-action-tint text-action text-[1.3rem] font-bold">{reason.label}</span>
                  <span className="text-[1.4rem] text-body">{reason.why}</span>
                </div>
              ))}
            </div>
          </div>

          <NumberGrid
            sections={(isColumns ? picked : [main]).map((item, i) => ({ label: isColumns ? `Col. ${i + 1}` : undefined, range: item.part.range, stats: item.stats, chosen: new Set(item.picks.map((pick) => pick.n)) }))}
            mode={mode}
            heat={superstition.heat}
            legend={superstition.legend}
          />

          <EffectCard value={effect} text={effectText} hasSources={mode === "contra"} />
        </div>
      </div>
    </section>
  );
}
