import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
  onTyping: () => void;
}

export function MessageInput({ channelName, onSend, onTyping }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTime = useRef<number>(0);

  // Focus input on channel switch
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      setContent('');
    }
  }, [channelName]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSend(content.trim());
    setContent('');

    // Reset height of textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-grow textarea height
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Debounce typing signal: only send typing signal once every 1.5 seconds of writing
    const now = Date.now();
    if (now - lastTypingTime.current > 1500) {
      onTyping();
      lastTypingTime.current = now;
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border/10 shrink-0">
      <div className="relative flex items-center bg-muted/10 hover:bg-muted/15 border border-border/15 rounded-xl px-3 py-1.5 focus-within:border-primary/50 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`#${channelName} kanalına mesaj gönder...`}
          className="flex-1 max-h-[120px] min-h-[24px] bg-transparent text-sm outline-none resize-none no-scrollbar py-1 pr-10 text-foreground placeholder:text-muted-foreground font-medium leading-relaxed"
          style={{ height: 'auto' }}
        />

        <div className="absolute right-3 bottom-2 flex items-center gap-1.5 text-muted-foreground select-none shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="p-1.5 hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
