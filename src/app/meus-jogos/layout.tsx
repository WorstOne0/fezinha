// Next
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meus jogos", description: "Os jogos que você salvou, conferidos sozinhos depois de cada sorteio." };

export default function MeusJogosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
