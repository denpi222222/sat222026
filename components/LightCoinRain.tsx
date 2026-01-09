import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LightCoinRainProps {
    theme?: 'gold' | 'blue';
}

export const LightCoinRain = ({ theme = 'gold' }: LightCoinRainProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate fixed coins to prevent hydration mismatch
    const coins = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 4, // 4-8 seconds duration (slower & smoother)
            size: 20 + Math.random() * 20, // 20-40px
        }));
    }, []);

    if (!mounted) return null;

    const coinImage = theme === 'blue' ? '/images/coin-blue.png' : '/images/coin-gold.png';

    return (
        <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden" style={{ zIndex: 1 }}>
            {coins.map((coin) => (
                <motion.div
                    key={coin.id}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{
                        y: ['-10vh', '110vh'],
                        opacity: [0, 1, 1, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: coin.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: coin.delay,
                        repeatDelay: 0
                    }}
                    style={{
                        position: 'absolute',
                        left: coin.left,
                        width: coin.size,
                        height: coin.size,
                    }}
                >
                    <img
                        src={coinImage}
                        alt="coin"
                        className="w-full h-full object-contain opacity-60 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                        style={{ display: 'block' }}
                        onError={(e) => {
                            // Fallback to gold if blue fails
                            if (theme === 'blue') {
                                e.currentTarget.src = '/images/coin-gold.png';
                            }
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};
