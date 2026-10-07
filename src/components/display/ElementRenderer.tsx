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
      const isCompact = items.length > 5;
      const isUltraCompact = items.length > 8;

      return (
        <div
          style={containerStyle}
          className="flex flex-col justify-center w-full h-full p-2 lg:p-4 select-none"
        >
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 text-[0.85cqw] font-mono font-bold text-neutral-400 uppercase tracking-widest px-5 py-1 mb-1 border-b border-white/[0.06]">
            <span className="col-span-1 text-center">Rank</span>
            <span className="col-span-7">Team / Contender</span>
            <span className="col-span-2 text-right">Points</span>
            <span className="col-span-2 text-center">Standing</span>
          </div>

          {/* Leaderboard Rows */}
          <div className={`flex flex-col ${isUltraCompact ? 'gap-1' : isCompact ? 'gap-1.5' : 'gap-2.5'}`}>
            {items.map((row, idx) => {
              const isFirst = row.rank === 1;
              const isSecond = row.rank === 2;
              const isThird = row.rank === 3;

              let rowStyle = 'bg-neutral-900/40 border-white/[0.08] text-neutral-200';
              if (isFirst) {
                rowStyle = 'bg-gradient-to-r from-amber-500/25 via-neutral-900/80 to-neutral-950/90 border-amber-400/60 text-white shadow-xl shadow-amber-950/30 ring-1 ring-amber-400/20';
              } else if (isSecond) {
                rowStyle = 'bg-gradient-to-r from-slate-300/20 via-neutral-900/80 to-neutral-950/90 border-slate-300/40 text-white shadow-lg shadow-slate-900/40';
              } else if (isThird) {
                rowStyle = 'bg-gradient-to-r from-amber-700/20 via-neutral-900/80 to-neutral-950/90 border-amber-600/40 text-white shadow-lg shadow-amber-950/20';
              }

              const rowPadding = isUltraCompact ? 'py-1.5 px-4' : isCompact ? 'py-2 px-5' : 'py-3 px-5';
              const textScale = isUltraCompact ? 'text-[1.05cqw]' : isCompact ? 'text-[1.15cqw]' : 'text-[1.3cqw]';

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 items-center rounded-2xl border backdrop-blur-xl transition-all ${rowPadding} ${rowStyle}`}
                >
                  {/* Rank Column */}
                  <div className="col-span-1 flex items-center justify-center font-black">
                    {isFirst ? (
                      <span className="text-[1.5cqw] drop-shadow-md">🥇</span>
                    ) : isSecond ? (
                      <span className="text-[1.4cqw] drop-shadow-md">🥈</span>
                    ) : isThird ? (
                      <span className="text-[1.4cqw] drop-shadow-md">🥉</span>
                    ) : (
                      <span className="text-white font-mono font-black text-[1.1cqw] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08]">
                        #{row.rank}
                      </span>
                    )}
                  </div>

                  {/* Team Name Column */}
                  <div className={`col-span-7 font-black tracking-wide truncate text-white ${textScale}`}>
                    {row.name}
                  </div>

                  {/* Points / Score Column (Pure White Bold Monospace) */}
                  <div className="col-span-2 text-right font-mono font-black text-white drop-shadow-sm">
                    <span className={`${textScale}`}>{row.score}</span>
                  </div>

                  {/* Status / Badge Column */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[0.8cqw] font-bold uppercase tracking-wider backdrop-blur-md ${
                        isFirst
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                          : isSecond
                          ? 'bg-slate-300/20 text-slate-100 border border-slate-300/30'
                          : isThird
                          ? 'bg-amber-600/20 text-amber-200 border border-amber-600/30'
                          : 'bg-white/[0.08] text-neutral-300 border border-white/[0.08]'
                      }`}
                    >
                      {row.badge || 'Finalist'}
                    </span>
                  </div>
                </div>
              );
            })}
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
              className="flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/70 border border-white/[0.08] shadow-2xl backdrop-blur-2xl hover:border-blue-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-white font-mono font-black text-[1.15cqw] border border-blue-500/40 shadow-sm">
                    {rule.number}
                  </span>
                  {rule.tag && (
                    <span className="px-3 py-1 rounded-full text-[0.8cqw] font-bold uppercase tracking-wider bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                      {rule.tag}
                    </span>
                  )}
                </div>
                <h4 className="text-[1.35cqw] font-black text-white mb-2 leading-tight">
                  {rule.title}
                </h4>
                <p className="text-[0.95cqw] text-neutral-300 leading-relaxed font-normal">
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
