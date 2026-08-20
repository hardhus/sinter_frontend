import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { NotificationResponse, MarkReadRequest } from '@/api/generated';

export function useNotifications() {
  const queryClient = useQueryClient();

  const useUnreadNotifications = () =>
    useQuery<NotificationResponse[]>({
      queryKey: ['notifications'],
      queryFn: async () => {
        const res = await client.get<{ data: NotificationResponse[] }, any, true>({
          url: '/notifications',
          throwOnError: true,
        });
        return res.data || [];
      },
      refetchInterval: 15000, // Poll every 15 seconds
    });

  const useMarkAsRead = () =>
    useMutation({
      mutationFn: async (body: MarkReadRequest) => {
        await client.patch<void, any, true>({
          url: '/notifications/read',
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });

  return {
    useUnreadNotifications,
    useMarkAsRead,
  };
}
