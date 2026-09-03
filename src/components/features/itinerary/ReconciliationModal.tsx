import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import type { Trip } from '@/types';
import type { OrphanedActivity } from '@/lib/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReconciliationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orphanedActivities: OrphanedActivity[];
  proposedTrip: Trip;
  onConfirm: (resolutions: Record<string, { action: 'move' | 'delete', targetDayId?: string }>) => void;
}

export function ReconciliationModal({ open, onOpenChange, orphanedActivities, proposedTrip, onConfirm }: ReconciliationModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, { action: 'move' | 'delete', targetDayId?: string }>>({});

  // Initialize resolutions to 'delete' by default to force explicit moves
  useEffect(() => {
    if (open && orphanedActivities.length > 0) {
      const initial: Record<string, { action: 'move' | 'delete', targetDayId?: string }> = {};
      orphanedActivities.forEach(oa => {
        initial[oa.activity.id] = { action: 'delete' };
      });
      setResolutions(initial);
    }
  }, [open, orphanedActivities]);

  const handleActionChange = (activityId: string, action: 'move' | 'delete') => {
    setResolutions(prev => ({
      ...prev,
      [activityId]: { action, targetDayId: action === 'move' ? proposedTrip.days[0]?.id : undefined }
    }));
  };

  const handleTargetDayChange = (activityId: string, dayId: string) => {
    setResolutions(prev => ({
      ...prev,
      [activityId]: { action: 'move', targetDayId: dayId }
    }));
  };

  const handleConfirm = () => {
    onConfirm(resolutions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-surface/50 shrink-0">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="w-5 h-5" />
            <DialogTitle>Action Required</DialogTitle>
          </div>
          <DialogDescription className="text-base text-foreground/90">
            Shortening this trip will result in losing the following activities. Please decide what to do with them.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-background">
          {orphanedActivities.map((oa) => {
            const res = resolutions[oa.activity.id] || { action: 'delete' };
            const isMove = res.action === 'move';

            return (
              <div key={oa.activity.id} className="p-4 border border-border/50 rounded-xl bg-surface-container-low shadow-sm">
                <div className="font-semibold text-sm mb-1">{oa.activity.title}</div>
                <div className="text-xs text-muted-foreground mb-4">
                  Originally scheduled on a day that is being removed.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex bg-background border border-border/60 rounded-lg overflow-hidden shrink-0 w-full sm:w-auto">
                    <button
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${!isMove ? 'bg-destructive/10 text-destructive' : 'hover:bg-surface-container'}`}
                      onClick={() => handleActionChange(oa.activity.id, 'delete')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </div>
                    </button>
                    <div className="w-px bg-border/60" />
                    <button
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${isMove ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container'}`}
                      onClick={() => handleActionChange(oa.activity.id, 'move')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Move To
                      </div>
                    </button>
                  </div>

                  {isMove && (
                    <div className="flex-1 w-full">
                      <Select value={res.targetDayId} onValueChange={(val) => handleTargetDayChange(oa.activity.id, val)}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                        <SelectContent>
                          {proposedTrip.days.filter(d => d.cityId).map(day => {
                            const city = proposedTrip.cities.find(c => c.id === day.cityId);
                            return (
                              <SelectItem key={day.id} value={day.id}>
                                Day {day.dayNumber} - {city?.name || 'Transit'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-surface/50 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel Edit</Button>
          <Button onClick={handleConfirm}>Confirm & Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
