import { useEffect, useMemo, useRef } from 'react';
import GreetingBubble from './chat/GreetingBubble';
import Launcher from './chat/Launcher';
import ChatWindow from './chat/ChatWindow';
import useChat from './chat/useChat';
import avatarImage from '../assets/nepton-avatar.jpg';
import './chat/chat.css';

export default function NeptonChatbot({ context = {}, onFlyToHotspot, avatarSrc = avatarImage }) {
  const launcherRef = useRef(null);
  const { open, setOpen, messages, input, setInput, loading, unread, showGreeting, dismissGreeting, sendMessage } = useChat(context);

  useEffect(() => {
    if (!open && launcherRef.current) {
      launcherRef.current.focus();
    }
  }, [open]);

  const prompts = useMemo(
    () => ['Peak month', 'Compare years', 'Explain FRP'],
    [],
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <div className="flex flex-col items-end gap-4">
          {showGreeting ? <GreetingBubble onDismiss={dismissGreeting} /> : null}
          <Launcher
            open={open}
            unread={unread}
            onOpen={() => setOpen(true)}
            avatarSrc={avatarSrc}
            launcherRef={launcherRef}
          />
        </div>
      ) : (
        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          loading={loading}
          sendMessage={sendMessage}
          onClose={() => setOpen(false)}
          onMinimize={() => setOpen(false)}
          context={context}
          onFlyToHotspot={onFlyToHotspot}
          avatarSrc={avatarSrc}
          prompts={prompts}
        />
      )}
    </div>
  );
}
