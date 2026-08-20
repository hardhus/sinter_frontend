import React, { useState } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Users, Trash2, UserMinus, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { zCreateRoleRequest } from '@/api/generated/zod.gen';

interface ServerSettingsModalProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ServerSettingsModal({ serverId, isOpen, onClose }: ServerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');
  
  // Hooks
  const { useServerMembers, useKickMember } = useMembers(serverId);
  const { useServerRoles, useCreateRole, useDeleteRole, useAssignRole, useRemoveRole } = useRoles(serverId);

  const { data: members, isLoading: isMembersLoading } = useServerMembers();
  const { data: roles, isLoading: isRolesLoading } = useServerRoles();

  const kickMutation = useKickMember();
  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();

  // Create Role State
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<number>(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: roleName.trim(),
      permissions: Number(rolePermissions),
    };

    const validation = zCreateRoleRequest.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Rol bilgileri geçersiz.');
      return;
    }

    try {
      await createRoleMutation.mutateAsync(payload);
      setRoleName('');
      setSuccess('Rol başarıyla oluşturuldu!');
    } catch (err: any) {
      setError(err?.error || err?.message || 'Rol oluşturulurken hata oluştu.');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Bu rolü silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteRoleMutation.mutateAsync(roleId);
    } catch (err) {
      console.error('Delete role error:', err);
    }
  };

  const handleKickMember = async (userId: string, username: string) => {
    if (!confirm(`${username} isimli üyeyi sunucudan atmak istediğinizden emin misiniz?`)) return;
    try {
      await kickMutation.mutateAsync(userId);
    } catch (err) {
      console.error('Kick member error:', err);
    }
  };

  const handleToggleRole = async (memberUserId: string, memberRoles: string[], roleId: string, roleName: string) => {
    // Check if member already has this role name
    const hasRole = memberRoles.includes(roleName);

    try {
      if (hasRole) {
        await removeRoleMutation.mutateAsync({
          targetUserId: memberUserId,
          roleId: roleId,
        });
      } else {
        await assignRoleMutation.mutateAsync({
          targetUserId: memberUserId,
          body: { role_id: roleId },
        });
      }
    } catch (err: any) {
      alert(err?.error || err?.message || 'Rol güncellenirken hata oluştu.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <Card className="w-full max-w-3xl h-[480px] border-border bg-card/95 shadow-2xl relative flex overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Sidebar Tabs */}
        <div className="w-[180px] bg-muted/30 border-r border-border/10 p-3 flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Sunucu Ayarları
          </div>
          <Button
            variant={activeTab === 'roles' ? 'secondary' : 'ghost'}
            size="sm"
            className="justify-start gap-2 text-xs font-medium"
            onClick={() => {
              setActiveTab('roles');
              setError('');
              setSuccess('');
            }}
          >
            <Shield className="h-4 w-4" />
            Rol Yönetimi
          </Button>
          <Button
            variant={activeTab === 'members' ? 'secondary' : 'ghost'}
            size="sm"
            className="justify-start gap-2 text-xs font-medium"
            onClick={() => {
              setActiveTab('members');
              setError('');
              setSuccess('');
            }}
          >
            <Users className="h-4 w-4" />
            Üyeler ({members?.length || 0})
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col min-h-0">
          <div className="border-b border-border/10 pb-2 mb-4 shrink-0">
            <h2 className="text-base font-bold">
              {activeTab === 'roles' ? 'Rol Ayarları' : 'Üye Yönetimi'}
            </h2>
          </div>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/15 p-2.5 text-xs text-destructive shrink-0">
              <AlertCircle className="h-3.5 w-3.5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-500/15 p-2.5 text-xs text-green-500 shrink-0">
              <Check className="h-3.5 w-3.5" />
              <p>{success}</p>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="flex-1 flex gap-6 min-h-0">
              {/* Left Column: Create Role Form */}
              <form onSubmit={handleCreateRole} className="w-[220px] space-y-4 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Yeni Rol</span>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold">Rol Adı</label>
                  <Input
                    type="text"
                    placeholder="ör. Yönetici"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold">Yetki Maskesi (Permissions)</label>
                  <Input
                    type="number"
                    value={rolePermissions}
                    onChange={(e) => setRolePermissions(Number(e.target.value))}
                  />
                </div>
                <Button size="sm" type="submit" className="w-full text-xs" disabled={createRoleMutation.isPending}>
                  Rol Ekle
                </Button>
              </form>

              {/* Right Column: Roles list */}
              <div className="flex-1 flex flex-col min-h-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mb-3">Sunucu Rolleri</span>
                {isRolesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <div key={role.id} className="p-2.5 bg-muted/20 border border-border/5 rounded-lg flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{role.name}</span>
                            <span className="text-[9px] text-muted-foreground">Yetki: {role.permissions}</span>
                          </div>
                          {role.name !== '@everyone' && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-1 hover:bg-neutral-800 rounded text-muted-foreground hover:text-destructive focus:outline-none"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-10">Sunucu rolü bulunmuyor.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mb-3">Kullanıcı Listesi</span>
              {isMembersLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {members?.map((member) => (
                    <div key={member.user_id} className="p-3 bg-muted/20 border border-border/5 rounded-lg flex items-center justify-between gap-4">
                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-foreground">{member.username}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.roles.map((r, i) => (
                            <span key={i} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-semibold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Roles Assign / Kick Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Manage Roles Dropdown simulation or simple togglers */}
                        {roles && roles.length > 0 && (
                          <div className="flex gap-1">
                            {roles
                              .filter((r) => r.name !== '@everyone')
                              .map((role) => {
                                const hasRole = member.roles.includes(role.name);
                                return (
                                  <button
                                    key={role.id}
                                    onClick={() => handleToggleRole(member.user_id, member.roles, role.id, role.name)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                      hasRole
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-border/20 hover:bg-neutral-800 text-muted-foreground'
                                    }`}
                                  >
                                    {role.name}
                                  </button>
                                );
                              })}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="xs"
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleKickMember(member.user_id, member.username)}
                          disabled={kickMutation.isPending}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
