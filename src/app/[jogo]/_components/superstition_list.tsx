// Components
import { SectionHeader } from "@/components";

type Item = { id: string; name: string; base: string; line: string };

export default function SuperstitionList({ items, selected, onSelect }: { items: Item[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <aside className="grow basis-[34rem] min-w-0 surface p-[1.6rem] flex flex-col gap-[0.8rem]">
      <SectionHeader label={`${items.length} superstições`} />
      <div className="flex flex-col gap-[0.2rem]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={item.id === selected}
            className={`px-[1.2rem] py-[1rem] flex flex-col gap-[0.4rem] rounded-control border text-left cursor-pointer ${item.id === selected ? "border-action bg-action-tint" : "border-transparent hover:bg-surface-2"}`}
          >
            <span className="flex items-center justify-between gap-[0.8rem]">
              <span className="text-[1.5rem] font-semibold text-title">{item.name}</span>
              <span className={`h-[2rem] px-[0.7rem] flex items-center shrink-0 rounded-[0.4rem] text-[1rem] font-bold uppercase tracking-[0.06em] ${item.base === "Tem paper" ? "bg-action text-on-action" : "bg-surface-3 text-meta"}`}>{item.base}</span>
            </span>
            <span className="text-[1.3rem] leading-[1.45] text-meta">{item.line}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
