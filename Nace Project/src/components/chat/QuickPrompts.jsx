export default function QuickPrompts({ prompts = [], onPromptClick }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-line px-4 pb-3 pt-3">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onPromptClick(prompt)}
          className="h-[26px] shrink-0 border border-line-soft bg-transparent px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#c9c5bb] transition-colors hover:border-bone hover:bg-[#12141a] hover:text-bone focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
