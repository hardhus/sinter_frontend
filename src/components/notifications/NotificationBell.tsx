import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Loader2, MessageSquare, UserPlus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { useUnreadNotifications, useMarkAsRead } = useNotifications();
  const { data: notifications, isLoading } = useUnreadNotifications();
  const markReadMutation = useMarkAsRead();

  const handleMarkAllRead = async () => {
    if (!notifications || notifications.length === 0) return;
    const ids = notifications.map((n) => n.id);
    try {
      await markReadMutation.mutateAsync({ notification_ids: ids });
      setIsOpen(false);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync({ notification_ids: [id] });
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <UserPlus className="h-4 w-4 text-blue-400" />;
      case 'CHAT_MENTION':
        return <MessageSquare className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="relative select-none">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full border-2 border-neutral-900 animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-neutral-950/95 backdrop-blur border border-border/20 rounded-lg p-2 shadow-2xl z-40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-96">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 px-1">
              <span className="text-xs font-bold">Bildirimler ({unreadCount})</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1 focus:outline-none"
                >
                  <Check className="h-3 w-3" />
                  Okundu Yap
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 bg-muted/10 border border-border/5 rounded flex items-start gap-2.5 hover:bg-muted/20 transition-all group"
                  >
                    <div className="p-1 rounded bg-neutral-900 border border-border/10 mt-0.5 shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground leading-normal font-medium break-words">
                        {n.payload || 'Yeni bir bildiriminiz var.'}
                      </p>
                      <span className="text-[8px] text-muted-foreground block mt-0.5">
                        {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkOneRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-foreground text-muted-foreground p-0.5 focus:outline-none transition-all mt-0.5 shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-[10px] text-muted-foreground">
                Okunmamış bildirim bulunmuyor.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
