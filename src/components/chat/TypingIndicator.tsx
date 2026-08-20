
interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) {
    return <div className="h-5 shrink-0 select-none" />;
  }

  // Format typing message
  let text = '';
  if (users.length === 1) {
    text = `${users[0]} yazıyor...`;
  } else if (users.length === 2) {
    text = `${users[0]} ve ${users[1]} yazıyor...`;
  } else if (users.length === 3) {
    text = `${users[0]}, ${users[1]} ve ${users[2]} yazıyor...`;
  } else {
    text = 'Birkaç kişi yazıyor...';
  }

  return (
    <div className="h-5 px-4 flex items-center gap-2 text-[10px] text-muted-foreground select-none shrink-0">
      {/* Bouncing typing animation dots */}
      <div className="flex gap-0.5 items-center mt-[1px]">
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="font-semibold">{text}</span>
    </div>
  );
}
