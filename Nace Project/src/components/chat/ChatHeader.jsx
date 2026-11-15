import { Minus, X } from 'lucide-react';
import Avatar from './Avatar';

export default function ChatHeader({ avatarSrc, onClose, onMinimize }) {
  return (
    <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
      <div className="flex items-center gap-3.5">
        <Avatar size="md" status avatarSrc={avatarSrc} />
        <div>
          <div className="font-display text-[20px] font-semibold uppercase tracking-[0.22em] text-bone">Nepton AI</div>
          <div className="lb mt-1">Wildfire Analyst · Online</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Minimize"
          onClick={onMinimize}
          className="flex h-[28px] w-[28px] items-center justify-center border border-line-soft bg-surface text-bone transition-colors hover:border-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-[28px] w-[28px] items-center justify-center border border-line-soft bg-surface text-bone transition-colors hover:border-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
