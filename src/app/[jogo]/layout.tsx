// Next
import { notFound } from "next/navigation";
// Models
import { gameByPath } from "@/core/models";
// Components
import { Footer } from "@/components";
import GameStrip from "./_components/game_strip";
// Utils
import { gameStyle } from "@/utils";

// The title and the game strip live here, above loading.tsx, so switching games repaints them at once
// in the new game's colour while the page's data loads behind the skeleton.
export default async function GameLayout({ children, params }: { children: React.ReactNode; params: Promise<{ jogo: string }> }) {
  const { jogo } = await params;
  const game = gameByPath(jogo);
  if (!game) notFound();

  return (
    <div data-game={game.id} style={gameStyle(game)} className="flex-1 flex flex-col">
      <main className="w-full max-w-[128rem] mx-auto px-[1.6rem] sm:px-[2.4rem] pt-[9.6rem] pb-[4rem] flex flex-col gap-[3.2rem]">
        <div className="flex flex-col gap-[2rem]">
          <div>
            <h1 className="text-[3.4rem] leading-[1.15] font-bold tracking-[-0.01em] text-title">Escolha sua superstição.</h1>
            <p className="mt-[0.6rem] text-[1.5rem] text-meta">Nenhuma muda suas chances. Todas deixam o jogo mais divertido.</p>
          </div>
          <GameStrip current={game.id} />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
