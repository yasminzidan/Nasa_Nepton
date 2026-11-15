import Avatar from './Avatar';
import DataCard from './DataCard';

export default function Message({ message, avatarSrc, onFlyToHotspot }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="mb-1 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-mute">You · {formatTime(message.timestamp)}</div>
          <div className="border border-bone bg-bone/5 px-3 py-2.5 text-[12px] leading-relaxed text-bone">
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm" avatarSrc={avatarSrc} />
      <div className="max-w-[85%] flex-1">
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mute">Nepton · {formatTime(message.timestamp)}</div>
        <div className="border border-line bg-surface-2 px-3 py-2.5 text-[12px] leading-relaxed text-bone">
          {message.text || '…'}
        </div>
        {message.hotspot ? <DataCard hotspot={message.hotspot} onFlyToHotspot={onFlyToHotspot} /> : null}
        {message.sources && message.sources.length > 0 ? (
          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-dim">
            SRC · {message.sources.join(' · ') }
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  if (!timestamp) {
    return 'HH:MM';
  }

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
