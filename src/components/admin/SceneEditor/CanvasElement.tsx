'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SceneElement, AuthoritativeTimerState } from '@/types/smartscreen';
import { ElementRenderer } from '@/components/display/ElementRenderer';

interface CanvasElementProps {
  element: SceneElement;
  isSelected: boolean;
  timerState: AuthoritativeTimerState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onUpdatePosition: (id: string, left: number, top: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
}

export function CanvasElement({
  element,
  isSelected,
  timerState,
  canvasRef,
  onSelect,
  onUpdatePosition,
  onUpdateSize,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; left: number; top: number }>({
    mouseX: 0,
    mouseY: 0,
    left: element.style.left,
    top: element.style.top,
  });

  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; width: number; height: number }>({
    mouseX: 0,
    mouseY: 0,
    width: element.style.width,
    height: element.style.height,
  });

  // Dragging handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();

    if (!canvasRef.current) return;
    setIsDragging(true);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      left: element.style.left,
      top: element.style.top,
    };
  };

  // Resizing handle handler
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    setIsResizing(true);

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: element.style.width,
      height: element.style.height,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (isDragging) {
        const deltaX = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

        const newLeft = Math.max(0, Math.min(100 - element.style.width, dragStartRef.current.left + deltaX));
        const newTop = Math.max(0, Math.min(100 - element.style.height, dragStartRef.current.top + deltaY));

        onUpdatePosition(element.id, Math.round(newLeft * 10) / 10, Math.round(newTop * 10) / 10);
      } else if (isResizing) {
        const deltaW = ((e.clientX - resizeStartRef.current.mouseX) / rect.width) * 100;
        const deltaH = ((e.clientY - resizeStartRef.current.mouseY) / rect.height) * 100;

        const newW = Math.max(4, Math.min(100 - element.style.left, resizeStartRef.current.width + deltaW));
        const newH = Math.max(3, Math.min(100 - element.style.top, resizeStartRef.current.height + deltaH));

        onUpdateSize(element.id, Math.round(newW * 10) / 10, Math.round(newH * 10) / 10);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, canvasRef, element, onUpdatePosition, onUpdateSize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${element.style.left}%`,
        top: `${element.style.top}%`,
        width: `${element.style.width}%`,
        height: `${element.style.height}%`,
        zIndex: element.style.zIndex || 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={`group select-none ${
        isSelected
          ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 shadow-2xl'
          : 'hover:ring-1 hover:ring-sky-400/60'
      }`}
    >
      <ElementRenderer element={element} timerState={timerState} isEditing={true} />

      {/* Resize Handle at Bottom-Right */}
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-sky-400 border-2 border-slate-950 rounded-sm cursor-nwse-resize shadow-md z-30"
          title="Drag to resize element"
        />
      )}
    </div>
  );
}
