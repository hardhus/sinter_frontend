import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { wsClient, WsMessagePayload } from '@/lib/wsClient';
import { useQueryClient } from '@tanstack/react-query';
import type { MessageResponse } from '@/api/generated';

interface UseWebSocketResult {
  sendMessage: (content: string) => void;
  sendTyping: () => void;
  typingUsers: string[];
}

export function useWebSocket(channelId: string | undefined): UseWebSocketResult {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!channelId || !token) {
      wsClient.disconnect();
      setTypingUsers([]);
      return;
    }

    // Connect to the room
    wsClient.connect(channelId, token);

    // Track active typing indicators with timer timeouts
    const typingTimeouts = new Map<string, any>();

    // Listen to real-time events
    const unsubscribe = wsClient.addListener((data: WsMessagePayload) => {
      // Ignore messages from other channels if they happen to come through
      if (data.channel_id !== channelId) return;

      const queryKey = ['messages', channelId];

      switch (data.type) {
        case 'CHAT': {
          // Add message to cache if query already exists
          if (data.content && data.message_id) {
            const newMsg: MessageResponse = {
              id: data.message_id,
              channel_id: data.channel_id,
              user_id: data.user_id,
              username: data.username,
              content: data.content,
              created_at: new Date().toISOString(),
              is_edited: false,
              edited_at: null,
            };

            queryClient.setQueryData<any>(queryKey, (old: any) => {
              if (!old) return old;
              // Prepend to the first page's items
              const pages = [...old.pages];
              if (pages.length > 0) {
                // Ensure we don't add duplicates
                const exists = pages[0].items.some((item: any) => item.id === newMsg.id);
                if (!exists) {
                  pages[0] = {
                    ...pages[0],
                    items: [newMsg, ...pages[0].items],
                  };
                }
              }
              return { ...old, pages };
            });
          }

          // Clear typing state for this user when they send a message
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
          if (typingTimeouts.has(data.username)) {
            clearTimeout(typingTimeouts.get(data.username));
            typingTimeouts.delete(data.username);
          }
          break;
        }

        case 'TYPING': {
          setTypingUsers((prev) => {
            if (prev.includes(data.username)) return prev;
            return [...prev, data.username];
          });

          // Reset or create timeout to clear typing state after 3 seconds of inactivity
          if (typingTimeouts.has(data.username)) {
            clearTimeout(typingTimeouts.get(data.username));
          }

          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== data.username));
            typingTimeouts.delete(data.username);
          }, 3000);

          typingTimeouts.set(data.username, timeout);
          break;
        }

        case 'MESSAGE_EDITED': {
          if (data.message_id && data.edited_content) {
            queryClient.setQueryData<any>(queryKey, (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  items: page.items.map((item: any) =>
                    item.id === data.message_id
                      ? { ...item, content: data.edited_content, is_edited: true, edited_at: new Date().toISOString() }
                      : item
                  ),
                })),
              };
            });
          }
          break;
        }

        case 'MESSAGE_DELETED': {
          if (data.message_id) {
            queryClient.setQueryData<any>(queryKey, (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  items: page.items.filter((item: any) => item.id !== data.message_id),
                })),
              };
            });
          }
          break;
        }

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
      typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [channelId, token, queryClient]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    wsClient.send({
      type: 'CHAT',
      content,
    });
  };

  const sendTyping = () => {
    wsClient.send({
      type: 'TYPING',
    });
  };

  return {
    sendMessage,
    sendTyping,
    typingUsers,
  };
}
