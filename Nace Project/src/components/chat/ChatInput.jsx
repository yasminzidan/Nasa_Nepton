import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ChatInput({ input, setInput, loading, sendMessage }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 96);
    textareaRef.current.style.height = `${nextHeight}px`;
  }, [input]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-line px-4 pb-3 pt-3.5">
      <div className="flex items-end gap-0 border border-line-strong bg-surface transition-colors focus-within:border-bone">
        <span className="px-3 pb-3 text-fire">&gt;</span>
        <textarea
          ref={textareaRef}
          aria-label="Message input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={1000}
          placeholder="Ask about hotspots, trends…"
          className="max-h-24 min-h-[40px] flex-1 resize-none border-0 bg-transparent px-0 py-3 font-mono text-[12px] text-bone placeholder:text-mute focus:outline-none"
        />
        <button
          type="button"
          aria-label="Send"
          disabled={input.trim() === '' || loading}
          onClick={() => sendMessage()}
          className="flex h-[44px] w-[44px] items-center justify-center bg-bone text-void transition-colors hover:bg-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-dim">
        Enter to send · Shift+Enter new line · AI can be wrong, verify with source data
      </div>
    </div>
  );
}
