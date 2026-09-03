import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNavbar />
      
      {/* Main content area */}
      <main className="flex-1 w-full pt-20 pb-20 md:pb-0">
        <Outlet />
      </main>
      
      <BottomNav />
    </div>
  );
}
