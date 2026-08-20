import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { MemberResponse } from '@/api/generated';

export function useMembers(serverId?: string) {
  const queryClient = useQueryClient();

  const useServerMembers = () =>
    useQuery<MemberResponse[]>({
      queryKey: ['members', serverId],
      queryFn: async () => {
        if (!serverId) return [];
        const res = await client.get<{ data: MemberResponse[] }, any, true>({
          url: '/servers/{server_id}/members',
          path: { server_id: serverId },
          throwOnError: true,
        });
        return res.data || [];
      },
      enabled: !!serverId,
    });

  const useKickMember = () =>
    useMutation({
      mutationFn: async (userId: string) => {
        await client.delete<void, any, true>({
          url: '/servers/{server_id}/members/{user_id}',
          path: { server_id: serverId!, user_id: userId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      },
    });

  return {
    useServerMembers,
    useKickMember,
  };
}
