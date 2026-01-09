'use client';

import React, { useEffect, useRef, useState } from 'react';

type NeonTitleProps = {
  title: string;
  subtitle?: string;
};

/**
 * NeonTitle renders a neon-glowing title with occasional flicker effect.
 * On each flicker it dispatches a global custom event 'crazycube:spark-burst'
 * with the screen coordinates of the title center to trigger spark rain.
 */
export function NeonTitle({ title, subtitle }: NeonTitleProps) {
  const [isFlickering, setIsFlickering] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const triggerBurst = () => {
      setIsFlickering(true);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const detail = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        window.dispatchEvent(new CustomEvent('crazycube:spark-burst', { detail }));
      }
      window.setTimeout(() => setIsFlickering(false), 220 + Math.random() * 180);
    };

    const scheduleFlicker = () => {
      const nextInMs = 2000 + Math.random() * 3000; // 2-5s repeat
      timer = window.setTimeout(() => {
        triggerBurst();
        scheduleFlicker();
      }, nextInMs) as unknown as number;
    };

    // Guaranteed first burst after ~2 seconds
    const first = window.setTimeout(() => {
      triggerBurst();
      scheduleFlicker();
    }, 2000) as unknown as number;

    return () => {
      if (timer) window.clearTimeout(timer);
      if (first) window.clearTimeout(first);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 text-center select-none">
      <h1
        className={
          'mx-auto uppercase font-extrabold tracking-[0.2em] ' +
          'text-3xl md:text-6xl lg:text-8xl crazycube-neon-title ' +
          (isFlickering ? ' crazycube-neon-flicker' : '')
        }
      >
        {title}
      </h1>
      {subtitle ? (
        <div className="mt-2 text-[12px] md:text-lg lg:text-xl crazycube-neon-subtitle">
          {subtitle}
        </div>
      ) : null}

      <style jsx>{`
        .crazycube-neon-title {
          color: #c8f3ff;
          text-shadow:
            0 0 10px rgba(34, 211, 238, 1),
            0 0 24px rgba(14, 165, 233, 0.95),
            0 0 60px rgba(59, 130, 246, 0.9),
            0 0 120px rgba(14, 165, 233, 0.85);
          filter: saturate(1.35) brightness(1.12);
          transition: filter 120ms ease, transform 120ms ease, letter-spacing 120ms ease;
        }
        .crazycube-neon-subtitle {
          color: rgba(186, 230, 253, 1);
          text-shadow:
            0 0 8px rgba(34, 211, 238, 0.8),
            0 0 18px rgba(14, 165, 233, 0.75);
        }
        .crazycube-neon-flicker {
          animation: crazycubeFlicker 0.28s linear 0s 1;
        }
        @keyframes crazycubeFlicker {
          0% { filter: brightness(0.6) saturate(0.9); letter-spacing: 0.18em; transform: translateY(0); }
          20% { filter: brightness(1.4) saturate(1.6); letter-spacing: 0.22em; transform: translateY(-1px); }
          40% { filter: brightness(0.8) saturate(1.0); letter-spacing: 0.2em; transform: translateY(0); }
          60% { filter: brightness(1.8) saturate(1.8); letter-spacing: 0.25em; transform: translateY(-1px); }
          80% { filter: brightness(0.7) saturate(1.0); letter-spacing: 0.19em; transform: translateY(0); }
          100% { filter: brightness(1.1) saturate(1.3); letter-spacing: 0.2em; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


