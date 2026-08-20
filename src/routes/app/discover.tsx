import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useServers } from '@/hooks/useServers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Compass, Search, Globe, Users, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/app/discover')({
  component: DiscoverPage,
});

function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { useDiscoverServers, useJoinServer } = useServers();
  const { data: servers, isLoading } = useDiscoverServers(searchQuery);
  const joinServerMutation = useJoinServer();

  const handleJoin = async (serverId: string) => {
    try {
      await joinServerMutation.mutateAsync(serverId);
      alert('Sunucuya başarıyla katıldınız!');
    } catch (err) {
      console.error('Failed to join server:', err);
      alert('Sunucuya katılırken hata oluştu.');
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
      {/* Header section with cover design */}
      <div className="relative h-64 bg-primary/10 flex flex-col justify-center px-8 border-b border-border/10 shrink-0 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative max-w-xl space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
            <Compass className="h-5 w-5" />
            Keşfet
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sinter Topluluklarını Bulun</h1>
          <p className="text-sm text-muted-foreground">
            Oyunlardan müziklere, yazılımdan bilim ve teknolojiye kadar aradığınız her türlü topluluk sunucusunu bulun ve katılın.
          </p>

          <div className="relative flex items-center max-w-md mt-4">
            <span className="absolute left-3 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              type="text"
              placeholder="Sunucu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/80 backdrop-blur"
            />
          </div>
        </div>
      </div>

      {/* Servers Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Öne Çıkan Topluluklar
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Sunucular yükleniyor...</p>
          </div>
        ) : servers && servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <Card key={server.id} className="bg-card/40 hover:bg-card/60 transition-all border-border/40 hover:border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold truncate">{server.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10 text-xs">
                    {server.description || 'Bu sunucu için henüz bir açıklama girilmedi.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between mt-2 pt-2 border-t border-border/5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{server.member_count} Üye</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    onClick={() => handleJoin(server.id)}
                    disabled={joinServerMutation.isPending}
                  >
                    Katıl
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-2">
            <Globe className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">Sunucu Bulunamadı</p>
            <p className="text-xs text-muted-foreground">Arama kriterlerinize uyan public sunucu bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
