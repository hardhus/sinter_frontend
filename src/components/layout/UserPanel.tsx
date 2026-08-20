import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMe } from '@/hooks/useMe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Settings, LogOut, Shield, ShieldCheck, Key, Laptop, X, Loader2, AlertCircle } from 'lucide-react';
import { zUpdateUserSettingsRequest } from '@/api/generated/zod.gen';

export function UserPanel() {
  const { user, logout } = useAuth();
  const { useProfile, useUpdateSettings, useSessions, useRevokeSession, useLogoutAll } = useMe();
  
  // Queries
  const { data: profile } = useProfile();
  const { data: sessions, isLoading: isSessionsLoading } = useSessions();
  const updateSettingsMutation = useUpdateSettings();
  const revokeSessionMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'sessions'>('profile');
  
  // Profile settings state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initial Form Populate
  const handleOpenSettings = () => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setIsProfilePublic(profile.is_profile_public);
      setShowOnlineStatus(profile.show_online_status);
    }
    setError('');
    setSuccess('');
    setIsOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    };

    const validation = zUpdateUserSettingsRequest.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Profil ayarları geçersiz.');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync(payload);
      setSuccess('Profiliniz başarıyla güncellendi!');
    } catch (err: any) {
      setError(err?.error || err?.message || 'Profil güncellenirken hata oluştu.');
    }
  };

  const handleUpdatePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      is_profile_public: isProfilePublic,
      show_online_status: showOnlineStatus,
    };

    try {
      await updateSettingsMutation.mutateAsync(payload);
      setSuccess('Gizlilik ayarlarınız güncellendi!');
    } catch (err: any) {
      setError(err?.error || err?.message || 'Gizlilik ayarları güncellenirken hata oluştu.');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Bu oturumu sonlandırmak istediğinizden emin misiniz?')) return;
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
    } catch (err) {
      console.error('Session revoke error:', err);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Tüm cihazlardaki oturumları kapatmak istediğinizden emin misiniz?')) return;
    try {
      await logoutAllMutation.mutateAsync();
      alert('Tüm cihazlardan çıkış yapıldı.');
      logout();
    } catch (err) {
      console.error('Logout all error:', err);
    }
  };

  // Determinisitc pastel color based on username
  const getUserColorClass = (name: string) => {
    const bgColors = ['bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-indigo-500'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return bgColors[sum % bgColors.length];
  };

  const userInitial = user?.username ? user.username[0].toUpperCase() : 'U';

  return (
    <>
      <div className="h-[52px] bg-neutral-900 border-t border-border/10 flex items-center justify-between px-2.5 mt-auto shrink-0 select-none">
        {/* User Info with Avatar */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white relative shrink-0 ${getUserColorClass(user?.username || '')}`}>
            {userInitial}
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-[2px] border-neutral-900 rounded-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate text-foreground leading-tight">
              {profile?.display_name || user?.username}
            </span>
            <span className="text-[10px] text-muted-foreground truncate leading-none">
              @{user?.username}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-neutral-800" onClick={handleOpenSettings}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* User Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl h-[450px] border-border bg-card/95 shadow-2xl relative flex overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Sidebar tabs */}
            <div className="w-[180px] bg-muted/30 border-r border-border/10 p-3 flex flex-col gap-1 select-none">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                Kullanıcı Ayarları
              </div>
              <Button
                variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start gap-2 text-xs font-medium"
                onClick={() => setActiveTab('profile')}
              >
                <Shield className="h-4 w-4" />
                Profil Detayları
              </Button>
              <Button
                variant={activeTab === 'privacy' ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start gap-2 text-xs font-medium"
                onClick={() => setActiveTab('privacy')}
              >
                <ShieldCheck className="h-4 w-4" />
                Gizlilik & Durum
              </Button>
              <Button
                variant={activeTab === 'sessions' ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start gap-2 text-xs font-medium"
                onClick={() => setActiveTab('sessions')}
              >
                <Key className="h-4 w-4" />
                Aktif Oturumlar
              </Button>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col">
              {/* Tab Header */}
              <div className="border-b border-border/10 pb-2 mb-4">
                <h2 className="text-base font-bold capitalize">
                  {activeTab === 'profile' && 'Profil Ayarları'}
                  {activeTab === 'privacy' && 'Gizlilik & Görünüm'}
                  {activeTab === 'sessions' && 'Oturum Yönetimi'}
                </h2>
              </div>

              {/* Success / Error Banners */}
              {error && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/15 p-2.5 text-xs text-destructive shrink-0">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-500/15 p-2.5 text-xs text-green-500 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <p>{success}</p>
                </div>
              )}

              {/* Profile Details Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Görünen Ad</label>
                      <Input
                        type="text"
                        placeholder="ör. Şeyma Nur"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avatar Resmi URL</label>
                      <Input
                        type="text"
                        placeholder="https://example.com/avatar.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hakkımda (Bio)</label>
                    <textarea
                      placeholder="Kendinizden bahsedin..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full text-sm rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" type="submit" disabled={updateSettingsMutation.isPending}>
                      {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />}
                      Değişiklikleri Kaydet
                    </Button>
                  </div>
                </form>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <form onSubmit={handleUpdatePrivacy} className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/5 bg-muted/10">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold">Profili Herkese Açık Yap</div>
                        <div className="text-[10px] text-muted-foreground">
                          Diğer Sinter üyeleri profilinizi ve durumunuzu arayıp görebilir.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isProfilePublic}
                        onChange={(e) => setIsProfilePublic(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/5 bg-muted/10">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold">Çevrimiçi Durumunu Göster</div>
                        <div className="text-[10px] text-muted-foreground">
                          Aktif olduğunuzda diğer kullanıcılara yeşil nokta gösterilsin.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={showOnlineStatus}
                        onChange={(e) => setShowOnlineStatus(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" type="submit" disabled={updateSettingsMutation.isPending}>
                      {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />}
                      Kaydet
                    </Button>
                  </div>
                </form>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aktif Cihazlar</span>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={handleLogoutAll}
                      disabled={logoutAllMutation.isPending}
                    >
                      Tüm Cihazlardan Çık
                    </Button>
                  </div>

                  {isSessionsLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {sessions?.map((session) => (
                        <div key={session.id} className="p-3 bg-muted/20 border border-border/5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{session.device_name}</span>
                              <span className="text-[9px] text-muted-foreground">
                                Giriş: {new Date(session.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revokeSessionMutation.isPending}
                          >
                            Kapat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
