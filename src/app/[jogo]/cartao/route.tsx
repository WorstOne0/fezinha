// Next
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
// Models
import { gameByPath } from "@/core/models";

// Google serves a TTF to clients it doesn't recognise, which is what the image renderer needs.
const loadInter = async () => {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Inter:wght@800", { next: { revalidate: 86400 } })).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url, { next: { revalidate: 86400 } })).arrayBuffer() : null;
  } catch {
    return null;
  }
};

export async function GET(request: Request, { params }: { params: Promise<{ jogo: string }> }) {
  const { jogo } = await params;
  const game = gameByPath(jogo);
  if (!game) return new Response("Jogo não encontrado", { status: 404 });

  const url = new URL(request.url);
  // Behind the proxy request.url carries the container's own 0.0.0.0:3000; the Host header has the real domain.
  const host = request.headers.get("host") ?? url.host;
  const labels = (url.searchParams.get("n") ?? "").split("-").filter(Boolean).slice(0, 50);
  const superstition = url.searchParams.get("s") ?? "Surpresinha";
  const extra = url.searchParams.get("x") ?? "";
  const font = await loadInter();
  // Read from disk, not fetched by URL: behind the proxy the request's own origin isn't reachable from inside the container.
  const logo = `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public/logo/logo.svg"))).toString("base64")}`;
  const size = labels.length <= 7 ? 120 : labels.length <= 15 ? 96 : labels.length <= 20 ? 80 : 64;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", padding: 88, display: "flex", flexDirection: "column", background: game.color, color: "#ffffff", fontFamily: font ? "Inter" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={84} height={84} alt="" />
          <div style={{ fontSize: 42 }}>Fezinha</div>
        </div>

        <div style={{ marginTop: 110, fontSize: 26, letterSpacing: 3, opacity: 0.85 }}>{`MEU JOGO DA ${game.name.toUpperCase()}`}</div>
        <div style={{ marginTop: 18, fontSize: 92, lineHeight: 1.05 }}>{`Fui de ${superstition}.`}</div>

        <div style={{ marginTop: 64, display: "flex", flexWrap: "wrap", gap: Math.round(size / 5) }}>
          {labels.map((label, i) => (
            <div key={i} style={{ width: size, height: size, borderRadius: size / 2, background: "#ffffff", color: game.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.4) }}>
              {label}
            </div>
          ))}
        </div>
        {extra && <div style={{ marginTop: 36, fontSize: 34 }}>{extra}</div>}

        <div style={{ marginTop: "auto", paddingTop: 36, borderTop: "2px solid rgba(255, 255, 255, 0.35)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36 }}>Escolha sua superstição</div>
            <div style={{ marginTop: 8, fontSize: 28, opacity: 0.85 }}>{`${host}/${game.path}`}</div>
          </div>
          <div style={{ maxWidth: 360, fontSize: 24, lineHeight: 1.4, opacity: 0.85, textAlign: "right" }}>Não muda a chance. Mas é bem mais divertido.</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: font ? [{ name: "Inter", data: font, weight: 800 }] : undefined }
  );
}
