'use client';

/**
 * NFTRevealModal - Beautiful reveal animation for newly born NFT
 *
 * Shows the newborn NFT in the center of screen with:
 * - Smooth zoom-in animation
 * - Stars display
 * - Celebration effects
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getLocalNFTImage } from '@/lib/nftImages';

interface NFTRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokenId: number | null;
    stars?: number;
}

export function NFTRevealModal({
    isOpen,
    onClose,
    tokenId,
    stars = 1,
}: NFTRevealModalProps) {
    if (!tokenId) return null;

    const imageSrc = getLocalNFTImage(tokenId);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.3, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.3, y: 50 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                            duration: 0.5,
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="pointer-events-auto relative max-w-sm w-full mx-4">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* Card Container */}
                            <motion.div
                                initial={{ rotateY: -15 }}
                                animate={{ rotateY: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-6 border-2 border-pink-400/50 shadow-2xl shadow-pink-500/30"
                            >
                                {/* Sparkle decorations */}
                                <div className="absolute -top-3 -left-3">
                                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                                </div>
                                <div className="absolute -top-3 -right-3">
                                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                                </div>
                                <div className="absolute -bottom-3 -left-3">
                                    <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                                </div>
                                <div className="absolute -bottom-3 -right-3">
                                    <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                                </div>

                                {/* Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center mb-4"
                                >
                                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                                        New Cube Born! 🎉
                                    </h2>
                                </motion.div>

                                {/* NFT Image */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                                    className="relative mx-auto w-48 h-48 mb-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-50" />
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white/20">
                                        <Image
                                            src={imageSrc}
                                            alt={`Cube #${tokenId}`}
                                            fill
                                            className="object-contain"
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                </motion.div>

                                {/* Token ID */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-center mb-3"
                                >
                                    <span className="text-lg font-mono text-pink-200">
                                        Cube #{tokenId}
                                    </span>
                                </motion.div>

                                {/* Stars */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex justify-center gap-1 mb-4"
                                >
                                    {Array.from({ length: stars }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, rotate: -180, scale: 0 }}
                                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                            transition={{ delay: 0.7 + i * 0.1, type: 'spring' }}
                                        >
                                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Stars count text */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center mb-2"
                                >
                                    <span className="text-sm text-pink-200/80">
                                        {stars} {stars === 1 ? 'Star' : 'Stars'}
                                    </span>
                                </motion.div>

                                {/* Rarity display */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9, type: 'spring' }}
                                    className="text-center mb-4"
                                >
                                    <span className={`text-lg font-bold px-4 py-1 rounded-full ${stars >= 6 ? 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse' :
                                        stars >= 5 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                                            stars >= 4 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                                                stars >= 3 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                                    stars >= 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                        }`}>
                                        {stars >= 6 ? 'Mythic 🌟' :
                                            stars >= 5 ? 'Legendary ✨' :
                                                stars >= 4 ? 'Epic' :
                                                    stars >= 3 ? 'Rare' :
                                                        stars >= 2 ? 'Uncommon' :
                                                            'Common'}
                                    </span>
                                </motion.div>

                                {/* Close button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <Button
                                        onClick={onClose}
                                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl"
                                    >
                                        Awesome! ✨
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default NFTRevealModal;
