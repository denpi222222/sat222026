'use client';

/**
 * AnimatedBackground - Subtle animated gradient background
 * 
 * Creates a smooth, slowly moving gradient effect that adds life
 * to pages without heavy performance impact. Uses CSS animations only.
 */

interface AnimatedBackgroundProps {
    /** Color theme preset */
    theme?: 'pink' | 'blue' | 'gold' | 'purple' | 'green';
    /** Additional CSS classes */
    className?: string;
    /** Animation intensity: 'subtle' (default) | 'medium' | 'vibrant' */
    intensity?: 'subtle' | 'medium' | 'vibrant';
}

const themeColors = {
    pink: {
        from: 'from-pink-900',
        via: 'via-purple-900',
        to: 'to-pink-900',
        accent1: 'bg-pink-600/20',
        accent2: 'bg-purple-600/20',
        accent3: 'bg-fuchsia-600/15',
    },
    blue: {
        from: 'from-sky-900',
        via: 'via-cyan-900',
        to: 'to-blue-900',
        accent1: 'bg-cyan-600/20',
        accent2: 'bg-blue-600/20',
        accent3: 'bg-sky-600/15',
    },
    gold: {
        from: 'from-amber-900',
        via: 'via-yellow-900',
        to: 'to-orange-900',
        accent1: 'bg-amber-600/20',
        accent2: 'bg-yellow-600/20',
        accent3: 'bg-orange-600/15',
    },
    purple: {
        from: 'from-purple-900',
        via: 'via-indigo-900',
        to: 'to-violet-900',
        accent1: 'bg-purple-600/20',
        accent2: 'bg-indigo-600/20',
        accent3: 'bg-violet-600/15',
    },
    green: {
        from: 'from-emerald-900',
        via: 'via-green-900',
        to: 'to-teal-900',
        accent1: 'bg-emerald-600/20',
        accent2: 'bg-green-600/20',
        accent3: 'bg-teal-600/15',
    },
};

export function AnimatedBackground({
    theme = 'pink',
    className = '',
    intensity = 'subtle',
}: AnimatedBackgroundProps) {
    const colors = themeColors[theme];

    const sizeMultiplier = {
        subtle: 1,
        medium: 1.3,
        vibrant: 1.6,
    }[intensity];

    const opacityClass = {
        subtle: 'opacity-60',
        medium: 'opacity-75',
        vibrant: 'opacity-90',
    }[intensity];

    return (
        <>
            {/* Base gradient layer */}
            <div
                className={`fixed inset-0 -z-10 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} ${className}`}
            />

            {/* Animated floating orbs for depth */}
            <div className="fixed inset-0 -z-[9] overflow-hidden pointer-events-none">
                {/* Large slow-moving orb */}
                <div
                    className={`absolute rounded-full blur-3xl ${colors.accent1} ${opacityClass} animate-float-slow`}
                    style={{
                        width: `${40 * sizeMultiplier}vw`,
                        height: `${40 * sizeMultiplier}vw`,
                        top: '10%',
                        left: '-10%',
                    }}
                />

                {/* Medium orb */}
                <div
                    className={`absolute rounded-full blur-3xl ${colors.accent2} ${opacityClass} animate-float-medium`}
                    style={{
                        width: `${30 * sizeMultiplier}vw`,
                        height: `${30 * sizeMultiplier}vw`,
                        bottom: '5%',
                        right: '-5%',
                    }}
                />

                {/* Small accent orb */}
                <div
                    className={`absolute rounded-full blur-2xl ${colors.accent3} ${opacityClass} animate-float-fast`}
                    style={{
                        width: `${20 * sizeMultiplier}vw`,
                        height: `${20 * sizeMultiplier}vw`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </div>

            {/* Animation keyframes */}
            <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(5vw, 3vh) scale(1.05);
          }
          50% {
            transform: translate(2vw, 8vh) scale(0.95);
          }
          75% {
            transform: translate(-3vw, 5vh) scale(1.02);
          }
        }
        
        @keyframes float-medium {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-4vw, -5vh) scale(1.03);
          }
          66% {
            transform: translate(3vw, -2vh) scale(0.97);
          }
        }
        
        @keyframes float-fast {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 25s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 18s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 12s ease-in-out infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow,
          .animate-float-medium,
          .animate-float-fast {
            animation: none;
          }
        }
      `}</style>
        </>
    );
}

export default AnimatedBackground;
