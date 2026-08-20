import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MessageResponse } from '@/api/generated';

interface MessageItemProps {
  message: MessageResponse;
  compact?: boolean;
}

export function MessageItem({ message, compact = false }: MessageItemProps) {
  const { user } = useAuth();
  const { useEditMessage, useDeleteMessage } = useMessages(message.channel_id);
  const editMutation = useEditMessage();
  const deleteMutation = useDeleteMessage();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [error, setError] = useState('');

  const isMyMessage = message.user_id === user?.id;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setError('');

    try {
      await editMutation.mutateAsync({
        messageId: message.id,
        body: { content: editContent },
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Mesaj güncellenemedi.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteMutation.mutateAsync(message.id);
    } catch (err) {
      console.error('Delete message error:', err);
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

  const timeString = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

  if (compact) {
    return (
      <div className="group relative flex items-center pl-[56px] pr-8 py-0.5 hover:bg-muted/15 transition-colors select-text min-h-[24px]">
        {/* Timestamp on hover */}
        <span className="absolute left-3 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 select-none">
          {timeString}
        </span>

        {/* Content Area */}
        <div className="flex-1 text-sm text-foreground/90 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-1 w-full max-w-md">
              <form onSubmit={handleEdit} className="flex gap-2 items-center py-1">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-8 text-sm"
                  disabled={editMutation.isPending}
                />
                <Button size="xs" type="submit" disabled={editMutation.isPending}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="xs" variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </form>
              {error && <span className="text-[10px] text-destructive">{error}</span>}
            </div>
          ) : (
            <p className="break-all whitespace-pre-wrap leading-relaxed">
              {message.content}
              {message.is_edited && (
                <span className="text-[9px] text-muted-foreground ml-1.5 select-none">(düzenlendi)</span>
              )}
            </p>
          )}
        </div>

        {/* Action Menu (Float on hover) */}
        {isMyMessage && !isEditing && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center border border-border/25 rounded-md bg-neutral-900 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity select-none overflow-hidden h-7 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 hover:bg-neutral-800 text-muted-foreground hover:text-foreground h-full"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="px-2 hover:bg-neutral-800 text-muted-foreground hover:text-destructive h-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative flex items-start gap-3 px-4 py-2 hover:bg-muted/15 transition-colors select-text mt-2">
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white relative shrink-0 ${getUserColorClass(message.username)} select-none`}>
        {message.username[0].toUpperCase()}
      </div>

      {/* Message Frame */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 select-none">
          <span className="text-sm font-bold text-foreground hover:underline cursor-pointer">{message.username}</span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {dateString} {timeString}
          </span>
        </div>

        {/* Content Area */}
        <div className="text-sm text-foreground/90 mt-0.5 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-1 w-full max-w-md">
              <form onSubmit={handleEdit} className="flex gap-2 items-center py-1 mt-1">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-8 text-sm"
                  disabled={editMutation.isPending}
                />
                <Button size="xs" type="submit" disabled={editMutation.isPending}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="xs" variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </form>
              {error && <span className="text-[10px] text-destructive">{error}</span>}
            </div>
          ) : (
            <p className="break-all whitespace-pre-wrap leading-relaxed">
              {message.content}
              {message.is_edited && (
                <span className="text-[9px] text-muted-foreground ml-1.5 select-none">(düzenlendi)</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Action Menu (Float on hover) */}
      {isMyMessage && !isEditing && (
        <div className="absolute right-4 top-2 flex items-center border border-border/25 rounded-md bg-neutral-900 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity select-none overflow-hidden h-7 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 hover:bg-neutral-800 text-muted-foreground hover:text-foreground h-full"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="px-2 hover:bg-neutral-800 text-muted-foreground hover:text-destructive h-full"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
