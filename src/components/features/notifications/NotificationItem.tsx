import { Check, Trash2, ExternalLink } from 'lucide-react';
import type { Notification } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TYPE_ICONS: Record<string, string> = {
  trip_reminder: '🗓️', budget_alert: '💰', itinerary_update: '📝', recommendation: '✨', share_activity: '🔗',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  return (
    <div className={cn('flex items-start gap-4 p-4 rounded-2xl border transition-all group', notification.read ? 'bg-surface border-border/30' : 'bg-primary/5 border-primary/20')}>
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-xl shrink-0 mt-0.5">
        {TYPE_ICONS[notification.type] ?? '🔔'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold leading-snug', !notification.read && 'text-foreground')}>{notification.title}</p>
          {!notification.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notification.message}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}</span>
          {notification.link && (
            <Link to={notification.link} className="text-xs text-primary hover:underline flex items-center gap-1">
              View <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.read && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMarkRead(notification.id)} title="Mark as read">
            <Check className="w-3 h-3" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(notification.id)} title="Delete">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
