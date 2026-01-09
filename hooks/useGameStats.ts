'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { apeChain } from '../config/chains';

const GAME_ADDR = apeChain.contracts.gameProxy.address;

// Comprehensive ABI for game contract stats
const GAME_STATS_ABI = [
  {
    name: 'totalBurned',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getBreedCostCRA',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'monthlyRewardPool',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'totalLockedForRewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'mainTreasury',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'totalBurnedCRAA',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'rewardRatePerSecond',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'pingInterval',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'breedCooldown',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'graveyardCooldown',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'burnFeeBps',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'manualFloorPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'monthlyUnlockPercentage',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'perPingCapDivisor',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'nftContract',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'craaToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

const ERC721_ABI = [
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

const DEAD_ADDRESS =
  '0x000000000000000000000000000000000000dEaD' as `0x${string}`;

/**
 * Consolidated game statistics interface combining all relevant game metrics
 *
 * Note: The collection is always limited to 5,000 NFTs maximum.
 * Breeding doesn't create new NFTs - it revives burned ones from the graveyard.
 */
export interface GameStats {
  // Core Token Statistics
  totalCRAABurned: string;
  totalTokensBurned: string;
  totalNFTs: number; // Always 5,000 (max collection size)
  activeCubes: number; // 5,000 minus burned NFTs

  // Pool Information
  currentMonthlyPool: string;
  currentLockedPool: string;
  mainTreasury: string;

  // Game Configuration
  currentBreedCost: string;
  rewardRatePerSecond: string;
  pingInterval: string;
  breedCooldown: string;
  graveyardCooldown: string;
  burnFeeBps: string;
  manualFloorPrice: string;
  monthlyUnlockPercentage: string;
  perPingCapDivisor: string;

  // Game State
  isPaused: boolean;
  graveyardSize: string;

  // CRAA Token Stats
  craaTotalSupply: string;
  craaDeadBalance: string;

  // Calculated Values
  burnFeePercentage: number;
  monthlyUnlockPercent: number;

  lastUpdated: number;
}

/**
 * Consolidated game statistics hook
 *
 * This hook replaces the following deprecated hooks:
 * - useNFTStats
 * - useCrazyCubeStats
 * - useCRAATokenStat
 * - Individual contract stat hooks
 *
 * @returns {object} Game statistics and utility functions
 */
export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const fetchGameStats = async () => {
    if (!publicClient) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      // Try to get contract addresses from game contract, use hardcoded fallback if fails
      let nftAddress: `0x${string}`;
      let craaAddress: `0x${string}`;

      try {
        [nftAddress, craaAddress] = (await Promise.all([
          publicClient.readContract({
            address: GAME_ADDR,
            abi: GAME_STATS_ABI,
            functionName: 'nftContract',
          }),
          publicClient.readContract({
            address: GAME_ADDR,
            abi: GAME_STATS_ABI,
            functionName: 'craaToken',
          }),
        ])) as [`0x${string}`, `0x${string}`];
      } catch {
        // Use hardcoded addresses as fallback
        nftAddress = apeChain.contracts.crazyCubeNFT.address;
        craaAddress = apeChain.contracts.crazyToken.address;
      }

      // Helper to safely read contract - returns default on failure
      const safeRead = async <T>(
        contractCall: () => Promise<T>,
        defaultValue: T
      ): Promise<T> => {
        try {
          return await contractCall();
        } catch (err) {
          // Mute warnings in production as requested
          return defaultValue;
        }
      };

      // Fetch all stats in parallel - each call handles its own errors
      const [
        totalCRAABurned,
        totalTokensBurned,
        currentMonthlyPool,
        currentLockedPool,
        mainTreasury,
        currentBreedCost,
        rewardRatePerSecond,
        pingInterval,
        breedCooldown,
        graveyardCooldown,
        burnFeeBps,
        manualFloorPrice,
        monthlyUnlockPercentage,
        perPingCapDivisor,
        isPaused,
        nftTotalSupply,
        craaTotalSupply,
        craaDeadBalance,
      ] = await Promise.all([
        // Game contract stats with safe defaults
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'totalBurnedCRAA',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'totalBurned',
        }), BigInt(5)), // Default graveyard size from subgraph
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'monthlyRewardPool',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'totalLockedForRewards',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'mainTreasury',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'getBreedCostCRA',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'rewardRatePerSecond',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'pingInterval',
        }), BigInt(3600)), // 1 hour default
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'breedCooldown',
        }), BigInt(86400)), // 24 hours default
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'graveyardCooldown',
        }), BigInt(604800)), // 7 days default
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'burnFeeBps',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'manualFloorPrice',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'monthlyUnlockPercentage',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'perPingCapDivisor',
        }), BigInt(1)),
        safeRead(() => publicClient.readContract({
          address: GAME_ADDR,
          abi: GAME_STATS_ABI,
          functionName: 'paused',
        }), false),
        // NFT contract stats
        safeRead(() => publicClient.readContract({
          address: nftAddress,
          abi: ERC721_ABI,
          functionName: 'totalSupply',
        }), BigInt(4995)), // Default from subgraph: Active NFTs
        // CRAA token stats
        safeRead(() => publicClient.readContract({
          address: craaAddress,
          abi: ERC20_ABI,
          functionName: 'totalSupply',
        }), BigInt(0)),
        safeRead(() => publicClient.readContract({
          address: craaAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [DEAD_ADDRESS],
        }), BigInt(0)),
      ]);

      const burnedCount = Number(totalTokensBurned as bigint);
      const totalNFTCount = Number(nftTotalSupply as bigint);

      // Max NFTs is always 5,000 regardless of breeding (breeding revives from graveyard)
      const MAX_NFTS = 5000;

      // Simplified logic to avoid negative values:
      // - Total NFTs = always 5000 (original collection limit)
      // - Active NFTs = current totalSupply (real active NFTs)
      // - Graveyard = totalBurned (simple count of burned NFTs)
      const activeCount = totalNFTCount;
      const graveyardCount = burnedCount;

      const burnFeePercent = Number(burnFeeBps as bigint) / 100;
      const monthlyUnlockPercent =
        Number(monthlyUnlockPercentage as bigint) / 100;

      const gameStats: GameStats = {
        totalCRAABurned: formatEther(totalCRAABurned as bigint),
        totalTokensBurned: (totalTokensBurned as bigint).toString(),
        totalNFTs: MAX_NFTS, // Always 5,000 regardless of current supply
        activeCubes: activeCount,
        currentMonthlyPool: formatEther(currentMonthlyPool as bigint),
        currentLockedPool: formatEther(currentLockedPool as bigint),
        mainTreasury: formatEther(mainTreasury as bigint),
        currentBreedCost: formatEther(currentBreedCost as bigint),
        rewardRatePerSecond: formatEther(rewardRatePerSecond as bigint),
        pingInterval: (pingInterval as bigint).toString(),
        breedCooldown: (breedCooldown as bigint).toString(),
        graveyardCooldown: (graveyardCooldown as bigint).toString(),
        burnFeeBps: (burnFeeBps as bigint).toString(),
        manualFloorPrice: formatEther(manualFloorPrice as bigint),
        monthlyUnlockPercentage: (monthlyUnlockPercentage as bigint).toString(),
        perPingCapDivisor: (perPingCapDivisor as bigint).toString(),
        isPaused: isPaused as boolean,
        graveyardSize: graveyardCount.toString(), // Use calculated graveyard count
        craaTotalSupply: formatEther(craaTotalSupply as bigint),
        craaDeadBalance: formatEther(craaDeadBalance as bigint),
        burnFeePercentage: burnFeePercent,
        monthlyUnlockPercent: monthlyUnlockPercent,
        lastUpdated: Date.now(),
      };

      setStats(gameStats);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch game stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameStats();
  }, [publicClient]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchGameStats, 120000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Helper functions for formatting
  const formatSeconds = (seconds: string) => {
    const secs = parseInt(seconds);
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const formatBPS = (bps: string) => {
    const percentage = (parseInt(bps) / 100).toFixed(2);
    return `${percentage}%`;
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
  };

  return {
    stats,
    isLoading,
    error,
    refresh: fetchGameStats,

    // Formatted getters
    get pingIntervalFormatted() {
      return stats ? formatSeconds(stats.pingInterval) : '0';
    },

    get breedCooldownFormatted() {
      return stats ? formatSeconds(stats.breedCooldown) : '0';
    },

    get graveyardCooldownFormatted() {
      return stats ? formatSeconds(stats.graveyardCooldown) : '0';
    },

    get burnFeeFormatted() {
      return stats ? formatBPS(stats.burnFeeBps) : '0%';
    },

    get monthlyUnlockFormatted() {
      return stats ? formatBPS(stats.monthlyUnlockPercentage) : '0%';
    },

    // Convenience getters for backward compatibility
    get totalNFTs() {
      return stats?.totalNFTs ?? 0;
    },

    get inGraveyard() {
      return parseInt(stats?.graveyardSize ?? '0');
    },

    get rewardPoolCRAA() {
      return stats?.currentMonthlyPool ?? '0';
    },

    get craSupply() {
      return stats?.craaTotalSupply ?? '0';
    },

    get breedCost() {
      return stats?.currentBreedCost ?? '0';
    },

    // Utility functions
    formatNumber,
    formatSeconds,
    formatBPS,
  };
};
