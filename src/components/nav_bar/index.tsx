/* eslint-disable @next/next/no-img-element */
"use client";

// Next
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
// Controllers
import { useSavedGamesController } from "@/core/controllers";
// Models
import { GAME_IDS, GAMES } from "@/core/models";
// Icons
import { MdOutlineClose, MdOutlineCoffee, MdOutlineDarkMode, MdOutlineLightMode, MdOutlineMenu } from "react-icons/md";

const GAME_PATHS = GAME_IDS.map((id) => `/${GAMES[id].path}`);

const ROUTES = [
  { value: "/mega-sena", name: "Gerar", isActive: (pathname: string) => GAME_PATHS.includes(pathname) },
  { value: "/supersticoes", name: "Superstições", isActive: (pathname: string) => pathname === "/supersticoes" },
  { value: "/jogos", name: "Os jogos", isActive: (pathname: string) => pathname === "/jogos" },
  { value: "/meus-jogos", name: "Meus jogos", isActive: (pathname: string) => pathname === "/meus-jogos" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const savedCount = useSavedGamesController((state) => state.savedGames.length);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // The theme is only known after hydration, so the icon and its label wait for the mount.
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const isDark = isMounted && resolvedTheme === "dark";
  const themeLabel = !isMounted ? "Alternar tema" : isDark ? "Ativar modo claro" : "Ativar modo escuro";

  const linkClass = (route: (typeof ROUTES)[number]) => (route.isActive(pathname) ? "bg-surface-2 text-title" : "text-meta hover:text-title hover:bg-surface-2");

  const buildLabel = (route: (typeof ROUTES)[number]) => (
    <>
      {route.name}
      {route.value === "/meus-jogos" && isMounted && savedCount > 0 && (
        <span className="h-[2rem] min-w-[2rem] px-[0.6rem] flex items-center justify-center rounded-full bg-action text-on-action text-[1.1rem] font-bold">{savedCount}</span>
      )}
    </>
  );

  return (
    // Fixed and out of flow: the pages render underneath it.
    <header className="px-[1rem] pt-[1rem] fixed top-0 inset-x-0 z-50 pointer-events-none">
      <nav className="max-w-[128rem] h-[5.6rem] mx-auto px-[1.2rem] flex items-center justify-between gap-[2rem] bg-surface/95 backdrop-blur-xl rounded-card floating pointer-events-auto">
        <Link href="/mega-sena" aria-label="Fezinha" className="flex items-center gap-[0.8rem] shrink-0 select-none">
          {/* The white swirl disappears on a light page, so each theme gets its own file. */}
          <img src="/logo/logo.svg" alt="" className="hidden dark:block h-[4rem] w-[4rem]" />
          <img src="/logo/logo_light.svg" alt="" className="dark:hidden h-[4rem] w-[4rem]" />
          <span className="text-[1.9rem] font-extrabold tracking-tight text-title">Fezinha</span>
        </Link>

        <div className="flex items-center gap-[0.6rem]">
          <div className="hidden md:flex items-center gap-[0.2rem]">
            {ROUTES.map((route) => (
              <Link key={route.value} href={route.value} className={`h-[3.6rem] px-[1.4rem] flex items-center gap-[0.6rem] rounded-control text-[1.4rem] font-semibold transition-colors ${linkClass(route)}`}>
                {buildLabel(route)}
              </Link>
            ))}
          </div>

          <Link href="/cafe" className="h-[3.6rem] px-[1.2rem] flex items-center gap-[0.6rem] rounded-control bg-attention-soft text-attention text-[1.4rem] font-bold">
            <MdOutlineCoffee size={18} />
            <span className="hidden sm:inline">Ganhou? Paga um café</span>
          </Link>

          <button
            type="button"
            aria-label={themeLabel}
            title={themeLabel}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-[3.6rem] w-[3.6rem] flex items-center justify-center rounded-control text-meta hover:text-title hover:bg-surface-2 cursor-pointer"
          >
            {isMounted && (isDark ? <MdOutlineLightMode size={20} /> : <MdOutlineDarkMode size={20} />)}
          </button>

          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-[3.6rem] w-[3.6rem] flex items-center justify-center rounded-control text-body hover:bg-surface-2 cursor-pointer"
          >
            {isMenuOpen ? <MdOutlineClose size={20} /> : <MdOutlineMenu size={20} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden max-w-[128rem] mx-auto mt-[0.8rem] p-[0.6rem] flex flex-col bg-surface/95 backdrop-blur-xl rounded-card floating pointer-events-auto">
          {ROUTES.map((route) => (
            <Link
              key={route.value}
              href={route.value}
              onClick={() => setIsMenuOpen(false)}
              className={`h-[4.4rem] px-[1.4rem] flex items-center gap-[0.6rem] rounded-control text-[1.5rem] font-semibold ${linkClass(route)}`}
            >
              {buildLabel(route)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
