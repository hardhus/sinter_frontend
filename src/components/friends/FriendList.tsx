import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { MessageSquare, Ban, UserCheck, Clock, Loader2 } from 'lucide-react';

export function FriendList() {
  const { useMyFriends, useBlockUser, useOpenDm, useAddFriend } = useFriends();
  const { data: friends, isLoading } = useMyFriends();
  const blockMutation = useBlockUser();
  const openDmMutation = useOpenDm();
  const acceptMutation = useAddFriend(); // POST /chat/friends acts as accept as well

  const handleStartDm = async (friendUserId: string) => {
    try {
      const dmChannel = await openDmMutation.mutateAsync({
        target_user_id: friendUserId,
      });
      // Navigate to the DM channel
      // In Sinter, DM channels are just rooms. Since the spec has DM channels and servers separate,
      // let's check how we display them.
      // DmChannelResponse has `channel_id`.
      // We can route to `/app/me` and show the selected DM channel, or open it in a chat room.
      // In our route structure, `/app/me` has a DM channels list. If we have a DM channel id,
      // we can pass it as a query param or state, or we can use the channelId route!
      // Wait, `/app/servers/:serverId/channels/:channelId` is for servers.
      // Do DMs share the `/messages` history endpoint?
      // Yes! `/messages` takes `channel_id` (which can be a server channel_id or a DM channel_id!).
      // But how is the DM UI laid out?
      // If we go to `/app/me`, we can select a DM channel.
      // For simplicity, we can load the chat window directly inside `/app/me` if a DM channel is active!
      // Let's implement active DM chat inside `/app/me` or route to a `/app/channels/$channelId` if we want.
      // Since `/app/me` is our home page, we can store `activeDmChannelId` in a query param or local state.
      // Let's see: if we save the active DM channel ID in `/app/me` state, we can render the message panel
      // for that DM channel right in the friends content area! This is extremely cool and matches Discord.
      const channelId = (dmChannel as any)?.channel_id || dmChannel;
      alert(`DM Kanalı Açıldı: ${channelId}`);
    } catch (err) {
      console.error('Failed to open DM:', err);
    }
  };

  const handleAccept = async (usernameOrEmail: string) => {
    try {
      await acceptMutation.mutateAsync({
        target_username_or_email: usernameOrEmail,
      });
      alert('Arkadaşlık isteği kabul edildi!');
    } catch (err) {
      console.error('Failed to accept friend:', err);
    }
  };

  const handleBlock = async (usernameOrEmail: string) => {
    if (!confirm(`${usernameOrEmail} isimli kullanıcıyı engellemek istediğinizden emin misiniz?`)) return;
    try {
      await blockMutation.mutateAsync({
        target_username_or_email: usernameOrEmail,
      });
      alert('Kullanıcı engellendi.');
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground select-none">
        Henüz hiç arkadaşınız yok. "Arkadaş Ekle" sekmesinden yeni arkadaşlar edinebilirsiniz!
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 select-none">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
        Tüm Arkadaşlar ({friends.length})
      </div>

      <div className="space-y-1">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-2.5 rounded-lg hover:bg-muted/15 transition-all flex items-center justify-between border border-transparent hover:border-border/5"
          >
            {/* Friend profile details */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
                {friend.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">{friend.username}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {friend.status === 'ACCEPTED' ? (
                    <>
                      <UserCheck className="h-3 w-3 text-green-500" />
                      Arkadaş
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                      Bekliyor ({friend.status})
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Friend Actions */}
            <div className="flex items-center gap-1.5">
              {friend.status === 'PENDING' && (
                <Button
                  size="xs"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  onClick={() => handleAccept(friend.username)}
                >
                  Kabul Et
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleStartDm(friend.friend_id)}
                title="Sohbet Başlat"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/15"
                onClick={() => handleBlock(friend.username)}
                title="Engelle"
                disabled={blockMutation.isPending}
              >
                <Ban className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
