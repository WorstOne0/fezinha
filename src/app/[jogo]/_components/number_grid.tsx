// Models
import type { Range } from "@/core/models";
// Components
import { SectionHeader } from "@/components";
// Utils
import { pad, type Stats, type SuperstitionId } from "@/utils";

type Section = { label?: string; range: Range; stats: Stats; chosen: Set<number> };

// The betting slip, drawn so the chosen superstition's logic is visible: heat, crossed-out recents, the dates zone.
export default function NumberGrid({ sections, mode, heat, legend }: { sections: Section[]; mode: SuperstitionId; heat?: "freq" | "delay"; legend?: string }) {
  const buildCell = (section: Section, n: number) => {
    const values = heat ? section.stats.all.map((value) => section.stats[heat][value]) : [0];
    const low = Math.min(...values);
    const share = heat ? (section.stats[heat][n] - low) / (Math.max(...values) - low || 1) : 0;
    const isChosen = section.chosen.has(n);

    let tone = "border-line bg-surface text-body";
    if (mode === "fugitivos" && section.stats.recent.has(n)) tone = "border-line bg-surface-2 text-muted line-through";
    if (mode === "contra" && section.range.max > 31 && n <= 31) tone = "border-line bg-surface-3 text-muted";
    if (mode === "repeteco" && section.stats.last.includes(n)) tone = "border-action bg-surface text-body";
    if (isChosen) tone = "border-action bg-action text-on-action";

    return (
      <div
        key={n}
        className={`aspect-square flex items-center justify-center rounded-control border text-[1.3rem] font-semibold ${tone}`}
        style={heat && !isChosen ? { background: `color-mix(in srgb, var(--action) ${Math.round(4 + share * 34)}%, var(--surface))` } : undefined}
      >
        {section.range.max >= 10 ? pad(n) : n}
      </div>
    );
  };

  return (
    <div className="surface p-[2rem] sm:px-[2.4rem] flex flex-col gap-[1.4rem]">
      <SectionHeader label="Volante" />
      <div className="flex flex-col gap-[0.8rem]">
        {sections.map((section) => (
          <div key={section.label ?? "main"} className="flex items-center gap-[1.2rem]">
            {section.label && <span className="w-[4.8rem] shrink-0 text-[1.2rem] font-semibold text-meta">{section.label}</span>}
            <div className="flex-1 max-w-[58rem] grid gap-[0.6rem]" style={{ gridTemplateColumns: `repeat(${section.range.cols}, minmax(0, 1fr))` }}>
              {section.stats.all.map((n) => buildCell(section, n))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[1.3rem] text-meta">{legend ?? "Preenchido = o seu jogo."}</p>
    </div>
  );
}
