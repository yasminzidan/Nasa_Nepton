import Avatar from './Avatar';

export default function TypingIndicator({ avatarSrc }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm" avatarSrc={avatarSrc} />
      <div className="flex items-center gap-3 border border-line bg-surface-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="typing-dot h-[6px] w-[6px] bg-fire" />
          <span className="typing-dot h-[6px] w-[6px] bg-fire" />
          <span className="typing-dot h-[6px] w-[6px] bg-fire" />
        </div>
        <span className="lb text-dim">Analyzing archive</span>
      </div>
    </div>
  );
}
