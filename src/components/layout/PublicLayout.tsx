import { Outlet } from 'react-router-dom';
import { MarketingNavbar } from './MarketingNavbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MarketingNavbar />
      
      {/* Main content area */}
      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>
    </div>
  );
}
