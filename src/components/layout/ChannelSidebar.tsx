import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useChannels } from '@/hooks/useChannels';
import { useServers } from '@/hooks/useServers';
import { useAuth } from '@/context/AuthContext';
import { UserPanel } from './UserPanel';
import { ServerSettingsModal } from '../server/ServerSettingsModal';
import { Hash, Volume2, Plus, Settings, LogOut, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { zCreateChannelRequest } from '@/api/generated/zod.gen';

interface ChannelSidebarProps {
  serverId: string;
  activeChannelId?: string;
}

export function ChannelSidebar({ serverId, activeChannelId }: ChannelSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useServerChannels, useCreateChannel, useDeleteChannel } = useChannels(serverId);
  const { useMyServers, useLeaveServer, useDeleteServer } = useServers();

  const { data: channels, isLoading: isChannelsLoading } = useServerChannels();
  const { data: servers } = useMyServers();

  const createChannelMutation = useCreateChannel();
  const deleteChannelMutation = useDeleteChannel();
  const leaveServerMutation = useLeaveServer();
  const deleteServerMutation = useDeleteServer();

  // Modal & Dropdown states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [error, setError] = useState('');

  // Find server details
  const server = servers?.find((s) => s.id === serverId);
  const isOwner = server?.owner_id === user?.id;

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
      server_id: serverId,
      channel_type: channelType,
    };

    const validation = zCreateChannelRequest.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Kanal bilgileri geçersiz.');
      return;
    }

    try {
      const newChannel = await createChannelMutation.mutateAsync(payload);
      setIsCreateOpen(false);
      setChannelName('');
      navigate({
        to: `/app/servers/${serverId}/channels/${newChannel.id}`,
      });
    } catch (err: any) {
      setError(err?.error || err?.message || 'Kanal oluşturulurken hata oluştu.');
    }
  };

  const handleLeaveServer = async () => {
    if (!confirm(`${server?.name} sunucusundan ayrılmak istediğinizden emin misiniz?`)) return;
    try {
      await leaveServerMutation.mutateAsync(serverId);
      navigate({ to: '/app/me' });
    } catch (err) {
      console.error('Leave server error:', err);
      alert('Sunucudan ayrılırken hata oluştu.');
    }
  };

  const handleDeleteServer = async () => {
    if (!confirm(`${server?.name} sunucusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) return;
    try {
      await deleteServerMutation.mutateAsync(serverId);
      navigate({ to: '/app/me' });
    } catch (err) {
      console.error('Delete server error:', err);
      alert('Sunucu silinirken hata oluştu.');
    }
  };

  const handleDeleteChannel = async (channelId: string, name: string) => {
    if (!confirm(`#${name} kanalını silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteChannelMutation.mutateAsync(channelId);
      if (activeChannelId === channelId) {
        navigate({ to: `/app/servers/${serverId}` });
      }
    } catch (err) {
      console.error('Delete channel error:', err);
      alert('Kanal silinirken hata oluştu.');
    }
  };

  return (
    <div className="w-[240px] bg-card/60 border-r border-border/10 flex flex-col h-full shrink-0 select-none">
      {/* Server Header Dropdown */}
      <div className="relative shrink-0">
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 border-b border-border/10 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors"
        >
          <span className="font-bold text-xs truncate max-w-[180px]">{server?.name || 'Sunucu'}</span>
          <Settings className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} />
        </div>

        {/* Server Actions Menu */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-11 left-2 right-2 bg-neutral-950/95 backdrop-blur border border-border/20 rounded-lg p-1.5 shadow-xl z-20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium hover:bg-muted/40 text-left cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    Sunucu Ayarları
                  </button>
                  <div className="h-[1px] bg-border/10 my-1" />
                </>
              )}

              {isOwner ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDeleteServer();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-destructive hover:bg-destructive/10 text-left cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sunucuyu Sil
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLeaveServer();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-destructive hover:bg-destructive/10 text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sunucudan Ayrıl
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Text Channels Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Metin Kanalları
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-4 w-4 text-muted-foreground hover:text-foreground hover:bg-neutral-800"
              onClick={() => {
                setChannelType('TEXT');
                setIsCreateOpen(true);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {isChannelsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {channels
                ?.filter((c) => c.channel_type === 'TEXT')
                .map((c) => (
                  <div
                    key={c.id}
                    className={`group/item flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/40 transition-colors font-medium ${
                      activeChannelId === c.id ? 'bg-muted/60 text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <Link
                      to={`/app/servers/${serverId}/channels/${c.id}`}
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                    >
                      <Hash className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </Link>

                    {/* Delete Channel (only for owner) */}
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteChannel(c.id, c.name)}
                        className="opacity-0 group-hover/item:opacity-100 hover:text-destructive focus:outline-none transition-all ml-1 shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Voice Channels Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ses Kanalları
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-4 w-4 text-muted-foreground hover:text-foreground hover:bg-neutral-800"
              onClick={() => {
                setChannelType('VOICE');
                setIsCreateOpen(true);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-0.5">
            {channels
              ?.filter((c) => c.channel_type === 'VOICE')
              .map((c) => (
                <div
                  key={c.id}
                  className="group/item flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/40 transition-colors font-medium text-muted-foreground cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDeleteChannel(c.id, c.name)}
                      className="opacity-0 group-hover/item:opacity-100 hover:text-destructive focus:outline-none transition-all ml-1 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      <UserPanel />

      {/* Create Channel Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border bg-card/90 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Kanal Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Kanal Adı</label>
                  <Input
                    type="text"
                    placeholder="ör. sohbet-odasi"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Kanal Tipi</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="channelType"
                        checked={channelType === 'TEXT'}
                        onChange={() => setChannelType('TEXT')}
                        className="h-4 w-4"
                      />
                      Metin Kanalı (#)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="channelType"
                        checked={channelType === 'VOICE'}
                        onChange={() => setChannelType('VOICE')}
                        className="h-4 w-4"
                      />
                      Ses Kanalı (🔊)
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                    İptal
                  </Button>
                  <Button size="sm" type="submit" disabled={createChannelMutation.isPending}>
                    {createChannelMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Server Settings Modal Dialog */}
      <ServerSettingsModal
        serverId={serverId}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
