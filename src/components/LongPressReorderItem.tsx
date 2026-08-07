import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. & 2. & 3. Long Press Logic with passive: false and tolerance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timer: number;
    let startX = 0;
    let startY = 0;
    let isPressing = false;
    let dragStarted = false;

    const startPress = (e: TouchEvent | PointerEvent | MouseEvent) => {
      isPressing = true;
      dragStarted = false;
      
      let clientX = 0;
      let clientY = 0;
      
      if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX;
        clientY = (e as TouchEvent).touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      
      startX = clientX;
      startY = clientY;

      timer = window.setTimeout(() => {
        if (isPressing && !dragStarted) {
          dragStarted = true;
          // Trigger Framer Motion Drag
          dragControls.start(e as any);
        }
      }, 250); // 250ms delay
    };

    const cancelPress = () => {
      isPressing = false;
      clearTimeout(timer);
    };

    const onTouchStart = (e: TouchEvent) => {
      startPress(e);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPressing) return;
      
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      
      const dx = Math.abs(clientX - startX);
      const dy = Math.abs(clientY - startY);

      if (dragStarted) {
        // Prevent default scroll ONLY AFTER drag started
        if (e.cancelable) {
          e.preventDefault();
        }
      } else {
        // Cancel if moved beyond 8px tolerance before delay
        if (dx > 8 || dy > 8) {
          cancelPress();
        }
      }
    };

    const onTouchEnd = () => {
      cancelPress();
      dragStarted = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('contextmenu', (e) => {
      if (dragStarted) e.preventDefault();
    });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [dragControls]);

  // 4. & 5. Auto Scroll Loop during drag
  useEffect(() => {
    if (!isDragging) return;

    let rafId: number;
    let currentY = 0;

    const onMove = (e: TouchEvent | MouseEvent) => {
      if ('touches' in e) {
        currentY = e.touches[0].clientY;
      } else {
        currentY = e.clientY;
      }
    };

    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });

    const scrollLoop = () => {
      if (currentY > 0) {
        // Use window.visualViewport if available for true PWA height
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const edgeSize = 100; // 100px from top/bottom
        const maxSpeed = 15;

        let scrollY = 0;
        if (currentY < edgeSize) {
          // Near top
          const intensity = Math.max(0, edgeSize - currentY) / edgeSize;
          scrollY = -maxSpeed * intensity;
        } else if (currentY > viewportHeight - edgeSize) {
          // Near bottom
          const intensity = Math.max(0, currentY - (viewportHeight - edgeSize)) / edgeSize;
          scrollY = maxSpeed * intensity;
        }

        if (scrollY !== 0) {
          window.scrollBy(0, scrollY);
        }
      }
      rafId = requestAnimationFrame(scrollLoop);
    };

    rafId = requestAnimationFrame(scrollLoop);

    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [isDragging]);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      // 6. translate3d is handled by Reorder.Item automatically, but we ensure it overrides safely
      className={`relative transition-all duration-150 rounded-2xl ${className} ${
        isDragging
          ? `z-40 scale-[1.02] shadow-2xl ring-2 ${activeRingColor} opacity-95`
          : ''
      }`}
      style={{
        // 1. Required CSS for iOS PWA Dragging
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        // touchAction: 'none' breaks vertical scrolling on iOS if applied globally, 
        // so we use touchmove e.preventDefault() instead when drag starts.
        // Fix z-index stacking context for dragging item
        position: isDragging ? 'relative' : undefined,
      }}
    >
      <div
        ref={containerRef}
        onClick={onItemClick}
        className="w-full h-full"
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
