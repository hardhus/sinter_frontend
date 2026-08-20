import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/generated/client.gen';
import type { RoleResponse, CreateRoleRequest, AssignRoleRequest } from '@/api/generated';

export function useRoles(serverId?: string) {
  const queryClient = useQueryClient();

  const useServerRoles = () =>
    useQuery<RoleResponse[]>({
      queryKey: ['roles', serverId],
      queryFn: async () => {
        if (!serverId) return [];
        const res = await client.get<{ data: RoleResponse[] }, any, true>({
          url: '/servers/{server_id}/roles',
          path: { server_id: serverId },
          throwOnError: true,
        });
        return res.data || [];
      },
      enabled: !!serverId,
    });

  const useCreateRole = () =>
    useMutation({
      mutationFn: async (body: CreateRoleRequest) => {
        const res = await client.post<{ data: RoleResponse }, any, true>({
          url: '/servers/{server_id}/roles',
          path: { server_id: serverId! },
          body,
          throwOnError: true,
        });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles', serverId] });
      },
    });

  const useDeleteRole = () =>
    useMutation({
      mutationFn: async (roleId: string) => {
        await client.delete<void, any, true>({
          url: '/servers/{server_id}/roles/{role_id}',
          path: { server_id: serverId!, role_id: roleId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles', serverId] });
      },
    });

  const useAssignRole = () =>
    useMutation({
      mutationFn: async ({ targetUserId, body }: { targetUserId: string; body: AssignRoleRequest }) => {
        await client.post<any, any, true>({
          url: '/servers/{server_id}/members/{target_user_id}/roles',
          path: { server_id: serverId!, target_user_id: targetUserId },
          body,
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      },
    });

  const useRemoveRole = () =>
    useMutation({
      mutationFn: async ({ targetUserId, roleId }: { targetUserId: string; roleId: string }) => {
        await client.delete<void, any, true>({
          url: '/servers/{server_id}/members/{target_user_id}/roles/{role_id}',
          path: { server_id: serverId!, target_user_id: targetUserId, role_id: roleId },
          throwOnError: true,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      },
    });

  return {
    useServerRoles,
    useCreateRole,
    useDeleteRole,
    useAssignRole,
    useRemoveRole,
  };
}
