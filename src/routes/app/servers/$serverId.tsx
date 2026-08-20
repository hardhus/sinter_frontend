import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useChannels } from '@/hooks/useChannels';
import { Loader2, AlertCircle } from 'lucide-react';
import { UserPanel } from '@/components/layout/UserPanel';

export const Route = createFileRoute('/app/servers/$serverId')({
  component: ServerIndexPage,
});

function ServerIndexPage() {
  const { serverId } = Route.useParams();
  const navigate = useNavigate();
  const { useServerChannels } = useChannels(serverId);
  const { data: channels, isLoading } = useServerChannels();

  useEffect(() => {
    if (channels && channels.length > 0) {
      // Find first TEXT channel
      const textChannel = channels.find((c) => c.channel_type === 'TEXT');
      const targetChannel = textChannel || channels[0];
      navigate({
        to: `/app/servers/${serverId}/channels/${targetChannel.id}`,
      });
    }
  }, [channels, serverId, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Sunucu kanalları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Sidebar fallback for server with no channels */}
      <div className="w-[240px] bg-card/60 border-r border-border/10 flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-border/10 font-bold text-xs truncate">
          Sunucu Odaları
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          <p className="text-xs text-muted-foreground">Kanal bulunamadı.</p>
        </div>
        <UserPanel />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3 bg-background">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Bu sunucuda hiç kanal yok</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Yöneticiden yeni bir metin kanalı oluşturmasını isteyin veya server ayarlarına göz atın.
        </p>
      </div>
    </div>
  );
}
