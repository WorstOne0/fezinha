// Next
import type { Metadata } from "next";
import Link from "next/link";
// Models
import { GAME_IDS, GAMES } from "@/core/models";
// Services
import { getLatestResult } from "@/services";
// Components
import { Footer, SectionHeader } from "@/components";
// Utils
import { formatMillions, formatWeekday, gameStyle } from "@/utils";

export const revalidate = 600;

export const metadata: Metadata = { title: "Os jogos", description: "Todos os jogos das Loterias CAIXA com o prêmio estimado e a data do próximo concurso." };

export default async function JogosPage() {
  const results = await Promise.all(GAME_IDS.map((id) => getLatestResult(GAMES[id])));

  return (
    <>
      <main className="w-full max-w-[128rem] mx-auto px-[1.6rem] sm:px-[2.4rem] pt-[9.6rem] pb-[4rem] flex flex-col gap-[2.4rem]">
        <div className="max-w-[72rem]">
          <h1 className="text-[3.4rem] leading-[1.15] font-bold tracking-[-0.01em] text-title">Os jogos</h1>
          <p className="mt-[0.6rem] text-[1.5rem] leading-[1.6] text-meta">Todos os jogos das Loterias CAIXA, com o prêmio do próximo concurso. Escolha um e ele pinta o site com a cor dele.</p>
        </div>
        <SectionHeader label={`${GAME_IDS.length} jogos`} aside={<span className="text-[1.3rem] text-meta">fonte: Loterias CAIXA</span>} />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(28rem,1fr))] gap-[1.6rem]">
          {GAME_IDS.map((id, i) => {
            const game = GAMES[id];
            const result = results[i];
            const isFederal = game.kind === "federal";
            const prize = isFederal ? result?.tiers[0]?.prize : result?.nextEstimate;
            return (
              <Link key={id} href={`/${game.path}`} data-game={id} style={gameStyle(game)} className="surface surface-interactive p-[2rem] flex flex-col gap-[1.6rem]">
                <div className="flex items-center gap-[1.2rem]">
                  <span className="h-[4.4rem] w-[4.4rem] flex items-center justify-center shrink-0 rounded-full bg-action text-on-action text-[1.6rem] font-extrabold">{game.name.replace("+", "").charAt(0)}</span>
                  <div className="min-w-0">
                    <h2 className="text-[1.8rem] font-bold text-title">{game.name}</h2>
                    <p className="text-[1.3rem] text-meta">{game.format}</p>
                  </div>
                </div>

                <div className="pt-[1.4rem] flex justify-between gap-[1.6rem] border-t border-line">
                  <div className="min-w-0">
                    <span className="label">{isFederal ? "1º prêmio" : "Prêmio estimado"}</span>
                    <p className="mt-[0.4rem] text-[2.2rem] font-bold text-action">{prize ? formatMillions(prize) : "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="label">Concurso {result?.nextConcurso ?? ""}</span>
                    <p className="mt-[0.6rem] text-[1.4rem] font-semibold text-body first-letter:uppercase">{result?.nextDate ? `${formatWeekday(result.nextDate).split("-")[0]}, ${result.nextDate.slice(0, 5)}` : "a confirmar"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-[1.2rem] text-[1.3rem]">
                  <span className="text-meta">Chance: {game.odds}</span>
                  <span className="font-semibold text-action">{isFederal ? "Ver resultado →" : "Gerar →"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
