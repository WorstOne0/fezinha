"use client";

// Next
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
// Components
import { Footer, SectionHeader } from "@/components";
// Utils
import { formatBRL, pixPayload } from "@/utils";
// Icons
import { MdOutlineCheck, MdOutlineCoffee, MdOutlineContentCopy } from "react-icons/md";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? "";
const PIX_NAME = process.env.NEXT_PUBLIC_PIX_NAME ?? "";
const PIX_CITY = process.env.NEXT_PUBLIC_PIX_CITY ?? "";
const BMC_URL = process.env.NEXT_PUBLIC_BMC_URL ?? "";

const TIERS = [
  { label: "Faixa pequena", name: "Um cafezinho", examples: "Quadra na Mega, 11 pontos na Lotofácil, terno na Quina.", amount: 5 },
  { label: "Faixa do meio", name: "Café com pão de queijo", examples: "Quina na Mega, 14 pontos na Lotofácil, quadra na Quina.", amount: 15 },
  { label: "Prêmio principal", name: "Você decide", examples: "Sena, 15 pontos, a quina da Quina. Mas lembra de quem te deu a fezinha.", amount: 0 },
];

export default function CafePage() {
  const [tierIndex, setTierIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const tier = TIERS[tierIndex];
  const payload = PIX_KEY ? pixPayload(PIX_KEY, PIX_NAME, PIX_CITY, tier.amount || undefined) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(payload);
    setIsCopied(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-diagonal">
      <main className="w-full max-w-[104rem] mx-auto px-[1.6rem] sm:px-[2.4rem] pt-[12rem] pb-[5.6rem] flex flex-col gap-[3.2rem]">
        <div className="max-w-[68rem] flex flex-col gap-[1.4rem]">
          <span className="h-[5.6rem] w-[5.6rem] flex items-center justify-center rounded-full bg-attention-soft text-attention">
            <MdOutlineCoffee size={28} />
          </span>
          <h1 className="text-[4.6rem] leading-[1.08] font-extrabold tracking-[-0.02em] text-title">Ganhou? Paga um café.</h1>
          <p className="text-[1.7rem] leading-[1.65] text-body">O site é de graça e sem anúncio. Se um jogo gerado aqui te deu prêmio, divide um cafezinho com quem fez. Se não deu, tudo bem: a chance era mínima mesmo.</p>
        </div>

        <section className="flex flex-col gap-[1.4rem]">
          <SectionHeader label="Quanto vale a sorte" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(28rem,1fr))] gap-[1.6rem]">
            {TIERS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setTierIndex(i);
                  setIsCopied(false);
                }}
                aria-pressed={i === tierIndex}
                className={`p-[2rem] flex flex-col gap-[1rem] rounded-card border text-left cursor-pointer ${i === tierIndex ? "border-attention outline-1 outline-attention bg-attention-soft" : "border-line bg-surface hover:border-line-hover"}`}
              >
                <span className={`text-[1.1rem] leading-[1.4rem] font-bold uppercase tracking-[0.06em] ${i === tierIndex ? "text-attention" : "text-meta"}`}>{item.label}</span>
                <span className="text-[2.6rem] leading-[1.2] font-bold text-title">{item.name}</span>
                <span className="text-[1.4rem] leading-[1.55] text-meta">{item.examples}</span>
                <span className="mt-[0.4rem] text-[2.2rem] font-bold text-attention">{item.amount ? formatBRL(item.amount) : "Valor livre"}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-[1.6rem]">
          <div className="grow basis-[42rem] min-w-0 surface p-[2.4rem] flex flex-wrap gap-x-[2.4rem] gap-y-[2rem]">
            {payload ? (
              <>
                <div className="p-[1.2rem] shrink-0 self-start rounded-card bg-white">
                  <QRCodeSVG value={payload} size={152} />
                </div>
                <div className="grow basis-[22rem] min-w-0 flex flex-col gap-[1rem]">
                  <h2 className="text-[1.8rem] font-bold text-title">Pix {tier.amount ? `de ${formatBRL(tier.amount)}` : ""}</h2>
                  <p className="text-[1.4rem] leading-[1.55] text-meta">Aponta a câmera do app do banco ou usa o Pix copia e cola.</p>
                  <button type="button" onClick={copy} className="self-start h-[4.4rem] px-[1.6rem] flex items-center gap-[0.8rem] rounded-control border border-line bg-surface hover:bg-surface-2 text-title text-[1.4rem] font-semibold cursor-pointer">
                    {isCopied ? <MdOutlineCheck size={18} className="text-attention" /> : <MdOutlineContentCopy size={18} />}
                    {isCopied ? "Copiado" : "Copiar Pix copia e cola"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-[0.6rem]">
                <h2 className="text-[1.8rem] font-bold text-title">Pix</h2>
                <p className="text-[1.4rem] leading-[1.55] text-meta">O Pix ainda não foi configurado. Volta daqui a pouco.</p>
              </div>
            )}
          </div>

          {BMC_URL && (
            <div className="grow basis-[30rem] min-w-0 surface p-[2.4rem] flex flex-col gap-[1rem]">
              <h2 className="text-[1.8rem] font-bold text-title">Buy Me a Coffee</h2>
              <p className="text-[1.4rem] leading-[1.55] text-meta">Cartão ou PayPal, para quem está fora do Brasil ou prefere assim.</p>
              <a href={BMC_URL} target="_blank" rel="noreferrer" className="mt-auto h-[4.8rem] flex items-center justify-center rounded-control bg-attention text-surface text-[1.6rem] font-bold">
                Abrir Buy Me a Coffee
              </a>
            </div>
          )}
        </div>

        <p className="px-[2rem] py-[1.6rem] rounded-card bg-surface-3 text-[1.4rem] leading-[1.6] text-body">Jogo pode viciar. Se a fezinha virou problema, procure ajuda: os Jogadores Anônimos têm grupos no Brasil inteiro.</p>
      </main>
      <Footer />
    </div>
  );
}
