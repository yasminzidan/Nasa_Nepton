import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ messages = [], loading = false, avatarSrc, onFlyToHotspot }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const firstRender = listRef.current.dataset.firstRender === 'true';
    listRef.current.dataset.firstRender = 'false';

    if (firstRender) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.dataset.firstRender = 'true';
    }
  }, []);

  return (
    <div
      ref={listRef}
      role="log"
      aria-live="polite"
      className="chat-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} avatarSrc={avatarSrc} onFlyToHotspot={onFlyToHotspot} />
      ))}
      {loading ? <TypingIndicator avatarSrc={avatarSrc} /> : null}
    </div>
  );
}
