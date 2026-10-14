// Models
import type { Game, Result } from "@/core/models";
// Components
import { SectionHeader } from "@/components";
// Utils
import { formatBRL, formatCount, formatMillions, formatWeekday } from "@/utils";
// Icons
import { MdOutlineCelebration, MdOutlineEvent, MdOutlinePayments } from "react-icons/md";

const CHIP = "h-[3.6rem] px-[1.2rem] flex items-center gap-[0.8rem] rounded-control border border-line bg-surface-2 text-[1.4rem]";

// The real numbers from CAIXA: next draw, its estimated prize, and how the last one paid out.
export default function DrawSummary({ game, result }: { game: Game; result: Result }) {
  const isFederal = game.kind === "federal";
  const ballSize = result.numbers.length <= 7 ? "h-[5.2rem] w-[5.2rem] text-[1.9rem]" : result.numbers.length <= 15 ? "h-[4.4rem] w-[4.4rem] text-[1.6rem]" : "h-[3.8rem] w-[3.8rem] text-[1.4rem]";

  const tiles = [{ label: "Próximo concurso", icon: <MdOutlineEvent size={18} />, value: String(result.nextConcurso), detail: result.nextDate ? `${formatWeekday(result.nextDate)}, ${result.nextDate}` : "data a confirmar", isHighlight: false }];
  if (result.nextEstimate > 0) tiles.push({ label: "Prêmio estimado", icon: <MdOutlinePayments size={18} />, value: formatMillions(result.nextEstimate), detail: result.nextAccumulated > 0 ? `acumulado ${formatMillions(result.nextAccumulated)}` : "sem acúmulo do anterior", isHighlight: true });
  if (isFederal && result.tiers[0]) tiles.push({ label: "1º prêmio", icon: <MdOutlinePayments size={18} />, value: formatMillions(result.tiers[0].prize), detail: "por bilhete inteiro", isHighlight: true });
  if (game.special && result.specialAccumulated > 0) tiles.push({ label: game.special, icon: <MdOutlineCelebration size={18} />, value: formatMillions(result.specialAccumulated), detail: "acumulado para o concurso especial", isHighlight: false });

  const buildBalls = (numbers: string[], caption?: string) => (
    <div className="flex flex-col gap-[0.8rem]">
      {caption && <span className="label">{caption}</span>}
      <div className="flex flex-wrap gap-[0.8rem]">
        {numbers.map((number, i) => (
          <span key={`${number}-${i}`} className="flex flex-col items-center gap-[0.4rem]">
            <span className={`flex items-center justify-center rounded-full border-2 border-action text-action font-bold ${ballSize}`}>{number}</span>
            {game.kind === "columns" && <span className="text-[1.1rem] text-meta">col. {i + 1}</span>}
          </span>
        ))}
      </div>
    </div>
  );

  const buildDrawn = () => {
    if (game.kind === "loteca")
      return (
        <div className="flex flex-col">
          {result.matches.map((match, i) => (
            <div key={i} className="py-[0.8rem] flex items-center gap-[1.2rem] border-b border-line last:border-0 text-[1.4rem]">
              <span className="w-[2.4rem] shrink-0 text-meta">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 min-w-0 truncate text-right text-title">{match.home}</span>
              <span className="w-[6.4rem] shrink-0 text-center font-bold text-action">
                {match.homeGoals} × {match.awayGoals}
              </span>
              <span className="flex-1 min-w-0 truncate text-title">{match.away}</span>
            </div>
          ))}
        </div>
      );

    if (isFederal) return null;

    return (
      <>
        {buildBalls(result.numbers, result.secondNumbers.length ? "1º sorteio" : undefined)}
        {result.secondNumbers.length > 0 && buildBalls(result.secondNumbers, "2º sorteio")}
        {(result.extra || result.trevos.length > 0) && (
          <div className="flex flex-wrap gap-[0.8rem]">
            {result.extra && (
              <span className={CHIP}>
                <span className="label">{game.extra === "time" ? "Time do Coração" : "Mês de Sorte"}</span>
                <span className="font-bold text-title">{result.extra}</span>
              </span>
            )}
            {result.trevos.length > 0 && (
              <span className={CHIP}>
                <span className="label">Trevos</span>
                <span className="font-bold text-title">{result.trevos.join(" e ")}</span>
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <section className="flex flex-col gap-[1.6rem]">
      <SectionHeader label={`${game.name} agora`} aside={<span className="text-[1.3rem] text-meta">fonte: Loterias CAIXA</span>} />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(26rem,1fr))] gap-[1.6rem]">
        {tiles.map((tile) => (
          <div key={tile.label} className="surface p-[2rem] flex flex-col gap-[0.8rem]">
            <span className="flex items-center justify-between text-soft">
              <span className="label">{tile.label}</span>
              {tile.icon}
            </span>
            <span className={`text-[2.6rem] leading-[1.2] font-bold ${tile.isHighlight ? "text-action" : "text-title"}`}>{tile.value}</span>
            <span className="text-[1.3rem] text-meta first-letter:uppercase">{tile.detail}</span>
          </div>
        ))}
      </div>

      <div className="surface p-[2rem] sm:p-[2.4rem] flex flex-wrap items-start gap-x-[4rem] gap-y-[2.4rem]">
        <div className="grow basis-[36rem] min-w-0 flex flex-col gap-[1.6rem]">
          <SectionHeader
            label={`Concurso ${result.concurso} · ${result.date}`}
            aside={result.isAccumulated && <span className="h-[2.4rem] px-[0.8rem] flex items-center rounded-[0.4rem] bg-attention-soft text-attention text-[1.1rem] font-bold uppercase tracking-[0.06em]">Acumulou</span>}
          />
          {buildDrawn()}
          {result.collected > 0 && <p className="text-[1.3rem] text-meta">Arrecadação {formatBRL(result.collected)}</p>}
        </div>

        <table className="grow basis-[36rem] text-[1.4rem]">
          <thead>
            <tr className="border-b border-line">
              <th className="label pb-[0.8rem] text-left">{isFederal ? "Prêmio" : "Faixa"}</th>
              <th className="label pb-[0.8rem] text-right">{isFederal ? "Bilhete" : "Ganhadores"}</th>
              <th className="label pb-[0.8rem] text-right">{isFederal ? "Valor" : "Prêmio por aposta"}</th>
            </tr>
          </thead>
          <tbody>
            {result.tiers.map((tier, i) => (
              <tr key={`${tier.label}-${i}`} className="border-b border-line last:border-0">
                <td className="py-[1rem] font-semibold text-title">{isFederal ? `${i + 1}º prêmio` : tier.label}</td>
                <td className="py-[1rem] text-right text-body">{isFederal ? result.numbers[i] : tier.winners ? formatCount(tier.winners) : "Ninguém"}</td>
                <td className="py-[1rem] text-right font-semibold text-title">{tier.winners ? formatBRL(tier.prize) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
