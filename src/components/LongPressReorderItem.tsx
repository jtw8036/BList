import React, { useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical } from 'lucide-react';

interface LongPressReorderItemProps<T extends { id: string }> {
  key?: React.Key;
  item: T;
  children: (isDragging: boolean, dragControls: any) => React.ReactNode;
  className?: string;
  activeRingColor?: string;
  onItemClick?: () => void;
}

export function LongPressReorderItem<T extends { id: string }>({
  item,
  children,
  className = '',
  activeRingColor = 'ring-[#FF2E93]',
  onItemClick,
}: LongPressReorderItemProps<T>) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={`relative transition-all duration-150 rounded-2xl ${className} ${
        isDragging
          ? `z-40 scale-[1.02] shadow-2xl ring-2 ${activeRingColor} opacity-95`
          : ''
      }`}
    >
      <div
        onClick={onItemClick}
        className="w-full h-full select-none"
      >
        {isDragging && (
          <div className="absolute -top-3 right-4 z-50 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
            <GripVertical className="w-3 h-3 text-pink-400" />
            <span>순서 이동 중...</span>
          </div>
        )}
        {children(isDragging, dragControls)}
      </div>
    </Reorder.Item>
  );
}
