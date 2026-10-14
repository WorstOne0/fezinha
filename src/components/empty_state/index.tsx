export default function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="surface px-[2.4rem] py-[4.8rem] flex flex-col items-center gap-[1.2rem] text-center">
      <span className="h-[5.6rem] w-[5.6rem] flex items-center justify-center rounded-full bg-surface-3 text-soft">{icon}</span>
      <h2 className="text-[1.8rem] font-bold text-title">{title}</h2>
      <p className="max-w-[42rem] text-[1.4rem] leading-[1.6] text-meta">{text}</p>
      {action && <div className="mt-[0.8rem]">{action}</div>}
    </div>
  );
}
