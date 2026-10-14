// Models
import type { Game } from "@/core/models";

// Paired with [data-game] in tokens.css, which turns these into the action colour of everything inside.
export const gameStyle = (game: Game) => ({ "--game-light": game.color, "--game-dark": game.colorDark }) as React.CSSProperties;
