import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { ServerResponse, CreateServerRequest } from '@/api/generated';

export function useServers() {
  const queryClient = useQueryClient();

  // List servers I belong to
  const useMyServers = () =>
    useQuery<ServerResponse[]>({
      queryKey: ['servers'],
      queryFn: async () => {
        const res = await client.get<{ data: ServerResponse[] }, any, true>({
          url: '/servers/me',
          throwOnError: true,
        });
        return res.data || [];
      },
    });

  // Create server
  const useCreateServer = () =>
    useMutation({
      mutationFn: async (body: CreateServerRequest) => {
        const res = await client.post<{ data: ServerResponse }, any, true>({
          url: '/servers',
          body,
          throwOnError: true,
        });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['servers'] });
      },
    });

  // Join server
  const useJoinServer = () =>
    useMutation({
      mutationFn: async (serverId: string) => {
        const res = await client.post<{ data: ServerResponse }, any, true>({
          url: '/servers/{server_id}/join',
          path: { server_id: serverId },
          throwOnError: true,
        });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['servers'] });
      },
    });

  // Leave server
  const useLeaveServer = () =>
    useMutation({
      mutationFn: async (serverId: string) => {
        await client.delete<void, any, true>({
          url: '/servers/{server_id}/members/me',
          path: { server_id: serverId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['servers'] });
      },
    });

  // Delete server
  const useDeleteServer = () =>
    useMutation({
      mutationFn: async (serverId: string) => {
        await client.delete<void, any, true>({
          url: '/servers/{server_id}',
          path: { server_id: serverId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['servers'] });
      },
    });

  // Discover public servers
  const useDiscoverServers = (searchQuery = '', limit = 20) =>
    useQuery<ServerResponse[]>({
      queryKey: ['servers', 'discover', searchQuery, limit],
      queryFn: async () => {
        const res = await client.get<{ data: ServerResponse[] }, any, true>({
          url: '/servers/discover',
          query: { q: searchQuery, limit },
          throwOnError: true,
        });
        return res.data || [];
      },
    });

  return {
    useMyServers,
    useCreateServer,
    useJoinServer,
    useLeaveServer,
    useDeleteServer,
    useDiscoverServers,
  };
}
