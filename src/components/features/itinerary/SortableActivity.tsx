import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Activity } from '@/types';
import { GripVertical, Clock, MapPin, Trash2, Edit2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableActivityProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function SortableActivity({ activity, onEdit, onDelete }: SortableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: activity.id,
    data: {
      type: 'Activity',
      activity,
      dayId: activity.dayId, // to handle cross-list or reordering inside same day
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-stretch gap-2 p-3 bg-background border rounded-lg shadow-sm mb-3 transition-colors ${isDragging ? 'border-primary shadow-md' : 'border-border/60 hover:border-border'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center px-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-semibold text-sm truncate">{activity.title}</h5>
          {activity.estimatedCost && (
            <span className="text-xs font-medium text-muted-foreground flex items-center whitespace-nowrap bg-surface-container px-1.5 py-0.5 rounded">
              <IndianRupee className="w-3 h-3 mr-0.5" /> {activity.estimatedCost}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          {activity.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {activity.time}
            </span>
          )}
          {activity.location && (
            <span className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3 h-3" /> {activity.location}
            </span>
          )}
        </div>
        
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(activity)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(activity.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
