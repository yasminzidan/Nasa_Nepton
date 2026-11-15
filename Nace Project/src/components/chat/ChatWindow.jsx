import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ContextStrip from './ContextStrip';
import MessageList from './MessageList';
import QuickPrompts from './QuickPrompts';

export default function ChatWindow({
  messages,
  input,
  setInput,
  loading,
  sendMessage,
  onClose,
  onMinimize,
  context,
  onFlyToHotspot,
  avatarSrc,
  prompts,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const focusTarget = dialogRef.current?.querySelector('textarea');
    if (focusTarget) {
      focusTarget.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (!focusable.length) return;

        const startIndex = Array.from(focusable).indexOf(document.activeElement);
        if (event.shiftKey && startIndex <= 0) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        }

        if (!event.shiftKey && startIndex === focusable.length - 1) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shouldShowQuickPrompts = messages.filter((message) => message.role === 'user').length === 0;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Nepton AI chat"
      className="br fixed inset-0 h-screen w-screen border border-line bg-surface transition-all duration-300 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(700px,calc(100vh-48px))] sm:w-[420px]"
    >
      <div className="flex h-full flex-col bg-surface">
        <ChatHeader avatarSrc={avatarSrc} onClose={onClose} onMinimize={onMinimize} />
        <ContextStrip context={context} />
        <MessageList loading={loading} messages={messages} avatarSrc={avatarSrc} onFlyToHotspot={onFlyToHotspot} />
        {shouldShowQuickPrompts ? <QuickPrompts prompts={prompts} onPromptClick={sendMessage} /> : null}
        <ChatInput input={input} setInput={setInput} loading={loading} sendMessage={() => sendMessage(input)} />
      </div>
    </div>
  );
}
