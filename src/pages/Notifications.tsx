import { useSettings } from '@/context/SettingsContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { NotificationItem } from '@/components/features/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';

export function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification } = useSettings();

  return (
    <PageContainer maxWidth="narrow" className="py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Bell className="w-4 h-4" />
            <span>Activity</span>
          </div>
          <h1 className="font-heading text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No notifications yet. We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unread */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">New</p>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).map(n => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={markNotificationRead} onDelete={deleteNotification} />
                ))}
              </div>
            </div>
          )}
          {/* Read */}
          {notifications.filter(n => n.read).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 mt-6 uppercase tracking-wide">Earlier</p>
              <div className="space-y-2">
                {notifications.filter(n => n.read).map(n => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={markNotificationRead} onDelete={deleteNotification} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
