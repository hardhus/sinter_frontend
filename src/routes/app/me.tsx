import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { UserPanel } from '@/components/layout/UserPanel';
import { FriendList } from '@/components/friends/FriendList';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useFriends } from '@/hooks/useFriends';
import { zFriendActionRequest } from '@/api/generated/zod.gen';
import { Users, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/app/me')({
  component: MePage,
});

function MePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'add'>('all');
  const { useAddFriend } = useFriends();
  const addMutation = useAddFriend();

  const [friendInput, setFriendInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      target_username_or_email: friendInput.trim(),
    };

    const validation = zFriendActionRequest.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Giriş geçersiz.');
      return;
    }

    try {
      await addMutation.mutateAsync(payload);
      setSuccess('Arkadaşlık isteği başarıyla gönderildi!');
      setFriendInput('');
    } catch (err: any) {
      setError(err?.error || err?.message || 'İstek gönderilirken hata oluştu.');
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Middle sidebar: DM channels list */}
      <div className="w-[240px] bg-card/60 border-r border-border/10 flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-border/10">
          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" size="sm">
            <Users className="h-4 w-4" />
            Arkadaşlar
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Direkt Mesajlar
          </div>
          {/* DM channels placeholder list */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">Henüz konuşma yok</p>
          </div>
        </div>
        <UserPanel />
      </div>

      {/* Right panel: Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Navigation Bar */}
        <div className="h-[48px] border-b border-border/10 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              Arkadaşlar
            </div>
            <div className="h-4 w-[1px] bg-border/20" />
            <div className="flex items-center gap-1.5">
              <Button
                variant={activeTab === 'all' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setActiveTab('all')}
              >
                Tümü
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setActiveTab('pending')}
              >
                Bekleyenler
              </Button>
              <Button
                variant={activeTab === 'add' ? 'default' : 'ghost'}
                size="xs"
                className={activeTab === 'add' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                onClick={() => setActiveTab('add')}
              >
                Arkadaş Ekle
              </Button>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Dynamic content depending on activeTab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'all' && <FriendList />}
          {activeTab === 'pending' && (
            <div className="p-4 text-sm text-muted-foreground">Bekleyen arkadaşlık isteği bulunmuyor.</div>
          )}
          {activeTab === 'add' && (
            <div className="p-6 max-w-lg space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Arkadaş Ekle</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Kullanıcıları Sinter kullanıcı adları veya e-posta adresleriyle arkadaş olarak ekleyebilirsiniz.
                </p>
              </div>
              <form onSubmit={handleAddFriend} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-xs text-green-500">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <p>{success}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Kullanıcı adı veya e-posta girin..."
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    className="flex-1 h-9"
                    required
                  />
                  <Button size="sm" type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? 'Gönderiliyor...' : 'İstek Gönder'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
