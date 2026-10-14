"use client";

// Next
import { startTransition } from "react";
import { useRouter } from "next/navigation";
// Icons
import { MdOutlineCloudOff } from "react-icons/md";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();

  // reset alone only re-renders the client; the server page has to run again to refetch.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <main className="flex-1 px-[1.6rem] pt-[12rem] pb-[4rem] flex justify-center">
      <div className="surface max-w-[48rem] h-fit p-[4rem] flex flex-col items-center gap-[1.2rem] text-center">
        <span className="h-[5.6rem] w-[5.6rem] flex items-center justify-center rounded-full bg-surface-3 text-soft">
          <MdOutlineCloudOff size={26} />
        </span>
        <h1 className="text-[1.8rem] font-bold text-title">Não deu pra falar com a CAIXA</h1>
        <p className="text-[1.4rem] leading-[1.6] text-meta">Os resultados não carregaram agora. Tenta de novo daqui a pouco.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-[0.8rem] h-[4.4rem] px-[1.6rem] rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold cursor-pointer"
        >
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
