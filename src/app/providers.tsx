"use client";

// Next
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
// Controllers
import { useSavedGamesController } from "@/core/controllers";
// Components
import { NavBar } from "@/components";

// Client-only providers, so the root layout stays a server component that can export metadata.
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useSavedGamesController.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <NavBar />
      {/* The navbar is fixed and takes no height; pages render underneath it. */}
      <div className="min-h-full flex flex-col">{children}</div>
    </ThemeProvider>
  );
}
