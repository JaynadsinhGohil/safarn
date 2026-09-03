import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencyToggle } from '@/components/features/budget/CurrencyToggle';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function TopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount, profile } = useSettings();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/dashboard' },
    { name: 'My Trips', path: '/trips' },
    { name: 'Explore', path: '/explore' },
    { name: 'Budget', path: '/budget' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 print:hidden border-b border-transparent',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-sm border-border/40'
          : 'bg-transparent'
      )}
    >
      <div className={cn(
        'max-w-7xl mx-auto px-4 md:px-8 flex items-center transition-all duration-300',
        scrolled ? 'h-16' : 'h-20'
      )}>
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading text-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-heading text-xl font-bold text-primary">
              Safarn
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex flex-shrink-0 items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'font-sans text-sm font-medium transition-colors relative py-1',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <ThemeToggle />
          <CurrencyToggle className="hidden md:block" />

          {/* Notification bell with live badge */}
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="hidden md:flex p-2 text-muted-foreground hover:text-foreground hover:bg-surface-container rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background" />
            )}
          </Link>

          <Button variant="default" className="hidden lg:flex" asChild>
            <Link to="/trips/new">Plan New Trip</Link>
          </Button>

          {/* Avatar menu → Settings, Wishlist, Logout */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden md:flex ml-2 rounded-full border-2 border-transparent hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="User menu"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 mt-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" /> Settings & Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hidden md:block ml-2">
              <Avatar className="w-9 h-9 border-2 border-transparent hover:border-primary cursor-pointer transition-colors">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
