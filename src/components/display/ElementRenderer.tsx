'use client';

import React from 'react';
import { SceneElement, AuthoritativeTimerState } from '@/types/smartscreen';
import { DisplayTimer } from './DisplayTimer';
import { QRCodeSVG } from 'qrcode.react';

interface ElementRendererProps {
  element: SceneElement;
  timerState: AuthoritativeTimerState;
  isEditing?: boolean;
}

export function ElementRenderer({
  element,
  timerState,
  isEditing = false,
}: ElementRendererProps) {
  const { style, content, type } = element;

  // Container style fills the parent positioned frame without double offsets
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: style.opacity ?? 1,
    backgroundColor: style.backgroundColor || 'transparent',
    borderColor: style.borderColor || 'transparent',
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    boxShadow: style.boxShadow || undefined,
    backdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
    WebkitBackdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
    padding: style.padding ? `${style.padding}px` : undefined,
    transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
    pointerEvents: isEditing ? 'none' : 'auto',
  };

  switch (type) {
    case 'text':
      return (
        <div
          style={{
            ...containerStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              style.textAlign === 'center'
                ? 'center'
                : style.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
            color: style.color || '#ffffff',
            fontSize: style.fontSize ? `${style.fontSize}cqw` : '1.8cqw',
            fontWeight: style.fontWeight || 'normal',
            textAlign: style.textAlign || 'left',
            fontFamily: style.fontFamily,
            letterSpacing: style.letterSpacing,
            lineHeight: style.lineHeight || 1.15,
            textTransform: style.textTransform || 'none',
            textShadow: style.textShadow,
          }}
          className="select-none leading-snug whitespace-pre-line"
        >
          {content.text || ''}
        </div>
      );

    case 'image':
      return (
        <div style={containerStyle} className="flex items-center justify-center overflow-hidden">
          {content.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={content.url}
              alt={content.alt || 'Display element'}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 text-xs">
              Image placeholder
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div style={containerStyle} className="flex items-center justify-center overflow-hidden">
          {content.url ? (
            <video
              src={content.url}
              autoPlay={content.videoAutoplay ?? true}
              loop={content.videoLoop ?? true}
              muted={content.videoMuted ?? true}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
              Video element
            </div>
          )}
        </div>
      );

    case 'timer':
      return (
        <div style={containerStyle} className="flex items-center justify-center">
          <DisplayTimer
            timer={timerState}
            fontSize={`${style.fontSize ? style.fontSize * 1.1 : 6}cqw`}
            color={style.color || '#ffffff'}
            showLabel={Boolean(content.timerLabel)}
          />
        </div>
      );

    case 'qrcode':
      return (
        <div
          style={containerStyle}
          className="flex flex-col items-center justify-center p-2 text-center"
        >
          <div className="p-2 bg-white rounded-xl shadow-xl flex items-center justify-center aspect-square max-h-[82%] max-w-[82%]">
            <QRCodeSVG
              value={content.qrUrl || 'https://smartscreen.live'}
              size={240}
              level="H"
              includeMargin={false}
              className="w-full h-full"
            />
          </div>
          {content.qrLabel && (
            <span className="mt-1 text-[1.0cqw] font-semibold text-slate-200 tracking-wide line-clamp-2">
              {content.qrLabel}
            </span>
          )}
        </div>
      );

    case 'logo':
      return (
        <div style={containerStyle} className="flex items-center justify-center p-2">
          {content.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={content.url}
              alt="Logo"
              className="max-w-full max-h-full object-contain filter drop-shadow-md"
            />
          ) : (
            <div className="w-full h-full border border-dashed border-slate-700 rounded flex items-center justify-center text-xs text-slate-500">
              Logo
            </div>
          )}
        </div>
      );

    case 'shape':
      return <div style={containerStyle} />;

    case 'divider':
      return (
        <div style={containerStyle} className="flex items-center">
          <div
            className="w-full h-full"
            style={{ backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 0.2)' }}
          />
        </div>
      );

    case 'leaderboard': {
      const items = content.leaderboardData || [];
      return (
        <div
          style={containerStyle}
          className="flex flex-col gap-2 p-3 justify-center"
        >
          <div className="grid grid-cols-12 gap-2 text-[0.9cqw] font-bold text-slate-400 uppercase tracking-wider px-4 py-1">
            <span className="col-span-1 text-center">Rank</span>
            <span className="col-span-7">Team / Participant</span>
            <span className="col-span-2 text-right">Points</span>
            <span className="col-span-2 text-center">Status</span>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-xl border transition-all ${
                  row.rank === 1
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-950/20'
                    : row.rank === 2
                    ? 'bg-slate-300/10 border-slate-300/30 text-slate-200'
                    : row.rank === 3
                    ? 'bg-amber-700/15 border-amber-700/30 text-amber-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300'
                }`}
              >
                <div className="col-span-1 text-center font-black text-[1.2cqw]">
                  {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : (
                    <span className="text-white font-mono font-bold">#{row.rank}</span>
                  )}
                </div>
                <div className="col-span-7 font-bold text-[1.2cqw] tracking-wide truncate text-white">
                  {row.name}
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-[1.2cqw] text-white">
                  {row.score}
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[0.8cqw] font-semibold bg-white/10 text-neutral-300">
                    {row.badge || 'Contender'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'rule_cards': {
      const rules = content.ruleCardsData || [];
      return (
        <div
          style={containerStyle}
          className="grid grid-cols-2 gap-4 p-2 items-stretch"
        >
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/60 border border-white/10 shadow-xl backdrop-blur-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600/20 text-white font-mono font-black text-[1.1cqw] border border-blue-500/30">
                    {rule.number}
                  </span>
                  {rule.tag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[0.8cqw] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {rule.tag}
                    </span>
                  )}
                </div>
                <h4 className="text-[1.3cqw] font-bold text-white mb-1.5 leading-tight">
                  {rule.title}
                </h4>
                <p className="text-[0.95cqw] text-slate-300 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
