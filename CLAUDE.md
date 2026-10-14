# Fezinha

Lottery number generator for every Loterias CAIXA game, live at fezinha.disboard.dev. Next.js 16 (App Router,
Turbopack), React 19, Tailwind 4, Zustand, SWR. No backend of its own: it reads CAIXA's API and a community history API.

General code style, architecture and the design system live in `../general/code_style/` (`README.md`, `next.md`,
`design.md`); this file is only what is specific to this app. The README covers what it does and where things are.

## Working agreements

- Portuguese for all UI copy; English for code and comments. The brand is written "Fezinha"; "fezinha" in copy is
  the common word for a small bet.
- Every superstition says honestly that it changes nothing. Keep it that way, including in new copy.
- Verify in the browser with the console open, and run `npx tsc --noEmit` and `npx eslint .` before calling it done.

## Data traps

- CAIXA's "latest" endpoint (`/api/<jogo>`) often trails by a draw. `getLatestResult` also asks for
  `numero + 1`; a concurso not drawn yet answers 500.
- CAIXA pads empty text with NUL characters and team names with spaces before the state: go through `cleanText`.
- The history API is over Next's 2 MB fetch-cache limit, so `fetchHistory` caches the trimmed draws in
  `unstable_cache`. After changing `historyFromRows`, clear `.next/dev/cache/fetch-cache` and restart the dev
  server, or the old shape keeps being served for an hour.
- Dupla Sena's history puts both draws in one 12-number `dezenas`; it is split into two draws.
- Super Sete's numbers are one digit per column, not dezenas.
- Timemania's club list changes over the years: `currentTeams` walks back from the newest draw until it has 80.
- The Loteca has no community history, and the next concurso's matches aren't in the API until it is drawn.
- Federal tickets come pre-numbered: that page shows the result only.
- Prize tiers are matched by their CAIXA label (`"5 acertos"`, `"4 acertos + 2 trevos"`, `"1º (14 acertos)"`), so
  a label change at CAIXA breaks `checkGame`.

## Deploy

On the contabo VPS (`../general/vps/contabo.md`), folder `/var/www/docker/fezinha`, a clone of this repo; container
`fezinha:3000` on the `nginx-proxy` network, routed by Nginx Proxy Manager with a Let's Encrypt certificate.

```bash
ssh contabo 'cd /var/www/docker/fezinha && git pull && docker compose build && docker compose up -d'
```

The server's `.env` (Pix key, name, city) is not in git. Behind the proxy `request.url` says `0.0.0.0:3000`; read
the `host` header when a route needs the public domain.
