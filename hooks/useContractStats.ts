'use client';

/**
 * useContractStats - Прямые RPC запросы к контрактам ApeChain
 * 
 * ВАЖНО: Этот хук заменяет useSubgraphData, потому что subgraph denis-3 МЁРТВ!
 * Использует тот же подход что и nft-cooldown-inspector.tsx
 */

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatEther } from 'viem';

// ApeChain configuration
const apeChain = {
  id: 33139,
  name: 'ApeChain',
  nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.apechain.com'] }
  }
};

// Contract addresses
const CONTRACTS = {
  gameProxy: '0x7dFb75F1000039D650A4C2B8a068f53090e857dD' as `0x${string}`,
  crazyCubeNFT: '0x606a47707d5aEdaE9f616A6f1853fE3075bA740B' as `0x${string}`,
  craaToken: '0xBb526D657Cc1Ba772469A6EC96AcB2ed9D2A93e5' as `0x${string}`,
  deadAddress: '0x000000000000000000000000000000000000dEaD' as `0x${string}`,
};

// ABI for game proxy contract
const GAME_PROXY_ABI = [
  { type: 'function', name: 'monthlyPool', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'lockedPool', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'mainTreasury', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalStars', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'rewardRatePerSecond', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'pingInterval', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'breedCooldown', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'graveyardCooldown', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'manualFloorPrice', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'breedCost', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'burnFeeBps', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'monthlyUnlockBps', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

// ERC20 ABI for CRAA token
const ERC20_ABI = [
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ type: 'address', name: 'account' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

// NFT ABI
const NFT_ABI = [
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

export interface ContractStats {
  // Pool Information
  currentMonthlyPool: string;
  currentLockedPool: string;
  mainTreasury: string;

  // Game Stats
  totalStars: string;

  // Configuration
  rewardRatePerSecond: string;
  pingInterval: string;
  breedCooldown: string;
  graveyardCooldown: string;
  manualFloorPrice: string;
  currentBreedCost: string;
  burnFeeBps: string;
  monthlyUnlockPercentage: string;

  // Token stats
  craaTokenTotalSupply: string;
  craaTokenBurned: string;

  // NFT stats
  nftTotalSupply: string;

  // Computed/placeholder values for compatibility
  totalCRAABurned: string;
  totalTokensBurned: string;
  graveyardSize: string;
}

// Create client once
const client = createPublicClient({
  chain: apeChain,
  transport: http('https://rpc.apechain.com')
});

export const useContractStats = () => {
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Safe read helper
  const safeRead = async <T,>(
    address: `0x${string}`,
    abi: readonly any[],
    functionName: string,
    args: any[] = []
  ): Promise<T | null> => {
    try {
      const result = await client.readContract({
        address,
        abi,
        functionName,
        args
      });
      return result as T;
    } catch (e) {
      console.error(`[useContractStats] Error reading ${functionName}:`, e);
      return null;
    }
  };

  // Fetch all stats
  const fetchAllStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch all data
      const [
        monthlyPool,
        lockedPool,
        mainTreasury,
        totalStars,
        rewardRate,
        pingInterval,
        breedCooldown,
        graveyardCooldown,
        floorPrice,
        breedCost,
        burnFee,
        monthlyUnlock,
        craaSupply,
        craaBurned,
        nftSupply
      ] = await Promise.all([
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'monthlyPool'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'lockedPool'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'mainTreasury'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'totalStars'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'rewardRatePerSecond'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'pingInterval'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'breedCooldown'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'graveyardCooldown'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'manualFloorPrice'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'breedCost'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'burnFeeBps'),
        safeRead<bigint>(CONTRACTS.gameProxy, GAME_PROXY_ABI, 'monthlyUnlockBps'),
        safeRead<bigint>(CONTRACTS.craaToken, ERC20_ABI, 'totalSupply'),
        safeRead<bigint>(CONTRACTS.craaToken, ERC20_ABI, 'balanceOf', [CONTRACTS.deadAddress]),
        safeRead<bigint>(CONTRACTS.crazyCubeNFT, NFT_ABI, 'totalSupply'),
      ]);

      const stats: ContractStats = {
        currentMonthlyPool: (monthlyPool ?? 0n).toString(),
        currentLockedPool: (lockedPool ?? 0n).toString(),
        mainTreasury: (mainTreasury ?? 0n).toString(),
        totalStars: (totalStars ?? 0n).toString(),
        rewardRatePerSecond: (rewardRate ?? 0n).toString(),
        pingInterval: (pingInterval ?? 0n).toString(),
        breedCooldown: (breedCooldown ?? 0n).toString(),
        graveyardCooldown: (graveyardCooldown ?? 0n).toString(),
        manualFloorPrice: (floorPrice ?? 0n).toString(),
        currentBreedCost: (breedCost ?? 0n).toString(),
        burnFeeBps: (burnFee ?? 0n).toString(),
        monthlyUnlockPercentage: (monthlyUnlock ?? 0n).toString(),
        craaTokenTotalSupply: (craaSupply ?? 0n).toString(),
        craaTokenBurned: (craaBurned ?? 0n).toString(),
        nftTotalSupply: (nftSupply ?? 0n).toString(),

        // Compatibility fields (use burned CRAA from dead address balance)
        totalCRAABurned: (craaBurned ?? 0n).toString(),
        totalTokensBurned: '0', // Not available from direct RPC
        graveyardSize: '0', // Would need to track events or different method
      };

      setContractStats(stats);
      setLastRefresh(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract stats';
      setError(errorMessage);
      console.error('[useContractStats] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllStats, 30000);
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  return {
    contractStats,
    isLoading,
    error,
    lastRefresh,
    refresh: fetchAllStats,

    // Compatibility with useSubgraphData interface
    globalStats: null, // Not available from direct RPC
    craaStats: contractStats ? {
      id: '1',
      totalSupply: contractStats.craaTokenTotalSupply,
      deadBalance: contractStats.craaTokenBurned,
      lastUpdated: Date.now().toString(),
    } : null,
  };
};

export default useContractStats;
