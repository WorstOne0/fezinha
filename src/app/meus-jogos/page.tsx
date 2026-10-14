"use client";

// Next
import Link from "next/link";
// Controllers
import { useSavedGamesController } from "@/core/controllers";
// Components
import { EmptyState, Footer, SectionHeader } from "@/components";
import SavedGameCard from "./_components/saved_game_card";
// Icons
import { MdOutlineBookmarkBorder } from "react-icons/md";

export default function MeusJogosPage() {
  const savedGames = useSavedGamesController((state) => state.savedGames);
  const isHydrated = useSavedGamesController((state) => state.isHydrated);

  const buildContent = () => {
    if (!isHydrated)
      return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(36rem,1fr))] gap-[1.6rem]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[18rem] rounded-card bg-surface-3 animate-pulse" />
          ))}
        </div>
      );

    if (!savedGames.length)
      return (
        <EmptyState
          icon={<MdOutlineBookmarkBorder size={26} />}
          title="Nenhum jogo salvo ainda"
          text="Gere um jogo, toque em Salvar e ele aparece aqui. Depois do sorteio a gente confere sozinho."
          action={
            <Link href="/mega-sena" className="h-[4.4rem] px-[1.6rem] flex items-center rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold">
              Gerar um jogo
            </Link>
          }
        />
      );

    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(36rem,1fr))] items-start gap-[1.6rem]">
        {savedGames.map((saved) => (
          <SavedGameCard key={saved.id} saved={saved} />
        ))}
      </div>
    );
  };

  return (
    <>
      <main className="w-full max-w-[128rem] mx-auto px-[1.6rem] sm:px-[2.4rem] pt-[9.6rem] pb-[4rem] flex flex-col gap-[2.4rem]">
        <div>
          <h1 className="text-[3.4rem] leading-[1.15] font-bold tracking-[-0.01em] text-title">Meus jogos</h1>
          <p className="mt-[0.6rem] text-[1.5rem] text-meta">Ficam só neste navegador. Cada um é conferido com o resultado do concurso dele.</p>
        </div>
        <SectionHeader label={isHydrated ? `${savedGames.length} ${savedGames.length === 1 ? "jogo salvo" : "jogos salvos"}` : "Jogos salvos"} />
        {buildContent()}
      </main>
      <Footer />
    </>
  );
}
