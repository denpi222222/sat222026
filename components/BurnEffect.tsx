'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface BurnEffectProps {
    stage: 'idle' | 'approvingCRAA' | 'approvingNFT' | 'burning';
    onComplete?: () => void;
}

export function BurnEffect({ stage, onComplete }: BurnEffectProps) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

    // Generate particles based on stage
    useEffect(() => {
        if (stage === 'idle') {
            setParticles([]);
            return;
        }

        const count = stage === 'approvingCRAA' ? 10 : stage === 'approvingNFT' ? 30 : 60;
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            delay: Math.random() * 0.5,
        }));
        setParticles(newParticles);
    }, [stage]);

    // Trigger onComplete when burning stage finishes
    useEffect(() => {
        if (stage === 'burning' && onComplete) {
            const timer = setTimeout(onComplete, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [stage, onComplete]);

    if (stage === 'idle') return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-50">
            {/* Stage 1: Sparks (approvingCRAA) */}
            {stage === 'approvingCRAA' && (
                <>
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0, x: `${p.x}%`, y: `${p.y}%` }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                y: [`${p.y}%`, `${p.y - 40}%`],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: p.delay,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            style={{
                                boxShadow: '0 0 4px rgba(255, 200, 0, 0.8)',
                            }}
                        />
                    ))}
                </>
            )}

            {/* Stage 2: Fire buildup (approvingNFT) */}
            {stage === 'approvingNFT' && (
                <>
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0, x: `${p.x}%`, y: `${p.y}%` }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0, 2, 0],
                                y: [`${p.y}%`, `${p.y - 60}%`],
                            }}
                            transition={{
                                duration: 2,
                                delay: p.delay,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                            className="absolute rounded-full"
                            style={{
                                width: '6px',
                                height: '6px',
                                background: 'radial-gradient(circle, rgba(255,150,0,0.9) 0%, rgba(255,50,0,0.4) 100%)',
                                boxShadow: '0 0 10px rgba(255, 100, 0, 0.6)',
                            }}
                        />
                    ))}
                    {/* Glow overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent"
                    />
                </>
            )}

            {/* Stage 3: Epic burning explosion (burning) */}
            {stage === 'burning' && (
                <>
                    {/* Massive fire wave */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 2.5, 3] }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,200,0,0.8) 0%, rgba(255,0,0,0.6) 40%, transparent 70%)',
                        }}
                    />

                    {/* Flying ash particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, Math.random() * 2 + 1, 0],
                                x: [`50%`, `${p.x}%`],
                                y: [`50%`, `${Math.random() * 100}%`],
                                rotate: [0, Math.random() * 360],
                            }}
                            transition={{
                                duration: 3,
                                delay: p.delay,
                                ease: 'easeOut',
                            }}
                            className="absolute"
                            style={{
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                background: Math.random() > 0.5
                                    ? 'linear-gradient(45deg, rgba(255,100,0,0.8), rgba(50,50,50,0.9))'
                                    : 'rgba(80,80,80,0.7)',
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            }}
                        />
                    ))}

                    {/* Screen flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute inset-0 bg-white"
                    />
                </>
            )}
        </div>
    );
}
