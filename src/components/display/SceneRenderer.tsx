'use client';

import React from 'react';
import { Scene, AuthoritativeTimerState } from '@/types/smartscreen';
import { ElementRenderer } from './ElementRenderer';

interface SceneRendererProps {
  scene: Scene;
  timerState: AuthoritativeTimerState;
  aspectRatio?: '16:9' | '4:3' | 'fullscreen';
  isEditing?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  className?: string;
}

export function SceneRenderer({
  scene,
  timerState,
  aspectRatio = 'fullscreen',
  isEditing = false,
  selectedElementId = null,
  onSelectElement,
  className = '',
}: SceneRendererProps) {
  const { background, elements = [] } = scene;

  // Background style computation
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: '#000000' };

    switch (background.type) {
      case 'gradient':
        return { background: background.value, backgroundColor: '#000000' };
      case 'color':
        return { backgroundColor: background.value };
      case 'image':
        return {
          backgroundColor: '#000000',
          backgroundImage: `url(${background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      default:
        return { backgroundColor: '#000000' };
    }
  };

  // Determine container aspect ratio class
  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video w-full max-h-full'
      : aspectRatio === '4:3'
      ? 'aspect-[4/3] w-full max-h-full'
      : 'w-full h-full';

  return (
    <div
      className={`relative overflow-hidden select-none transition-all duration-500 ${aspectClass} ${className}`}
      style={{
        ...getBackgroundStyle(),
        containerType: 'inline-size',
      }}
      onClick={(e) => {
        if (isEditing && onSelectElement && e.target === e.currentTarget) {
          onSelectElement(null);
        }
      }}
    >
      {/* Video Background if applicable */}
      {background?.type === 'video' && (
        <video
          src={background.value}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Background Overlay if specified */}
      {background?.overlayColor && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: background.overlayColor,
            opacity: background.overlayOpacity ?? 0.5,
          }}
        />
      )}

      {/* Scene Elements */}
      {elements
        .filter((el) => el.visible !== false)
        .sort((a, b) => (a.style.zIndex || 1) - (b.style.zIndex || 1))
        .map((element) => {
          const isSelected = isEditing && selectedElementId === element.id;

          return (
            <div
              key={element.id}
              onClick={(e) => {
                if (isEditing && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement(element.id);
                }
              }}
              className={`absolute transition-shadow ${
                isSelected
                  ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 cursor-move'
                  : isEditing
                  ? 'hover:ring-1 hover:ring-sky-400/50 cursor-pointer'
                  : ''
              }`}
              style={{
                left: `${element.style.left}%`,
                top: `${element.style.top}%`,
                width: `${element.style.width}%`,
                height: `${element.style.height}%`,
                zIndex: element.style.zIndex || 1,
              }}
            >
              <ElementRenderer
                element={element}
                timerState={timerState}
                isEditing={isEditing}
              />
            </div>
          );
        })}
    </div>
  );
}
