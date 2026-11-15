const sizes = {
  sm: 'h-[28px] w-[28px] p-[2px]',
  md: 'h-[52px] w-[52px] p-[3px]',
  lg: 'h-[76px] w-[76px] p-[5px]',
};

export default function Avatar({ size = 'sm', status = false, unread = 0, avatarSrc = '/src/assets/nepton-avatar.jpg' }) {
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <div className={`relative shrink-0 overflow-hidden border border-line-strong bg-surface ${sizeClass}`}>
      <img src={avatarSrc} alt="Nepton avatar" className="h-full w-full object-cover" />
      {status ? (
        <span className="absolute -bottom-1 -right-1 h-[9px] w-[9px] border border-surface bg-fire" />
      ) : null}
      {Number(unread) > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center border border-surface bg-fire font-mono text-[10px] text-void">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </div>
  );
}
