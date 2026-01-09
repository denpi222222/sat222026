import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const LightCoinRain = () => {
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
            duration: 3 + Math.random() * 3, // 3-6 seconds duration (slow & smooth)
            size: 20 + Math.random() * 20, // 20-40px
        }));
    }, []);

    if (!mounted) return null;

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
                        src="/images/coin-gold.png"
                        alt="coin"
                        className="w-full h-full object-contain opacity-60 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                        style={{ display: 'block' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};
