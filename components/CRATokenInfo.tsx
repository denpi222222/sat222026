/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !! ВНИМАНИЕ! useSubgraphData НЕ РАБОТАЕТ! Subgraph denis-3 МЁРТВ!      !!
 * !! Subgraph данные не приходят. Цена работает через DexScreener.       !!
 * !! Остальное нужно переписать на прямые RPC запросы.                    !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
'use client';

import { createPublicClient, http, formatEther } from 'viem';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubgraphData } from '@/hooks/useSubgraphData';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Flame,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

// CRAA Token API
const CRAA_API = '/api/craa-token';
const CRAA_TOKEN_ADDRESS = '0xBb526D657Cc1Ba772469A6EC96AcB2ed9D2A93e5';

// Public Viem client (read-only)
const publicClient = createPublicClient({
  transport: http('https://rpc.apechain.com'),
});

// ERC20 totalSupply ABI fragment
const ERC20_ABI = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
];

// Keys used in localStorage cache
const BURN_CACHE_KEY = 'craa_burned_cache'; // amount burned (wei) + ts
const INITIAL_SUPPLY_KEY = 'cra_initial_supply'; // cached initial totalSupply (wei)
// TTL 4 hours
const BURN_CACHE_TTL_MS = 4 * 60 * 60 * 1000;

interface CRATokenData {
  // Basic data
  totalSupply: string;
  circulatingSupply: string;
  burnedAmount: string;
  lockedInGame: string;

  // Prices
  priceUSD: number;
  priceAPE: number;
  marketCap: number;
  volume24h: number;

  // 24h changes
  priceChange24h: number;
  volumeChange24h: number;

  // Game stats
  totalBurns: number;
  totalClaimed: number;
  avgBurnAmount: number;

  // Metadata
  lastUpdated: string;
}

