import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/context/TripContext';

export function ItineraryLayout() {
  const [panelOpen, setPanelOpen] = useState(true);

  const { activeTrip } = useTrip();

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
      <TopNavbar />
      
      <div className="flex flex-1 pt-20 overflow-hidden relative">
        {/* Contextual Left Panel (Desktop only) */}
        <aside 
          className={cn(
            "hidden md:flex flex-col bg-surface-container-low border-r border-border/40 transition-all duration-300 relative z-10",
            panelOpen ? "w-80" : "w-16"
          )}
        >
          <div className="p-4 flex items-center justify-between border-b border-border/40 h-16">
            {panelOpen && <h2 className="font-heading font-semibold text-lg text-primary truncate">Trip Stops</h2>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPanelOpen(!panelOpen)}
              className={cn("shrink-0", !panelOpen && "mx-auto")}
            >
              {panelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {panelOpen ? (
              <div className="space-y-3">
                {activeTrip?.cities.map((city) => (
                  <div key={city.id} className="p-3 rounded-lg bg-surface border border-border/50 shadow-sm flex items-start gap-3 hover:border-primary/50 transition-colors cursor-pointer">
                    <MapPin className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{city.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, activeTrip.days.filter(d => d.cityId === city.id).length - 1)} Nights
                      </p>
                    </div>
                  </div>
                ))}
                {(!activeTrip?.cities || activeTrip.cities.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No stops added yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {activeTrip?.cities.map((city, idx) => (
                  <div key={city.id} className="w-8 h-8 rounded-full bg-surface border border-border/50 flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                    <span className="text-xs font-medium">{idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Builder Workspace */}
        <main className="flex-1 h-full overflow-y-auto bg-background relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
