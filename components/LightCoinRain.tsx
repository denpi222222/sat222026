'use client';

/**
 * LightCoinRain - Lightweight CSS-based coin animation with images
 * 
 * Uses CSS animations with coin images for maximum compatibility
 * across all devices and browsers.
 */

import { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';

interface LightCoinRainProps {
    /** Number of coins. Default 15 for performance */
    count?: number;
    /** Coin color theme - determines which image to use */
    theme?: 'gold' | 'blue' | 'cyan';
    /** Extra CSS classes */
    className?: string;
    /** Disable on mobile for performance */
    disableOnMobile?: boolean;
}

export function LightCoinRain({
    count = 15,
    theme = 'gold',
    className = '',
    disableOnMobile = false,
}: LightCoinRainProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Generate coin positions only on client
    const coins = useMemo(() => {
        if (!isMounted) return [];

        const effectiveCount = isMobile ? Math.min(count, 10) : count;

        return Array.from({ length: effectiveCount }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: isMobile ? 20 + Math.random() * 16 : 28 + Math.random() * 24, // 20-36px mobile, 28-52px desktop
            delay: Math.random() * 12, // 0-12s delay
            duration: 14 + Math.random() * 8, // 14-22s (slow and smooth)
            opacity: isMobile ? 0.4 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4, // 0.4-0.7 mobile, 0.5-0.9 desktop
        }));
    }, [isMounted, isMobile, count]);

    // Don't render on mobile if disabled
    if (disableOnMobile && isMobile) return null;
    if (!isMounted) return null;

    // Determine coin image based on theme
    const getCoinImage = () => {
        switch (theme) {
            case 'blue':
            case 'cyan':
                return '/images/coin-blue.png';
            case 'gold':
            default:
                return '/images/coin-gold.png';
        }
    };

    const coinImage = getCoinImage();

    return (
        <>
            <div
                className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
                aria-hidden="true"
            >
                {coins.map((coin) => (
                    <span
                        key={coin.id}
                        className="absolute light-coin"
                        style={{
                            left: `${coin.left}%`,
                            opacity: coin.opacity,
                            animationDuration: `${coin.duration}s`,
                            animationDelay: `${coin.delay}s`,
                        }}
                    >
                        <Image
                            src={coinImage}
                            alt=""
                            width={coin.size}
                            height={coin.size}
                            style={{
                                width: coin.size,
                                height: coin.size,
                                display: 'block',
                            }}
                            draggable={false}
                            onError={(e) => {
                                // Fallback to blue coin if gold fails
                                if (theme === 'gold') {
                                    e.currentTarget.src = '/images/coin-blue.png';
                                }
                            }}
                        />
                    </span>
                ))}
            </div>

            <style jsx>{`
        .light-coin {
          top: -60px;
          animation-name: lightCoinFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
          contain: layout style;
        }

        @keyframes lightCoinFall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
          }
        }

        /* When reduced motion is preferred, show coins at fixed positions */
        @media (prefers-reduced-motion: reduce) {
          .light-coin {
            animation: none;
            transform: translateY(50vh);
            opacity: 0.4;
          }
        }
      `}</style>
        </>
    );
}

export default LightCoinRain;
