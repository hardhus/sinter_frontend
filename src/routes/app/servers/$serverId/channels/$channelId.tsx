import { createFileRoute } from '@tanstack/react-router';
import { useChannels } from '@/hooks/useChannels';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ChannelSidebar } from '@/components/layout/ChannelSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Hash } from 'lucide-react';

export const Route = createFileRoute('/app/servers/$serverId/channels/$channelId')({
  component: ChannelPage,
});

function ChannelPage() {
  const { serverId, channelId } = Route.useParams();
  const { useServerChannels } = useChannels(serverId);
  const { data: channels } = useServerChannels();
  
  const { sendMessage, sendTyping, typingUsers } = useWebSocket(channelId);

  const activeChannel = channels?.find((c) => c.id === channelId);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Channel list sidebar */}
      <ChannelSidebar serverId={serverId} activeChannelId={channelId} />

      {/* Right panel: Main Chat pane */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <div className="h-[48px] border-b border-border/10 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            {activeChannel?.name || 'kanal'}
          </div>
          <NotificationBell />
        </div>

        {/* Messages view */}
        <MessageList channelId={channelId} />

        {/* Typing and message inputs */}
        <TypingIndicator users={typingUsers} />
        <MessageInput
          channelName={activeChannel?.name || 'kanal'}
          onSend={sendMessage}
          onTyping={sendTyping}
        />
      </div>
    </div>
  );
}
