// Next
import type { Metadata } from "next";
import Link from "next/link";
// Components
import { Footer, SectionHeader } from "@/components";
// Utils
import { LOTECA_SUPERSTITIONS, SUPERSTITIONS, SUPERSTITION_IDS } from "@/utils";

export const metadata: Metadata = { title: "As superstições", description: "Como cada superstição escolhe os números e o que ela faz de verdade com as suas chances." };

const FINDINGS = [
  { title: "Datas lotam o 1 ao 31", text: "Dia do aniversário é o número pessoal mais escolhido, seguido de ano, mês e idade." },
  { title: "Números pequenos ganham", text: "Quanto menor o número, mais gente marca." },
  { title: "O 7 e o 11 são campeões", text: "Os números da sorte aparecem bem acima do esperado." },
  { title: "Ímpar, primo e quebrado", text: "São preferidos aos pares, aos não primos e aos redondos como 10, 20 e 30." },
  { title: "O meio do volante", text: "Números no centro do volante são mais marcados que os da borda." },
  { title: "Desenhos no volante", text: "Sequências, colunas e diagonais aparecem muito mais do que o acaso explicaria." },
];

const SOURCES = [
  "Wang, Potter van Loon, van den Assem e van Dolder (2016). Number preferences in lotteries. Judgment and Decision Making 11(3).",
  "Henze (1997). A statistical and probabilistic analysis of popular lottery tickets. Statistica Neerlandica 51(2).",
  "Simon (1998). An analysis of the distribution of combinations chosen by UK National Lottery players. Journal of Risk and Uncertainty 17(3).",
];

export default function SupersticoesPage() {
  return (
    <>
      <main className="w-full max-w-[128rem] mx-auto px-[1.6rem] sm:px-[2.4rem] pt-[9.6rem] pb-[4.8rem] flex flex-col gap-[2.8rem]">
        <div className="max-w-[72rem]">
          <h1 className="text-[3.4rem] leading-[1.15] font-bold tracking-[-0.01em] text-title">As superstições</h1>
          <p className="mt-[0.8rem] text-[1.6rem] leading-[1.65] text-body">
            Cada uma está aqui pela graça. O cartão diz como ela escolhe os números e o que ela faz de verdade com as suas chances. Spoiler: nada. Só uma mexe no tamanho do prêmio.
          </p>
        </div>

        <div className="surface p-[2rem] sm:p-[2.4rem] flex flex-wrap gap-x-[4rem] gap-y-[2.4rem]">
          <div className="grow basis-[30rem] min-w-0">
            <span className="h-[2.4rem] px-[0.8rem] inline-flex items-center rounded-[0.4rem] bg-action text-on-action text-[1.1rem] font-bold uppercase tracking-[0.06em]">Tem paper</span>
            <h2 className="mt-[1.2rem] text-[2.2rem] leading-[1.3] font-bold text-title">O que a pesquisa diz sobre como o povo joga</h2>
            <p className="mt-[0.8rem] text-[1.5rem] leading-[1.65] text-body">
              Ninguém consegue prever o globo. Mas dá pra prever o apostador. Se você joga o que pouca gente joga e acerta, divide o prêmio com menos gente. É isso que a Contra a multidão faz.
            </p>
            <p className="mt-[1.2rem] text-[1.3rem] leading-[1.6] text-meta">Os estudos são de loterias da Alemanha, do Reino Unido e da Holanda. Não achamos um estudo da Mega-Sena.</p>
          </div>
          <div className="grow-[2] basis-[52rem] min-w-0 grid grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-x-[2.4rem]">
            {FINDINGS.map((finding) => (
              <div key={finding.title} className="py-[1.2rem] border-b border-line">
                <h3 className="text-[1.5rem] font-semibold text-title">{finding.title}</h3>
                <p className="mt-[0.4rem] text-[1.3rem] leading-[1.5] text-meta">{finding.text}</p>
              </div>
            ))}
          </div>
          <ul className="basis-full flex flex-col gap-[0.4rem] text-[1.3rem] leading-[1.6] text-meta">
            {SOURCES.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>

        <section className="flex flex-col gap-[1.4rem]">
          <SectionHeader label={`${SUPERSTITION_IDS.length} superstições`} aside={<span className="text-[1.3rem] text-meta">valem para todos os jogos de números</span>} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(30rem,1fr))] gap-[1.6rem]">
            {SUPERSTITION_IDS.map((id) => {
              const superstition = SUPERSTITIONS[id];
              return (
                <article key={id} className="surface p-[2rem] flex flex-col gap-[1.4rem]">
                  <div className="flex items-start justify-between gap-[1.2rem]">
                    <h3 className="text-[1.8rem] font-bold text-title">{superstition.name}</h3>
                    <span className={`h-[2.2rem] px-[0.8rem] flex items-center shrink-0 rounded-[0.4rem] text-[1rem] font-bold uppercase tracking-[0.06em] ${superstition.base === "Tem paper" ? "bg-action text-on-action" : "bg-surface-3 text-meta"}`}>
                      {superstition.base}
                    </span>
                  </div>
                  <div>
                    <span className="label">Como escolhe</span>
                    <p className="mt-[0.4rem] text-[1.4rem] leading-[1.55] text-body">{superstition.how}</p>
                  </div>
                  <div className="pt-[1.2rem] border-t border-line">
                    <span className="label">Na real</span>
                    <p className="mt-[0.4rem] text-[1.4rem] leading-[1.55] text-body">{superstition.real}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-[1.4rem]">
          <SectionHeader label="Loteca · superstições de arquibancada" aside={<span className="text-[1.3rem] text-meta">1, X ou 2 em cada jogo</span>} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(26rem,1fr))] gap-[1.6rem]">
            {Object.values(LOTECA_SUPERSTITIONS).map((superstition) => (
              <article key={superstition.name} className="surface p-[2rem]">
                <h3 className="text-[1.6rem] font-bold text-title">{superstition.name}</h3>
                <p className="mt-[0.6rem] text-[1.4rem] leading-[1.55] text-body">{superstition.line}</p>
              </article>
            ))}
          </div>
        </section>

        <Link href="/mega-sena" className="self-start h-[4.8rem] px-[2rem] flex items-center rounded-control bg-action hover:bg-action-hover text-on-action text-[1.6rem] font-bold">
          Gerar um jogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
