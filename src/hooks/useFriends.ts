import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { FriendResponse, FriendActionRequest, DirectMessageRequest, DmChannelResponse } from '@/api/generated';

export function useFriends() {
  const queryClient = useQueryClient();

  const useMyFriends = () =>
    useQuery<FriendResponse[]>({
      queryKey: ['friends'],
      queryFn: async () => {
        const res = await client.get<{ data: FriendResponse[] }, any, true>({
          url: '/chat/friends',
          throwOnError: true,
        });
        return res.data || [];
      },
    });

  const useAddFriend = () =>
    useMutation({
      mutationFn: async (body: FriendActionRequest) => {
        await client.post<any, any, true>({
          url: '/chat/friends',
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
      },
    });

  const useBlockUser = () =>
    useMutation({
      mutationFn: async (body: FriendActionRequest) => {
        await client.post<any, any, true>({
          url: '/chat/friends/block',
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
      },
    });

  const useOpenDm = () =>
    useMutation({
      mutationFn: async (body: DirectMessageRequest) => {
        const res = await client.post<{ data: DmChannelResponse }, any, true>({
          url: '/chat/dm',
          body,
          throwOnError: true,
        });
        return res.data;
      },
    });

  return {
    useMyFriends,
    useAddFriend,
    useBlockUser,
    useOpenDm,
  };
}
