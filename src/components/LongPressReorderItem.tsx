import React, { useState, useRef } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical } from 'lucide-react';

interface LongPressReorderItemProps<T extends { id: string }> {
  key?: React.Key;
  item: T;
  children: (isDragging: boolean) => React.ReactNode;
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
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasTriggeredDragRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!target) return false;
    const el = target as HTMLElement;
    return !!el.closest('button, input, textarea, select, a, [data-prevent-item-click]');
  };

  const startLongPress = (e: React.PointerEvent) => {
    // Only handle primary click/touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (isInteractiveTarget(e.target)) {
      startPosRef.current = null;
      return;
    }

    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasTriggeredDragRef.current = false;
    setIsPressing(true);

    clearTimer();
    timerRef.current = setTimeout(() => {
      hasTriggeredDragRef.current = true;
      setIsDragging(true);
      setIsPressing(false);

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(30);
        } catch {
          // Ignore if vibration fails
        }
      }

      dragControls.start(e);
    }, 280); // 280ms threshold for snappy long press
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPosRef.current && !hasTriggeredDragRef.current) {
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      // Cancel long press if user moves pointer > 8px before timer fires (enables scrolling)
      if (dx > 8 || dy > 8) {
        clearTimer();
        setIsPressing(false);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    clearTimer();
    setIsPressing(false);
    // Quick tap -> invoke click action if not an interactive child button
    if (startPosRef.current && !hasTriggeredDragRef.current && onItemClick) {
      if (!isInteractiveTarget(e.target)) {
        onItemClick();
      }
    }
    startPosRef.current = null;
  };

  const handlePointerCancel = () => {
    clearTimer();
    setIsPressing(false);
    setIsDragging(false);
    startPosRef.current = null;
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        setIsPressing(false);
      }}
      className={`relative touch-action-pan-y transition-all duration-150 rounded-2xl ${className} ${
        isDragging
          ? `z-40 scale-[1.02] shadow-2xl ring-2 ${activeRingColor} opacity-95`
          : isPressing
          ? 'scale-[0.99] opacity-90'
          : ''
      }`}
    >
      <div
        onPointerDown={startLongPress}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="w-full h-full select-none"
      >
        {/* Floating Indicator Badge when Dragging */}
        {isDragging && (
          <div className="absolute -top-3 right-4 z-50 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
            <GripVertical className="w-3 h-3 text-pink-400" />
            <span>순서 이동 중...</span>
          </div>
        )}

        {children(isDragging)}
      </div>
    </Reorder.Item>
  );
}
