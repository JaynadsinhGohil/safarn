import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CityStop } from '@/types';
import { GripVertical } from 'lucide-react';

interface SortableCityProps {
  city: CityStop;
  children: React.ReactNode;
}

export function SortableCity({ city, children }: SortableCityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: city.id,
    data: {
      type: 'City',
      city,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
      {/* A handle area specifically for dragging the city */}
      <div className="absolute -left-10 top-2 p-2 hidden lg:flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
        <div {...attributes} {...listeners}>
          <GripVertical className="w-6 h-6" />
        </div>
      </div>
      {/* Mobile Handle (optional, inside header) */}
      <div className="lg:hidden absolute left-0 top-4 opacity-50">
         <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5" />
         </div>
      </div>
      
      {children}
    </div>
  );
}
