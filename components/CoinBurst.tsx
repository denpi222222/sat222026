'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinBurstProps {
    trigger: boolean;
    onComplete?: () => void;
    count?: number;
}

export function CoinBurst({ trigger, onComplete, count = 12 }: CoinBurstProps) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setActive(true);
            const timer = setTimeout(() => {
                setActive(false);
                if (onComplete) onComplete();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    const coins = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            return {
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                rotate: Math.random() * 720,
                scale: 0.5 + Math.random() * 0.8,
                delay: Math.random() * 0.2,
            };
        });
    }, [count]);

    return (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-50'>
            <AnimatePresence>
                {active &&
                    coins.map(coin => (
                        <motion.div
                            key={coin.id}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                            animate={{
                                x: coin.x,
                                y: coin.y,
                                opacity: [1, 1, 0],
                                scale: [0, coin.scale, coin.scale * 0.5],
                                rotate: coin.rotate,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.2,
                                ease: 'easeOut',
                                delay: coin.delay,
                            }}
                            className='absolute'
                        >
                            <img
                                src='/images/coin-blue.png'
                                alt='coin'
                                className='w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]'
                                onError={(e) => {
                                    e.currentTarget.src = '/images/coin-gold.png';
                                }}
                            />
                        </motion.div>
                    ))}
            </AnimatePresence>
        </div>
    );
}
