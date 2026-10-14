"use client";

// Next
import { useState } from "react";
import Link from "next/link";
// Controllers
import { useSavedGamesController } from "@/core/controllers";
// Models
import type { Game } from "@/core/models";
// Icons
import { MdOutlineBookmarkAdded, MdOutlineBookmarkBorder, MdOutlineCheck, MdOutlineContentCopy, MdOutlineRefresh, MdOutlineShare } from "react-icons/md";

const OUTLINE = "h-[4.8rem] px-[1.6rem] flex items-center gap-[0.8rem] rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold cursor-pointer disabled:cursor-default";

type Props = {
  game: Game;
  superstition: string;
  numbers: number[];
  labels: string[];
  extra: string[];
  extraText: string;
  nextConcurso: number;
  onReroll: () => void;
};

export default function GameActions({ game, superstition, numbers, labels, extra, extraText, nextConcurso, onReroll }: Props) {
  const saveGame = useSavedGamesController((state) => state.saveGame);

  const [savedKey, setSavedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const key = `${game.id}:${labels.join("-")}:${extra.join("-")}`;
  const gameText = [labels.join(" "), extraText].filter(Boolean).join(" · ");

  const save = () => {
    saveGame({ id: crypto.randomUUID(), gameId: game.id, concurso: nextConcurso, superstition, numbers, extra, createdAt: new Date().toISOString(), isCoffeeDismissed: false });
    setSavedKey(key);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(gameText);
    setCopiedKey(key);
  };

  // Shares the card image where the browser can (phones), otherwise downloads it.
  const share = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(`/${game.path}/cartao?${new URLSearchParams({ n: labels.join("-"), s: superstition, x: extraText })}`);
      const blob = await response.blob();
      const file = new File([blob], `fezinha-${game.path}.png`, { type: "image/png" });
      const text = `Meu jogo da ${game.name} pela superstição ${superstition}: ${gameText}. Gere o seu: ${window.location.origin}/${game.path}`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // A cancelled share sheet rejects too; nothing to tell the user.
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap gap-[0.8rem]">
        <button type="button" onClick={onReroll} className="h-[4.8rem] px-[2rem] flex items-center gap-[0.8rem] rounded-control bg-action hover:bg-action-hover text-on-action text-[1.6rem] font-bold cursor-pointer">
          <MdOutlineRefresh size={20} />
          Gerar de novo
        </button>
        <button type="button" onClick={save} disabled={savedKey === key} className={OUTLINE}>
          {savedKey === key ? <MdOutlineBookmarkAdded size={18} className="text-action" /> : <MdOutlineBookmarkBorder size={18} />}
          {savedKey === key ? "Salvo" : "Salvar"}
        </button>
        <button type="button" onClick={copy} className={OUTLINE}>
          {copiedKey === key ? <MdOutlineCheck size={18} className="text-action" /> : <MdOutlineContentCopy size={18} />}
          {copiedKey === key ? "Copiado" : "Copiar"}
        </button>
        <button type="button" onClick={share} disabled={isSharing} className={OUTLINE}>
          <MdOutlineShare size={18} />
          {isSharing ? "Gerando cartão…" : "Compartilhar"}
        </button>
      </div>
      {savedKey === key && (
        <p className="text-[1.3rem] text-meta">
          Salvo para o concurso {nextConcurso}. A gente confere sozinho depois do sorteio em{" "}
          <Link href="/meus-jogos" className="font-semibold text-action hover:underline">
            Meus jogos
          </Link>
          .
        </p>
      )}
    </div>
  );
}
