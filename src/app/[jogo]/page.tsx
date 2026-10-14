// Next
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
// Models
import { GAME_IDS, GAMES, gameByPath, withLatest } from "@/core/models";
// Services
import { getHistory, getLatestResult } from "@/services";
// Components
import { EmptyState } from "@/components";
import DrawSummary from "./_components/draw_summary";
import GeneratorView from "./_components/generator_view";
import LotecaView from "./_components/loteca_view";
// Icons
import { MdOutlineConfirmationNumber } from "react-icons/md";

export const revalidate = 600;
export const dynamicParams = false;

export const generateStaticParams = () => GAME_IDS.map((id) => ({ jogo: GAMES[id].path }));

export async function generateMetadata({ params }: { params: Promise<{ jogo: string }> }): Promise<Metadata> {
  const { jogo } = await params;
  const game = gameByPath(jogo);
  if (!game) return {};

  return { title: `${game.name} · gerador por superstição`, description: `Resultado, prêmio estimado e um gerador de jogos da ${game.name} pela sua superstição, com o histórico real da CAIXA.` };
}

export default async function GamePage({ params }: { params: Promise<{ jogo: string }> }) {
  const { jogo } = await params;
  const game = gameByPath(jogo);
  if (!game) notFound();

  const hasGenerator = game.kind === "numbers" || game.kind === "columns";
  const [result, history] = await Promise.all([getLatestResult(game), hasGenerator ? getHistory(game) : null]);

  // Thrown, not rendered: a failed revalidation then keeps serving the last good page.
  if (!result || (hasGenerator && !history?.draws.length)) throw new Error(`${game.id} results unavailable`);

  return (
    <>
      <DrawSummary game={game} result={result} />

      {history && <GeneratorView gameId={game.id} draws={withLatest(game, history, result)} teams={history.teams} nextConcurso={result.nextConcurso} />}
      {game.kind === "loteca" && <LotecaView nextConcurso={result.nextConcurso} />}
      {game.kind === "federal" && (
        <EmptyState
          icon={<MdOutlineConfirmationNumber size={26} />}
          title="Na Federal o bilhete já vem numerado"
          text="Não dá pra escolher dezenas. Aqui a superstição é escolher a lotérica."
          action={
            <Link href="/mega-sena" className="h-[4.4rem] px-[1.6rem] flex items-center rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold">
              Gerar um jogo da Mega-Sena
            </Link>
          }
        />
      )}
    </>
  );
}
