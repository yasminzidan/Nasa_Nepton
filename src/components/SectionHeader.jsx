export default function SectionHeader({ num, title, rightSlot }) {
  return (
    <div className="flex min-h-5 items-center gap-2">
      <span className="font-mono text-[10px] text-fire">{num}</span>
      <h2 className="whitespace-nowrap font-display text-[15px] font-semibold uppercase tracking-[0.16em] text-bone">
        {title}
      </h2>
      <span className="h-px min-w-3 flex-1 bg-line" aria-hidden="true" />
      {rightSlot && <span className="shrink-0">{rightSlot}</span>}
    </div>
  )
}
