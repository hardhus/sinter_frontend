import { useEffect, useRef, UIEvent } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageItem } from './MessageItem';
import { Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const { useGetMessages } = useMessages(channelId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetMessages();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Flatten and reverse to show chronological order (newest messages at the bottom)
  const messages = [...(data?.pages.flatMap((page: any) => page.items) || [])].reverse();

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    isInitialLoad.current = true;
  }, [channelId]);

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      scrollToBottom('auto');
      isInitialLoad.current = false;
    }
  }, [messages.length]);

  // Monitor scrolling to load more history at top
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      // Capture height before fetching
      const previousScrollHeight = target.scrollHeight;
      
      fetchNextPage().then(() => {
        // Adjust scroll position after page load to prevent jumpiness
        setTimeout(() => {
          if (target) {
            target.scrollTop = target.scrollHeight - previousScrollHeight;
          }
        }, 50);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Mesajlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col"
      >
        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center pb-4 shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-[10px] h-7 px-3 text-muted-foreground border-border/10 bg-neutral-900/30 hover:bg-neutral-800"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : null}
              Daha Eski Mesajları Yükle
            </Button>
          </div>
        )}

        {/* Message Items */}
        {messages.length > 0 ? (
          <div className="flex flex-col">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              
              // Group logic (compact mode)
              // If from same user AND sent within 3 minutes (180000ms), group them
              let isCompact = false;
              if (prevMessage && prevMessage.user_id === message.user_id) {
                const diff = new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime();
                if (diff < 180000) {
                  isCompact = true;
                }
              }

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  compact={isCompact}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-3">
              #
            </div>
            <h4 className="text-sm font-bold">Kanal Sohbet Başlangıcı</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Bu, bu kanalın sohbet geçmişinin başlangıcıdır. İlk mesajı siz yazın!
            </p>
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {scrollRef.current &&
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop > 800 && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all z-10 border border-primary/20 shrink-0"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
    </div>
  );
}
