// Next
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Components
import Providers from "./providers";
// Styles
import "@/styles/index.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Server component on purpose: "use client" here would silently drop metadata.
export const metadata: Metadata = {
  title: {
    default: "Fezinha · Escolha sua superstição",
    template: "%s · Fezinha",
  },
  description: "Gere jogos da Mega-Sena pela sua superstição: quentes, atrasados, datas, sonhos, numerologia. Com os resultados e prêmios reais da CAIXA.",
  applicationName: "Fezinha",
  icons: { icon: "/logo/icon.svg", apple: "/logo/apple-icon.png" },
  openGraph: { type: "website", locale: "pt_BR", siteName: "Fezinha", title: "Fezinha · Escolha sua superstição" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning covers the class next-themes puts on <html>.
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="w-full flex flex-col font-sans tabular-nums">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
