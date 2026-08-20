import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { UserProfileResponse, UpdateUserSettingsRequest, SessionResponse } from '@/api/generated';

export function useMe() {
  const queryClient = useQueryClient();

  const useProfile = () =>
    useQuery<UserProfileResponse>({
      queryKey: ['me'],
      queryFn: async () => {
        const res = await client.get<{ data: UserProfileResponse }, any, true>({
          url: '/users/me',
          throwOnError: true,
        });
        return res.data!;
      },
    });

  const useUpdateSettings = () =>
    useMutation({
      mutationFn: async (body: UpdateUserSettingsRequest) => {
        await client.patch<any, any, true>({
          url: '/users/me/settings',
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['me'] });
      },
    });

  const useSessions = () =>
    useQuery<SessionResponse[]>({
      queryKey: ['sessions'],
      queryFn: async () => {
        const res = await client.get<{ data: SessionResponse[] }, any, true>({
          url: '/auth/sessions',
          throwOnError: true,
        });
        return res.data || [];
      },
    });

  const useRevokeSession = () =>
    useMutation({
      mutationFn: async (sessionId: string) => {
        await client.delete<void, any, true>({
          url: '/auth/sessions/{session_id}',
          path: { session_id: sessionId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      },
    });

  const useLogoutAll = () =>
    useMutation({
      mutationFn: async () => {
        await client.post<any, any, true>({
          url: '/auth/logout-all',
          throwOnError: true,
        });
      },
    });

  return {
    useProfile,
    useUpdateSettings,
    useSessions,
    useRevokeSession,
    useLogoutAll,
  };
}
