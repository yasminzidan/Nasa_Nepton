import { X } from 'lucide-react';

export default function GreetingBubble({ onDismiss }) {
  return (
    <div className="relative w-[270px] border border-bone bg-surface p-3.5 text-left">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-fire">New Briefing</span>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center border border-transparent text-bone transition-colors hover:border-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <X size={12} />
        </button>
      </div>
      <p className="text-[12px] leading-relaxed text-bone">
        Hi, I'm Nepton. Ask me about any fire, region or trend.
      </p>
      <span className="absolute -bottom-[6px] right-[30px] h-[10px] w-[10px] rotate-45 border-r border-b border-bone bg-surface" />
    </div>
  );
}
