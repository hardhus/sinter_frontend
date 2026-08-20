import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useServers } from '@/hooks/useServers';
import { Compass, Plus, MessageSquare, LogIn, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { zCreateServerRequest } from '@/api/generated/zod.gen';

export function ServerSidebar() {
  const routerState = useRouterState();
  const { useMyServers, useCreateServer, useJoinServer } = useServers();
  const { data: servers, isLoading } = useMyServers();
  const createServerMutation = useCreateServer();
  const joinServerMutation = useJoinServer();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverDesc, setServerDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // Determinisitc pastel color based on server name
  const getServerColorClass = (name: string) => {
    const colors = [
      'bg-red-500/20 text-red-300 border-red-500/30',
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: serverName,
      description: serverDesc || null,
      is_public: isPublic,
    };

    const validation = zCreateServerRequest.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Giriş bilgileri geçersiz.');
      return;
    }

    try {
      await createServerMutation.mutateAsync(payload);
      setIsCreateOpen(false);
      setServerName('');
      setServerDesc('');
    } catch (err: any) {
      setError(err?.error || err?.message || 'Sunucu oluşturulurken hata oluştu.');
    }
  };

  const handleJoinServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinCode.trim()) {
      setError('Lütfen geçerli bir sunucu kodu girin.');
      return;
    }

    try {
      await joinServerMutation.mutateAsync(joinCode.trim());
      setIsJoinOpen(false);
      setJoinCode('');
    } catch (err: any) {
      setError(err?.error || err?.message || 'Sunucuya katılırken hata oluştu.');
    }
  };

  const currentPath = routerState.location.pathname;

  return (
    <div className="w-[72px] bg-[#111] h-full flex flex-col items-center py-3 space-y-2 shrink-0 select-none">
      {/* Home / DM Button */}
      <Link
        to="/app/me"
        className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-neutral-800 hover:bg-primary text-foreground hover:text-white transition-all duration-300 ease-out [&.active]:rounded-[16px] [&.active]:bg-primary [&.active]:text-white"
        activeProps={{ className: 'active' }}
      >
        {/* Left Vurgu Çubuğu */}
        <div className="absolute left-0 w-[4px] bg-white rounded-r-lg transition-all duration-300 scale-0 group-hover:scale-100 group-hover:h-5 group-[.active]:scale-100 group-[.active]:h-10 -ml-[12px]" />
        <MessageSquare className="h-5 w-5" />
      </Link>

      {/* Seperator */}
      <div className="w-8 h-[2px] bg-neutral-800 rounded my-1" />

      {/* Loading State */}
      {isLoading && (
        <div className="py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Servers List */}
      <div className="flex-1 w-full space-y-2 overflow-y-auto no-scrollbar flex flex-col items-center">
        {servers?.map((server) => {
          const isActive = currentPath.includes(`/app/servers/${server.id}`);
          const initials = server.name.substring(0, 2).toUpperCase();

          return (
            <Link
              key={server.id}
              to={`/app/servers/${server.id}`}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] border border-transparent font-bold transition-all duration-300 ease-out ${
                isActive
                  ? 'rounded-[16px] bg-primary text-white border-primary/20'
                  : getServerColorClass(server.name)
              }`}
            >
              {/* Left Vurgu Çubuğu */}
              <div
                className={`absolute left-0 w-[4px] bg-white rounded-r-lg transition-all duration-300 -ml-[12px] ${
                  isActive ? 'scale-100 h-10' : 'scale-0 group-hover:scale-100 group-hover:h-5'
                }`}
              />
              <span className="text-sm tracking-wider">{initials}</span>
            </Link>
          );
        })}

        {/* Action Buttons */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-neutral-800 hover:bg-green-600 text-green-500 hover:text-white transition-all duration-300 ease-out cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </button>

        <button
          onClick={() => setIsJoinOpen(true)}
          className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-neutral-800 hover:bg-blue-600 text-blue-500 hover:text-white transition-all duration-300 ease-out cursor-pointer"
        >
          <LogIn className="h-5 w-5" />
        </button>
      </div>

      {/* Seperator */}
      <div className="w-8 h-[2px] bg-neutral-800 rounded my-1" />

      {/* Discover / Compass Button */}
      <Link
        to="/app/discover"
        className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-neutral-800 hover:bg-primary text-foreground hover:text-white transition-all duration-300 ease-out [&.active]:rounded-[16px] [&.active]:bg-primary [&.active]:text-white"
        activeProps={{ className: 'active' }}
      >
        <div className="absolute left-0 w-[4px] bg-white rounded-r-lg transition-all duration-300 scale-0 group-hover:scale-100 group-hover:h-5 group-[.active]:scale-100 group-[.active]:h-10 -ml-[12px]" />
        <Compass className="h-5 w-5" />
      </Link>

      {/* Create Server Modal (Overlay Dialog) */}
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
              <CardTitle className="text-lg font-bold">Sunucu Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateServer} className="space-y-4">
                {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sunucu Adı</label>
                  <Input
                    type="text"
                    placeholder="ör. Sinter Kodlama Kulübü"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Açıklama</label>
                  <Input
                    type="text"
                    placeholder="Topluluğunuzu birkaç kelimeyle açıklayın..."
                    value={serverDesc}
                    onChange={(e) => setServerDesc(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_public" className="text-xs font-medium text-muted-foreground">
                    Herkese açık (Discover'da listelensin)
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                    İptal
                  </Button>
                  <Button size="sm" type="submit" disabled={createServerMutation.isPending}>
                    {createServerMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Server Modal (Overlay Dialog) */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border bg-card/90 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Bir Sunucuya Katıl</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinServer} className="space-y-4">
                {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sunucu Kimliği (UUID / ID)</label>
                  <Input
                    type="text"
                    placeholder="ör. 00000000-0000-0000-0000-000000000000"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsJoinOpen(false)}>
                    İptal
                  </Button>
                  <Button size="sm" type="submit" disabled={joinServerMutation.isPending}>
                    {joinServerMutation.isPending ? 'Katılınıyor...' : 'Katıl'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
