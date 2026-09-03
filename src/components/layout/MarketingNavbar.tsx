import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MarketingNavbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading text-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              Safarn
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#featured-itineraries" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Destinations</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
