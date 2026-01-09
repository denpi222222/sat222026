'use client';

import { useMemo } from 'react';
import Image from 'next/image';

interface CoinsAnimationProps {
    /** Amount of coins per 100 vw (≈ screen width). Default = 12 */
    density?: number;
    /** Extra classes to pass to root wrapper */
    className?: string;
    /** Base intensity multiplier. 1 = default. Increase for more coins. */
    intensity?: number;
    /** Coin color: gold (default) or blue */
    theme?: 'gold' | 'blue';
}

/**
 * Fixed layer that drops coin-blue.png from top of screen.
 * Uses Pure CSS for maximum smoothness and stability on all devices.
 * No JS frame loop means no "flying fast" glitches.
 */
export function CoinsAnimation({
    density = 12,
    className = '',
    intensity,
    theme = 'gold',
}: CoinsAnimationProps) {
    // If intensity is passed, use it for density (for backward compatibility)
    const effectiveDensity =
        intensity !== undefined ? density * intensity : density;

    // Pre-generate list of coins with random parameters
    // Use CSS variables for random values to avoid re-renders
    const coins = useMemo(() => {
        // Only run on client effectively, but safe for SSR
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
        const isMobile = vw < 768;

        // Reduce density on mobile significantly
        const mobileDensity = Math.max(4, effectiveDensity * 0.4);
        const actualDensity = isMobile ? mobileDensity : effectiveDensity;
        const count = Math.max(5, Math.round((vw / 1440) * actualDensity));

        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100, // vw %
            size: isMobile ? 18 + Math.random() * 14 : 24 + Math.random() * 24, // 18-32px mobile, 24-48px desktop
            delay: Math.random() * -15, // Negative delay to start mid-animation
            // duration: 12s to 18s (STANDARDIZED)
            duration: 12 + Math.random() * 6,
            opacity: isMobile ? 0.3 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4,
        }));
    }, [effectiveDensity]);

    return (
        <div
            className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
            aria-hidden="true"
        >
            {coins.map((c) => (
                <div
                    key={c.id}
                    className='absolute coin-item'
                    style={{
                        left: `${c.left}%`,
                        width: `${c.size}px`,
                        height: `${c.size}px`,
                        opacity: c.opacity,
                        animationDuration: `${c.duration}s`,
                        animationDelay: `${c.delay}s`,
                        top: '-10vh' // Start slightly above viewport
                    }}
                >
                    <Image
                        src={
                            theme === 'blue'
                                ? '/images/coin-blue.png'
                                : '/images/coin-gold.png'
                        }
                        alt=''
                        width={c.size}
                        height={c.size}
                        className="w-full h-full object-contain"
                        draggable={false}
                        onError={e => {
                            if (theme === 'gold') {
                                e.currentTarget.src = '/images/coin-blue.png';
                            }
                        }}
                    />
                </div>
            ))}
            <style jsx>{`
        .coin-item {
          animation-name: coinFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform; /* Hint to browser to use compositor */
        }

        @keyframes coinFall {
          0% {
            transform: translateY(0vh) rotate(0deg);
          }
          100% {
            transform: translateY(120vh) rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}

export default CoinsAnimation;
