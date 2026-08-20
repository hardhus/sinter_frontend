import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { ChannelResponse, CreateChannelRequest } from '@/api/generated';

export function useChannels(serverId?: string) {
  const queryClient = useQueryClient();

  const useServerChannels = () =>
    useQuery<ChannelResponse[]>({
      queryKey: ['channels', serverId],
      queryFn: async () => {
        if (!serverId) return [];
        const res = await client.get<{ data: ChannelResponse[] }, any, true>({
          url: '/channels',
          query: { server_id: serverId },
          throwOnError: true,
        });
        return res.data || [];
      },
      enabled: !!serverId,
    });

  const useCreateChannel = () =>
    useMutation({
      mutationFn: async (body: CreateChannelRequest) => {
        const res = await client.post<{ data: ChannelResponse }, any, true>({
          url: '/channels',
          body,
          throwOnError: true,
        });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      },
    });

  const useDeleteChannel = () =>
    useMutation({
      mutationFn: async (channelId: string) => {
        await client.delete<void, any, true>({
          url: '/channels/{channel_id}',
          path: { channel_id: channelId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      },
    });

  return {
    useServerChannels,
    useCreateChannel,
    useDeleteChannel,
  };
}
