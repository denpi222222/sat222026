'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BurnEffectProps {
    stage: 'idle' | 'approvingCRAA' | 'approvingNFT' | 'burning';
    onComplete?: () => void;
}

export function BurnEffect({ stage, onComplete }: BurnEffectProps) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);
    const [smoke, setSmoke] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);

    useEffect(() => {
        if (stage === 'idle') {
            setParticles([]);
            setSmoke([]);
            return;
        }

        // Sparks/Fire particles
        const pCount = stage === 'approvingCRAA' ? 15 : stage === 'approvingNFT' ? 40 : 80;
        const newParticles = Array.from({ length: pCount }).map((_, i) => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: 90 + Math.random() * 20,
            delay: Math.random() * 2,
            size: Math.random() * 3 + 1,
        }));
        setParticles(newParticles);

        // Smoke particles
        const sCount = stage === 'approvingCRAA' ? 20 : stage === 'approvingNFT' ? 40 : 20;
        const newSmoke = Array.from({ length: sCount }).map((_, i) => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: 80 + Math.random() * 20,
            delay: Math.random() * 3,
            size: Math.random() * 20 + 10,
        }));
        setSmoke(newSmoke);
    }, [stage]);

    useEffect(() => {
        if (stage === 'burning' && onComplete) {
            const timer = setTimeout(onComplete, 4000); // 4 seconds for final burn
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [stage, onComplete]);

    if (stage === 'idle') return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-50">
            {/* Smoke layer (starts from stage 1) */}
            {smoke.map((s) => (
                <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.5, x: `${s.x}%`, y: `${s.y}%` }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        scale: [1, 2.5, 3.5],
                        y: [`${s.y}%`, `${s.y - 120}%`],
                        x: [`${s.x}%`, `${s.x + (Math.random() - 0.5) * 40}%`],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: s.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute bg-gray-500/20 blur-xl rounded-full"
                    style={{ width: s.size, height: s.size }}
                />
            ))}

            {/* Stage 1-2: Sparks and Fire */}
            {stage !== 'burning' && particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0, x: `${p.x}%`, y: `${p.y}%` }}
                    animate={{
                        opacity: [0, 1, 0.8, 0],
                        scale: [0, 1.5, 1, 0],
                        y: [`${p.y}%`, `${p.y - 70}%`],
                        x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 10}%`],
                    }}
                    transition={{
                        duration: 1.5 + Math.random(),
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeOut',
                    }}
                    className={`absolute rounded-full ${stage === 'approvingCRAA' ? 'bg-orange-400' : 'bg-red-500'}`}
                    style={{
                        width: p.size,
                        height: p.size,
                        boxShadow: `0 0 ${p.size * 3}px ${stage === 'approvingCRAA' ? '#fb923c' : '#ef4444'}`,
                    }}
                />
            ))}

            {/* Stage 3: FULL BURNING */}
            {stage === 'burning' && (
                <>
                    {/* Massive fire wave */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.8, 1.2, 1.4, 1.6],
                            filter: ['brightness(1)', 'brightness(2)', 'brightness(1.5)', 'brightness(3)']
                        }}
                        transition={{ duration: 4, ease: 'easeIn' }}
                        className="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-600 to-transparent"
                    />

                    {/* Debris / Ash particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: '50%', y: '50%', scale: 1 }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: [`50%`, `${p.x}%`],
                                y: [`50%`, `${Math.random() * -50}%`],
                                rotate: [0, 720],
                                scale: [1, 2, 0.5],
                            }}
                            transition={{
                                duration: 2.5 + Math.random(),
                                delay: Math.random() * 0.5,
                                ease: 'easeOut',
                            }}
                            className="absolute bg-gray-900 border border-gray-700"
                            style={{
                                width: p.size * 2,
                                height: p.size * 2,
                                borderRadius: Math.random() > 0.5 ? '2px' : '50%',
                            }}
                        />
                    ))}

                    {/* Flash at the peak */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="absolute inset-0 bg-white z-[60]"
                    />
                </>
            )}
        </div>
    );
}
