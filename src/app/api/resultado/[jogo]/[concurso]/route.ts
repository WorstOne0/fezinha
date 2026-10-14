// Models
import { GAME_IDS, GAMES, type GameId } from "@/core/models";
// Services
import { getResult } from "@/services";

// Meus jogos checks each saved game against its own concurso; payload is null until it is drawn.
export async function GET(_request: Request, { params }: { params: Promise<{ jogo: string; concurso: string }> }) {
  const { jogo, concurso } = await params;
  if (!GAME_IDS.includes(jogo as GameId)) return Response.json({ status: 404, message: "Jogo não encontrado", payload: null }, { status: 404 });

  const result = await getResult(GAMES[jogo as GameId], Number(concurso));
  return Response.json({ status: 200, message: result ? "Resultado" : "Ainda não sorteado", payload: result });
}
