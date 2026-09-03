import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, Compass, User } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useSettings();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'My Trips', path: '/trips', icon: Map },
    { name: 'Plan', path: '/trips/new', icon: PlusCircle, isPrimary: true },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/settings', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 pb-safe print:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          if (item.isPrimary) {
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-foreground">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
                {/* Notification badge on Home */}
                {item.path === '/dashboard' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
