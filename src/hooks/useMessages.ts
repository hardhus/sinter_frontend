import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { PaginatedMessagesResponse, EditMessageRequest } from '@/api/generated';

export function useMessages(channelId?: string) {
  const queryClient = useQueryClient();

  const useGetMessages = (limit = 50) =>
    useInfiniteQuery<PaginatedMessagesResponse>({
      queryKey: ['messages', channelId],
      queryFn: async ({ pageParam }) => {
        const query: any = { channel_id: channelId!, limit };
        if (pageParam) {
          query.cursor = pageParam as string;
        }

        const res = await client.get<{ data: PaginatedMessagesResponse }, any, true>({
          url: '/messages',
          query,
          throwOnError: true,
        });
        return res.data || { items: [], next_cursor: null };
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
      enabled: !!channelId,
    });

  const useEditMessage = () =>
    useMutation({
      mutationFn: async ({ messageId, body }: { messageId: string; body: EditMessageRequest }) => {
        await client.patch<any, any, true>({
          url: '/messages/{message_id}',
          path: { message_id: messageId },
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
      },
    });

  const useDeleteMessage = () =>
    useMutation({
      mutationFn: async (messageId: string) => {
        await client.delete<void, any, true>({
          url: '/messages/{message_id}',
          path: { message_id: messageId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
      },
    });

  return {
    useGetMessages,
    useEditMessage,
    useDeleteMessage,
  };
}
