export function TypingIndicator() {
  return (
    <div className="bubble" aria-live="polite" aria-label="Steward is thinking">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-[color:var(--muted)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-[color:var(--muted)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-[color:var(--muted)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
