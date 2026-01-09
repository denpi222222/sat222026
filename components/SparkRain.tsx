'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

type Spark = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number; // seconds
    size: number;
    hue: number;
};

type SparkRainProps = {
    className?: string;
    enabled?: boolean;
};

/** Canvas spark rain with jump protection (delta clamping) */
export function SparkRain({ className = '', enabled = true }: SparkRainProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isClient, setIsClient] = useState(false);
    const sparksRef = useRef<Spark[]>([]);
    const lastTimeRef = useRef<number>(0);
    const rafRef = useRef<number>(0);
    const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

    // Reduced particle settings for safety
    const config = useMemo(() => {
        if (intensity === 'high') {
            return { countMin: 80, countMax: 120, blur: 8, sizeMin: 1.5, sizeMax: 2.8, gravity: 400, fade: 1.0 };
        }
        if (intensity === 'medium') {
            return { countMin: 30, countMax: 50, blur: 4, sizeMin: 1.2, sizeMax: 2.5, gravity: 350, fade: 1.15 };
        }
        // Low setting
        return { countMin: 10, countMax: 20, blur: 2, sizeMin: 1, sizeMax: 1.8, gravity: 300, fade: 1.25 };
    }, [intensity]);

    useEffect(() => {
        setIsClient(true);
        // Simple mobile detection for initial intensity
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        setIntensity(isMobile ? 'low' : 'medium');

        const onResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const emitSparks = useCallback((x: number, y: number) => {
        const count = config.countMin + Math.floor(Math.random() * (config.countMax - config.countMin));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Reduced initial speed
            const speed = 60 + Math.random() * 150;
            sparksRef.current.push({
                id: Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 80,
                life: 0.8 + Math.random() * 0.8,
                size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
                hue: 180 + Math.random() * 120,
            });
        }
    }, [config]);

    // Handle spark-burst events
    useEffect(() => {
        if (!enabled) return;
        const onBurst = (e: Event) => {
            const { detail } = e as CustomEvent<{ x: number; y: number }>;
            const x = detail?.x ?? window.innerWidth / 2;
            const y = detail?.y ?? window.innerHeight * 0.2;
            emitSparks(x, y);
        };
        window.addEventListener('crazycube:spark-burst', onBurst as EventListener);
        return () => window.removeEventListener('crazycube:spark-burst', onBurst as EventListener);
    }, [enabled, emitSparks]);

    useEffect(() => {
        if (!isClient || !enabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const gravity = config.gravity;
        const fade = config.fade;

        const loop = (t: number) => {
            // Fix: Initialize lastTimeRef on first frame
            if (!lastTimeRef.current) {
                lastTimeRef.current = t;
            }

            // Calculate delta
            let dt = (t - lastTimeRef.current) / 1000;
            lastTimeRef.current = t;

            // Fix: Clamp delta time to max 50ms (0.05s) to prevent huge jumps on lag
            if (dt > 0.05) dt = 0.05;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';

            const next: Spark[] = [];
            for (const s of sparksRef.current) {
                const nx = s.x + s.vx * dt;
                const ny = s.y + s.vy * dt;
                const nvy = s.vy + gravity * dt;
                const nlife = s.life - dt * fade;
                if (nlife > 0 && ny < canvas.height + 20) {
                    next.push({ ...s, x: nx, y: ny, vy: nvy, life: nlife });
                    const alpha = Math.max(0, Math.min(1, nlife));
                    ctx.beginPath();
                    ctx.fillStyle = `hsla(${s.hue}, 90%, 60%, ${alpha})`;
                    ctx.shadowColor = `hsla(${s.hue}, 90%, 70%, ${alpha})`;
                    ctx.shadowBlur = config.blur;
                    ctx.arc(nx, ny, s.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            sparksRef.current = next;
            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isClient, enabled, config]);

    if (!isClient || !enabled) return null;
    return (
        <canvas
            ref={canvasRef}
            className={`pointer-events-none fixed inset-0 z-[5] block w-screen h-screen ${className}`}
            style={{ contain: 'strict' }}
        />
    );
}
