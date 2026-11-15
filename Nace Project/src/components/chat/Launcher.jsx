import Avatar from './Avatar';

export default function Launcher({ open, unread, onOpen, avatarSrc, launcherRef }) {
  const launcherBorder = unread > 0 ? 'border-fire' : 'border-line-strong';

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={onOpen}
        aria-label="Open Nepton AI chat"
        aria-expanded={open}
        className={`br hidden h-[76px] w-[292px] items-stretch border bg-surface transition-all duration-300 hover:border-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:flex ${launcherBorder}`}
      >
        <span className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <span className="font-display text-[19px] font-semibold uppercase tracking-[0.2em] text-bone">Ask Nepton</span>
          <span className="lb mt-1 text-[9px] text-mute">Wildfire Analyst</span>
        </span>
        <span className="flex w-[76px] items-center justify-center border-l border-line-strong">
          <Avatar size="lg" status unread={unread} avatarSrc={avatarSrc} />
        </span>
      </button>

      <button
        ref={launcherRef}
        type="button"
        onClick={onOpen}
        aria-label="Open Nepton AI chat"
        aria-expanded={open}
        className={`br flex h-[76px] w-[76px] items-center justify-center border bg-surface transition-all duration-300 hover:border-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:hidden ${launcherBorder}`}
      >
        <Avatar size="lg" status unread={unread} avatarSrc={avatarSrc} />
      </button>
    </>
  );
}
