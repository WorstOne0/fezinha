// Next
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// Models
import type { SavedGame } from "@/core/models";

type SavedGamesController = {
  savedGames: SavedGame[];
  isHydrated: boolean;
  saveGame: (game: SavedGame) => void;
  removeGame: (id: string) => void;
  dismissCoffee: (id: string) => void;
  setIsHydrated: (isHydrated: boolean) => void;
};

export const useSavedGamesController = create<SavedGamesController>()(
  persist(
    (set) => ({
      savedGames: [],
      isHydrated: false,
      saveGame: (game) => set((state) => ({ savedGames: [game, ...state.savedGames] })),
      removeGame: (id) => set((state) => ({ savedGames: state.savedGames.filter((game) => game.id !== id) })),
      dismissCoffee: (id) => set((state) => ({ savedGames: state.savedGames.map((game) => (game.id === id ? { ...game, isCoffeeDismissed: true } : game)) })),
      setIsHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "fezinha_saved_games",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savedGames: state.savedGames }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setIsHydrated(true),
    }
  )
);
