// Components
import { SectionHeader } from "@/components";

export default function EffectCard({ value, text, hasSources }: { value: string; text: string; hasSources?: boolean }) {
  return (
    <div className="surface p-[2rem] sm:px-[2.4rem] flex flex-col gap-[1.2rem]">
      <SectionHeader label="Efeito nas suas chances" />
      <p className="text-[2.6rem] leading-[1.2] font-bold text-title">{value}</p>
      <p className="max-w-[72rem] text-[1.5rem] leading-[1.6] text-body">{text}</p>
      {hasSources && (
        <p className="text-[1.3rem] leading-[1.6] text-meta">
          Henze (1997), Statistica Neerlandica · Simon (1998), Journal of Risk and Uncertainty · Wang, Potter van Loon, van den Assem e van Dolder (2016), Judgment and Decision Making
        </p>
      )}
    </div>
  );
}
