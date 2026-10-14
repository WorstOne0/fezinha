// Opens every block on a page: uppercase label, a rule to the edge, an optional trailing fact.
// Fixed height, so an aside appearing never pushes the block below it.
export default function SectionHeader({ label, aside }: { label: string; aside?: React.ReactNode }) {
  return (
    <div className="h-[2rem] w-full flex items-center gap-[1rem]">
      <h2 className="label shrink-0">{label}</h2>
      <span className="h-px grow bg-line" />
      {aside}
    </div>
  );
}
