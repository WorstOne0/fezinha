"use client";

// Next
import Link from "next/link";
// Controllers
import { useSavedGamesController } from "@/core/controllers";
// Models
import { GAMES, LOTECA_OUTCOMES, checkGame, matchOutcome, type Result, type SavedGame } from "@/core/models";
// Hooks
import { useApiFetch } from "@/hooks";
// Utils
import { formatBRL, gameStyle, pad } from "@/utils";
// Icons
import { MdOutlineCoffee, MdOutlineDeleteOutline } from "react-icons/md";

const STATUS = "h-[2.4rem] px-[0.8rem] flex items-center shrink-0 rounded-[0.4rem] text-[1.1rem] font-bold uppercase tracking-[0.06em]";

export default function SavedGameCard({ saved }: { saved: SavedGame }) {
  const removeGame = useSavedGamesController((state) => state.removeGame);
  const dismissCoffee = useSavedGamesController((state) => state.dismissCoffee);

  const game = GAMES[saved.gameId];
  const { data: result, isLoading, error, refresh } = useApiFetch<Result | null>(`/api/resultado/${saved.gameId}/${saved.concurso}`);
  const check = result ? checkGame(saved, result) : null;
  const drawn = result ? [...result.numbers, ...result.secondNumbers].map(Number) : [];

  const isHit = (n: number, i: number) => {
    if (!result) return false;
    if (game.kind === "columns") return Number(result.numbers[i]) === n;
    if (game.kind === "loteca") return !!result.matches[i] && matchOutcome(result.matches[i]) === n;
    return drawn.includes(n);
  };

  const label = (n: number) => (game.kind === "loteca" ? LOTECA_OUTCOMES[n] : game.main.max >= 10 ? pad(n) : String(n));
  const tone = (isMatch: boolean) => (!result ? "bg-action-tint text-action" : isMatch ? "bg-action text-on-action" : "bg-surface-2 text-muted");
  const extraLabel = game.extra === "time" ? "Time do Coração" : game.extra === "mes" ? "Mês de Sorte" : "Trevos";
  const isExtraHit = (value: string) => !!result && (game.extra === "trevos" ? result.trevos.map(Number).includes(Number(value)) : value === result.extra);

  const buildStatus = () => {
    if (isLoading) return <span className={`${STATUS} bg-surface-3 text-meta`}>Conferindo…</span>;
    if (error)
      return (
        <button type="button" onClick={() => refresh()} className={`${STATUS} bg-negative-soft text-negative cursor-pointer`}>
          Tentar de novo
        </button>
      );
    if (!check) return <span className={`${STATUS} bg-surface-3 text-meta`}>Aguardando sorteio</span>;
    if (check.total > 0) return <span className={`${STATUS} bg-action text-on-action`}>Ganhou {formatBRL(check.total)}</span>;
    return <span className={`${STATUS} bg-surface-3 text-meta`}>{check.hits} {check.hits === 1 ? "acerto" : "acertos"}</span>;
  };

  return (
    <article data-game={game.id} style={gameStyle(game)} className={`surface p-[2rem] flex flex-col gap-[1.4rem] ${check && check.total > 0 ? "outline-2 outline-action" : ""}`}>
      <div className="flex items-start justify-between gap-[1.2rem]">
        <div className="min-w-0">
          <div className="flex items-center gap-[0.8rem]">
            <span className="h-[1rem] w-[1rem] shrink-0 rounded-full bg-action" />
            <span className="text-[1.6rem] font-bold text-title">{game.name}</span>
          </div>
          <p className="mt-[0.2rem] text-[1.3rem] text-meta">
            {saved.superstition} · concurso {saved.concurso}
          </p>
        </div>
        {buildStatus()}
      </div>

      <div className="flex flex-wrap gap-[0.6rem]">
        {saved.numbers.map((n, i) => (
          <span key={`${n}-${i}`} className={`h-[3.6rem] min-w-[3.6rem] px-[0.4rem] flex items-center justify-center rounded-full text-[1.4rem] font-bold ${tone(isHit(n, i))}`}>
            {label(n)}
          </span>
        ))}
      </div>

      {saved.extra.length > 0 && (
        <div className="flex flex-wrap items-center gap-[0.6rem]">
          <span className="label">{extraLabel}</span>
          {saved.extra.map((value) => (
            <span key={value} className={`h-[2.8rem] px-[1rem] flex items-center rounded-full text-[1.3rem] font-bold ${tone(isExtraHit(value))}`}>
              {value}
            </span>
          ))}
        </div>
      )}

      {check && check.prizes.length > 0 && (
        <div className="flex flex-col">
          {check.prizes.map((prize) => (
            <div key={prize.label} className="py-[0.8rem] flex justify-between gap-[1.2rem] border-b border-line last:border-0 text-[1.4rem]">
              <span className="text-body">{prize.label}</span>
              <span className="font-semibold text-title">{formatBRL(prize.prize)}</span>
            </div>
          ))}
        </div>
      )}

      {check && check.total > 0 && !saved.isCoffeeDismissed && (
        <div className="p-[1.6rem] rounded-card bg-attention-soft flex flex-col gap-[1.2rem]">
          <div className="flex items-center gap-[1.2rem]">
            <span className="h-[4.4rem] w-[4.4rem] flex items-center justify-center shrink-0 rounded-full bg-surface text-attention">
              <MdOutlineCoffee size={22} />
            </span>
            <p className="text-[1.4rem] leading-[1.5] text-body">
              <span className="block text-[1.6rem] font-bold text-title">A superstição funcionou!</span>
              Paga um café pra quem fez o site?
            </p>
          </div>
          <div className="flex gap-[0.8rem]">
            <Link href="/cafe" className="flex-1 h-[4.4rem] flex items-center justify-center rounded-control bg-attention text-surface text-[1.4rem] font-bold">
              Pagar um café
            </Link>
            <button type="button" onClick={() => dismissCoffee(saved.id)} className="h-[4.4rem] px-[1.4rem] rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold cursor-pointer">
              Agora não
            </button>
          </div>
        </div>
      )}

      <div className="pt-[1.2rem] flex items-center justify-between gap-[1.2rem] border-t border-line">
        <span className="text-[1.2rem] text-meta">Salvo em {new Date(saved.createdAt).toLocaleDateString("pt-BR")}</span>
        <button type="button" onClick={() => removeGame(saved.id)} className="h-[3.2rem] px-[1rem] flex items-center gap-[0.4rem] rounded-control text-meta hover:text-negative hover:bg-surface-2 text-[1.3rem] font-semibold cursor-pointer">
          <MdOutlineDeleteOutline size={18} />
          Remover
        </button>
      </div>
    </article>
  );
}
