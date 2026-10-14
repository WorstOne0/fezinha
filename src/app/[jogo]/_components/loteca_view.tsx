"use client";

// Next
import { useState } from "react";
// Models
import { GAMES, LOTECA_OUTCOMES } from "@/core/models";
// Components
import { SectionHeader } from "@/components";
import EffectCard from "./effect_card";
import GameActions from "./game_actions";
import SuperstitionList from "./superstition_list";
// Utils
import { LOTECA_SUPERSTITIONS, hash, pad, pickLoteca, rng, type LotecaSuperstitionId } from "@/utils";

const GAME = GAMES.loteca;

export default function LotecaView({ nextConcurso }: { nextConcurso: number }) {
  const [mode, setMode] = useState<LotecaSuperstitionId>("mandante");
  const [seed, setSeed] = useState(1);

  const superstition = LOTECA_SUPERSTITIONS[mode];
  const outcomes = pickLoteca(mode, rng(hash(`${mode}:${seed}`)));
  const items = (Object.keys(LOTECA_SUPERSTITIONS) as LotecaSuperstitionId[]).map((id) => ({ id, ...LOTECA_SUPERSTITIONS[id] }));

  return (
    <section className="flex flex-col gap-[1.6rem]">
      <SectionHeader label="Gerar um jogo" />

      <div className="flex flex-wrap items-start gap-[2rem]">
        <SuperstitionList items={items} selected={mode} onSelect={(id) => setMode(id as LotecaSuperstitionId)} />

        <div className="grow-[999] basis-[56rem] min-w-0 flex flex-col gap-[2rem]">
          <div className="surface p-[2rem] sm:p-[2.4rem] flex flex-col gap-[2rem]">
            <SectionHeader label={`Loteca · concurso ${nextConcurso}`} aside={<span className="hidden sm:inline text-[1.3rem] text-meta">{GAME.odds}</span>} />
            <div>
              <h2 className="text-[2.8rem] font-bold tracking-[-0.01em] text-title">{superstition.name}</h2>
              <p className="mt-[0.4rem] text-[1.5rem] text-meta">{superstition.line}</p>
            </div>

            <div className="flex flex-col">
              {outcomes.map((outcome, i) => (
                <div key={i} className="py-[0.8rem] flex items-center justify-between gap-[1.2rem] border-b border-line last:border-0">
                  <span className="text-[1.4rem] font-semibold text-meta">Jogo {pad(i + 1)}</span>
                  <span className="flex gap-[0.6rem]">
                    {LOTECA_OUTCOMES.map((label, j) => (
                      <span
                        key={label}
                        className={`h-[3.2rem] w-[4rem] flex items-center justify-center rounded-control border text-[1.3rem] font-bold ${j === outcome ? "border-action bg-action text-on-action" : "border-line bg-surface text-meta"}`}
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[1.3rem] text-meta">Os 14 jogos do concurso {nextConcurso} saem na programação da CAIXA. Na ordem dela, 1 é o mandante, X o empate e 2 o visitante.</p>

            <GameActions
              game={GAME}
              superstition={superstition.name}
              numbers={outcomes}
              labels={outcomes.map((outcome) => LOTECA_OUTCOMES[outcome])}
              extra={[]}
              extraText=""
              nextConcurso={nextConcurso}
              onReroll={() => setSeed(Math.floor(Math.random() * 1e9))}
            />
          </div>

          <EffectCard value="Um pouco" text="Futebol tem favorito, então aqui palpite conta. No chute puro, cravar os 14 jogos é 1 em 4.782.969." />
        </div>
      </div>
    </section>
  );
}
