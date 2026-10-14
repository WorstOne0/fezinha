// Next
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ganhou? Paga um café", description: "Se um jogo gerado aqui te deu prêmio, divide um cafezinho com quem fez o site." };

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