export default function CRATokenInfo() {
  const [tokenData, setTokenData] = useState<CRATokenData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const {
    contractStats,
    globalStats,
    craaStats,
    isLoading: loadingSubgraph,
    error: subgraphError,
    refresh: refreshSubgraph,
  } = useSubgraphData();

  // Load CRAA price data
  useEffect(() => {
    fetchPriceData();
  }, []);

  const fetchPriceData = async () => {
    setLoadingPrice(true);
    setPriceError(null);

    try {
      // 1. Request price data from internal API
      const priceRes = await fetch(CRAA_API);
      const priceResult = await priceRes.json();

      let priceData = null;
      if (priceResult.success) {
        priceData = priceResult.data;
      }

      // DexScreener fallback if interal API failed or returned null
      if (!priceData) {
        try {
          const dsRes = await fetch(
            'https://api.dexscreener.com/latest/dex/pairs/apechain/0x7493b5d547c6d9f42ca1133dcd39e2472b633efc'
          );
          const dsJson = await dsRes.json();
          if (dsJson?.pair) {
            const p = dsJson.pair;
            priceData = {
              priceUsd: parseFloat(p.priceUsd ?? '0'),
              priceAPE: parseFloat(p.priceNative ?? '0'),
              marketCap: parseFloat(p.fdvUsd ?? p.marketCapUsd ?? '0'),
              volume24h: parseFloat(p.volume?.h24 ?? '0'),
              priceChange24h: parseFloat(p.priceChange?.h24 ?? '0'),
              volumeChange24h: 0,
            } as any;
          }
        } catch (dsErr: unknown) {
          console.error('DexScreener error:', dsErr);
        }
      }

      if (priceData) {
        // Build price part of the data
        setTokenData((prev) => ({
          ...(prev || ({} as CRATokenData)),
          priceUSD: parseFloat(
            (priceData?.price_usd ??
              priceData?.priceUsd ??
              priceData?.priceUSD) ||
            '0'
          ),
          priceAPE:
            parseFloat(
              priceData?.price_native ??
              priceData?.priceNative ??
              priceData?.priceAPE ??
              '0'
            ) ||
            parseFloat(priceData?.price_usd ?? priceData?.priceUsd ?? '0') / 1.2,
          marketCap: parseFloat(
            (priceData?.market_cap_usd ??
              priceData?.marketCap ??
              priceData?.marketCapUsd ??
              priceData?.market_cap) ||
            '0'
          ),
          volume24h: parseFloat(
            priceData?.volume_24h_usd ??
            priceData?.volume24h ??
            priceData?.volumeUsd ??
            '0'
          ),
          priceChange24h: parseFloat(
            (priceData?.price_change_24h ??
              priceData?.priceChange24h ??
              priceData?.priceChange24H ??
              priceData?.priceChange?.h24) ||
            '0'
          ),
          volumeChange24h: 0,
        }));
      }
    } catch (error: unknown) {
      setPriceError(error instanceof Error ? error.message : 'Price fetch failed');
    } finally {
      setLoadingPrice(false);
    }
  };

  // Merge Subgraph data when available
  useEffect(() => {
    if (contractStats || globalStats || craaStats) {
      setTokenData((prev) => ({
        ...(prev || ({} as CRATokenData)),
        totalSupply: craaStats?.totalSupply || prev?.totalSupply || '0',
        circulatingSupply: '0',
        burnedAmount: contractStats?.totalCRAABurned || craaStats?.deadBalance || prev?.burnedAmount || '0',
        lockedInGame: contractStats?.mainTreasury || prev?.lockedInGame || '0',
        totalBurns: globalStats?.totalBurns || prev?.totalBurns || 0,
        totalClaimed: parseInt(globalStats?.totalClaimed || '0') / 1e18,
        avgBurnAmount: 0,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [contractStats, globalStats, craaStats]);

  // Fallback for burned amount from on-chain if subgraph is not available
  useEffect(() => {
    if (!contractStats) {
      const getBurnedOnChain = async () => {
        try {
          const totalSupplyWei = (await publicClient.readContract({
            address: CRAA_TOKEN_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'totalSupply',
          })) as bigint;

          const initialSupplyWei = 500000000n * 10n ** 18n; // Example initial supply
          const burned = initialSupplyWei > totalSupplyWei ? initialSupplyWei - totalSupplyWei : 0n;

          setTokenData(prev => ({
            ...(prev || {} as CRATokenData),
            burnedAmount: burned.toString(),
            totalSupply: totalSupplyWei.toString(),
          }));
        } catch (e) {
          console.error('On-chain burn fetch error:', e);
        }
      };
      getBurnedOnChain();
    }
  }, [contractStats]);

  const handleRefresh = () => {
    fetchPriceData();
    refreshSubgraph();
  };

  // Helper: format numbers
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatFull = (num: number) =>
    num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatCurrency = (num: number, fixed?: number) => {
    if (!isFinite(num)) return '$0';
    const abs = Math.abs(num);
    let decimals = fixed ?? 2;
    if (fixed === undefined) {
      if (abs >= 1) decimals = 2;
      else if (abs >= 0.01) decimals = 4;
      else if (abs >= 0.0001) decimals = 6;
      else decimals = 8;
    } else {
      decimals = fixed;
    }
    return `$${num.toFixed(decimals)}`;
  };

  const isLoading = loadingPrice || (loadingSubgraph && !tokenData);
  const error = priceError || subgraphError;

  if (isLoading && !tokenData) {
    return (
      <Card className='p-6 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30'>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-48' />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className='h-24' />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error && !tokenData) {
    return (
      <Card className='p-6 bg-red-900/20 border-red-500/30'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertCircle className='h-6 w-6 text-red-400' />
          <h3 className='text-xl font-bold text-red-300'>
            Error loading CRAA data
          </h3>
        </div>
        <p className='text-red-200 mb-4'>{error}</p>
        <Button
          onClick={handleRefresh}
          variant='outline'
          className='border-red-500/50 text-red-300'
        >
          <RefreshCw className='h-4 w-4 mr-2' />
          Retry
        </Button>
      </Card>
    );
  }

  if (!tokenData) return null;

  const isPositiveChange = (tokenData.priceChange24h || 0) > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card className='p-6 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-orange-500/20 rounded-lg'>
              <Coins className='h-6 w-6 text-orange-400' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-white'>CRAA Token</h2>
              <p className='text-slate-300 text-sm'>
                Crazy Adventure Advanced Token
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='border-orange-500/50 text-orange-300'
            >
              Indexer: {loadingSubgraph ? 'Syncing...' : 'Live'}
            </Badge>
            <Button onClick={handleRefresh} variant='ghost' size='sm'>
              <RefreshCw className={`h-4 w-4 ${loadingSubgraph || loadingPrice ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Price */}
          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <DollarSign className='h-4 w-4 text-green-400' />
              <span className='text-sm text-slate-400'>CRAA Price</span>
            </div>
            <div className='text-xl font-bold text-white'>
              {formatCurrency(tokenData.priceUSD || 0)}
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${(isPositiveChange) ? 'text-green-400' : 'text-red-400'}`}
            >
              {isPositiveChange ? (
                <TrendingUp className='h-3 w-3' />
              ) : (
                <TrendingDown className='h-3 w-3' />
              )}
              {Math.abs(tokenData.priceChange24h || 0).toFixed(2)}%
            </div>
          </div>

          {/* Market Cap */}
          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <BarChart3 className='h-4 w-4 text-blue-400' />
              <span className='text-sm text-slate-400'>Market Cap (CRAA)</span>
            </div>
            <div className='text-xl font-bold text-white'>
              {formatCurrency(tokenData.marketCap || 0, 0)}
            </div>
            <div className='text-sm text-slate-400'>
              {formatNumber(tokenData.marketCap || 0, 0)}
            </div>
          </div>

          {/* Volume 24h */}
          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <BarChart3 className='h-4 w-4 text-purple-400' />
              <span className='text-sm text-slate-400'>Volume 24h (CRAA)</span>
            </div>
            <div className='text-xl font-bold text-white'>
              {formatCurrency(tokenData.volume24h || 0, 0)}
            </div>
            <div className='text-sm text-slate-400'>
              {formatNumber(tokenData.volume24h || 0, 0)}
            </div>
          </div>

          {/* Total Burns */}
          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Flame className='h-4 w-4 text-orange-400' />
              <span className='text-sm text-slate-400'>Total Burns</span>
            </div>
            <div className='text-xl font-bold text-white'>
              {formatNumber(tokenData.totalBurns || 0, 0)}
            </div>
            <div className='text-sm text-slate-400'>
              Indexed by Subgraph
            </div>
          </div>
        </div>

        {/* Supply Information */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='text-sm text-slate-400 mb-1'>Total CRAA Supply</div>
            <div className='text-lg font-bold text-white'>
              {tokenData.totalSupply ? formatFull(parseFloat(tokenData.totalSupply) / 1e18) : '0'}
            </div>
          </div>

          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='text-sm text-slate-400 mb-1'>Game Treasury</div>
            <div className='text-lg font-bold text-white'>
              {tokenData.lockedInGame ? formatFull(parseFloat(tokenData.lockedInGame) / 1e18) : '0'}
            </div>
          </div>

          <div className='bg-slate-800/50 p-4 rounded-lg'>
            <div className='text-sm text-slate-400 mb-1'>Burned CRAA</div>
            <div className='text-lg font-bold text-orange-400'>
              {tokenData.burnedAmount ? formatFull(parseFloat(tokenData.burnedAmount) / 1e18) : '0'}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className='flex flex-wrap gap-2 mt-6'>
          <Button variant='outline' size='sm' asChild>
            <a
              href={`https://www.geckoterminal.com/apechain/pools/0x7493b5d547c6d9f42ca1133dcd39e2472b633efc`}
              target='_blank'
              rel='noopener'
            >
              <ExternalLink className='h-3 w-3 mr-1' />
              GeckoTerminal
            </a>
          </Button>

          <Button variant='outline' size='sm' asChild>
            <a
              href={`https://apechain.celatone.io/address/${CRAA_TOKEN_ADDRESS}`}
              target='_blank'
              rel='noopener'
            >
              <ExternalLink className='h-3 w-3 mr-1' />
              Explorer
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
