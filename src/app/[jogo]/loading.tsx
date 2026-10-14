// Components
import { SectionHeader } from "@/components";

const BLOCK = "rounded-control bg-surface-3 animate-pulse";

// Skeleton of the page below the game strip: the values, the last result, then the generator.
export default function GameLoading() {
  return (
    <div className="flex flex-col gap-[3.2rem]" aria-busy="true" aria-label="Carregando resultados">
      <section className="flex flex-col gap-[1.6rem]">
        <SectionHeader label="Buscando na CAIXA…" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(26rem,1fr))] gap-[1.6rem]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface p-[2rem] flex flex-col gap-[1.2rem]">
              <span className={`h-[1.2rem] w-[12rem] ${BLOCK}`} />
              <span className={`h-[3rem] w-[18rem] ${BLOCK}`} />
              <span className={`h-[1.2rem] w-[14rem] ${BLOCK}`} />
            </div>
          ))}
        </div>
        <div className="surface p-[2rem] sm:p-[2.4rem] flex flex-wrap gap-x-[4rem] gap-y-[2.4rem]">
          <div className="grow basis-[36rem] flex flex-col gap-[1.6rem]">
            <span className={`h-[1.4rem] w-[20rem] ${BLOCK}`} />
            <div className="flex flex-wrap gap-[0.8rem]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="h-[5.2rem] w-[5.2rem] rounded-full bg-surface-3 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grow basis-[36rem] flex flex-col gap-[1.2rem]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-[2.4rem] w-full ${BLOCK}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[1.6rem]">
        <SectionHeader label="Gerar um jogo" />
        <div className="flex flex-wrap items-start gap-[2rem]">
          <div className="grow basis-[34rem] surface p-[1.6rem] flex flex-col gap-[1.2rem]">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`h-[5.6rem] w-full ${BLOCK}`} />
            ))}
          </div>
          <div className="grow-[999] basis-[56rem] surface p-[2rem] sm:p-[2.4rem] flex flex-col gap-[2rem]">
            <span className={`h-[3.2rem] w-[22rem] ${BLOCK}`} />
            <div className="flex flex-wrap gap-[1rem]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="h-[6rem] w-[6rem] rounded-full bg-surface-3 animate-pulse" />
              ))}
            </div>
            <span className={`h-[4.8rem] w-[28rem] ${BLOCK}`} />
          </div>
        </div>
      </section>
    </div>
  );
}
