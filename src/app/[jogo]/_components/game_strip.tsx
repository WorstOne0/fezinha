// Next
import Link from "next/link";
// Models
import { GAME_IDS, GAMES, type GameId } from "@/core/models";
// Components
import PendingDot from "./pending_dot";
// Utils
import { gameStyle } from "@/utils";

export default function GameStrip({ current }: { current: GameId }) {
  return (
    <nav aria-label="Jogos" className="-mx-[1.6rem] sm:mx-0 px-[1.6rem] sm:px-0 pb-[0.4rem] flex gap-[0.8rem] overflow-x-auto scrollbar-thin">
      {GAME_IDS.map((id) => {
        const game = GAMES[id];
        const isCurrent = id === current;
        return (
          <Link
            key={id}
            href={`/${game.path}`}
            data-game={id}
            style={gameStyle(game)}
            aria-current={isCurrent ? "page" : undefined}
            className={`h-[4rem] px-[1.4rem] flex items-center gap-[0.8rem] shrink-0 rounded-control border text-[1.4rem] ${isCurrent ? "border-action bg-action-tint text-title font-bold" : "border-line bg-surface text-body font-medium hover:bg-surface-2"}`}
          >
            <PendingDot />
            {game.name}
          </Link>
        );
      })}
    </nav>
  );
}
