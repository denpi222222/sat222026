/**
 * ContractFullStats - Contract Stats Tab
 * 
 * ИСПРАВЛЕНО: Теперь использует useContractStats (прямые RPC запросы)
 * вместо мёртвого useSubgraphData (subgraph denis-3 не работает)
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractStats } from '@/hooks/useContractStats';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import {
  Flame,
  Coins,
  DollarSign,
  TrendingUp,
  Zap,
  Activity,
  Users,
  Clock,
  Target,
  BarChart3,
  Sparkles,
  Shield,
  Vault,
  RefreshCw,
} from 'lucide-react';
import { formatWithCommas } from '@/utils/formatNumber';
import { Button } from '@/components/ui/button';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card
      className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-${color}-500/30 hover:border-${color}-400/50 transition-all duration-300`}
    >
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-slate-400 text-sm'>{title}</p>
            <p className={`text-${color}-400 text-lg font-bold`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${color}-400`} />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export function ContractFullStats() {
  const {
    contractStats,
    globalStats,
    isLoading,
    error,
    refresh,
    lastRefresh,
  } = useContractStats();

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading && !contractStats) {
    return (
      <Card className='bg-slate-800/50 border-slate-700/50'>
        <CardHeader>
          <CardTitle className='text-slate-200'>
            Loading Contract Stats...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className='h-24 bg-slate-700/30 rounded-lg animate-pulse'
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !contractStats) {
    return (
      <Card className='bg-red-900/20 border-red-500/30 p-6'>
        <div className='text-center'>
          <h3 className='text-red-400 font-bold mb-2'>Failed to load stats</h3>
          <p className='text-red-200 mb-4'>{error}</p>
          <Button onClick={handleRefresh} variant='outline' className='border-red-400 text-red-400'>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!contractStats) {
    return (
      <Card className='bg-slate-800/50 border-slate-700/50'>
        <CardHeader>
          <CardTitle className='text-slate-200'>No Data Available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Formatting helpers
  const toEth = (val: string) => {
    try {
      return parseFloat(formatEther(BigInt(val))).toFixed(0);
    } catch {
      return '0';
    }
  };

  const toFloat = (val: string, decimals = 2) => {
    try {
      return parseFloat(formatEther(BigInt(val))).toFixed(decimals);
    } catch {
      return '0';
    }
  };

  const toFloatRaw = (val: string) => parseFloat(val);

  // Time formatters
  const formatDuration = (seconds: string) => {
    const s = parseInt(seconds);
    if (s >= 86400) return `${(s / 86400).toFixed(1)} days`;
    if (s >= 3600) return `${(s / 3600).toFixed(1)} hrs`;
    return `${s} sec`;
  };

  // Core contract data
  const coreStats = [
    {
      title: 'Total CRAA Burned',
      value: `${formatWithCommas(toEth(contractStats.totalCRAABurned))} CRAA`,
      icon: Flame,
      color: 'orange',
    },
    {
      title: 'Total NFTs Burned',
      value: contractStats.totalTokensBurned,
      icon: Activity,
      color: 'red',
    },
    {
      title: 'Active NFTs',
      value: contractStats.nftTotalSupply || '0',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Total Stars',
      value: contractStats.totalStars,
      icon: Sparkles,
      color: 'yellow'
    },
    {
      title: 'Graveyard Size',
      value: contractStats.graveyardSize,
      icon: Users,
      color: 'slate',
    },
  ];

  // Pool stats
  const poolStats = [
    {
      title: 'Monthly Reward Pool',
      value: `${formatWithCommas(toEth(contractStats.currentMonthlyPool))} CRAA`,
      icon: Coins,
      color: 'cyan',
    },
    {
      title: 'Locked Rewards Pool',
      value: `${formatWithCommas(toEth(contractStats.currentLockedPool))} CRAA`,
      icon: Vault,
      color: 'purple',
    },
    {
      title: 'Main Treasury',
      value: `${formatWithCommas(toEth(contractStats.mainTreasury))} CRAA`,
      icon: Shield,
      color: 'emerald',
    },
  ];

  // Configuration stats
  const configStats = [
    {
      title: 'Current Breed Cost',
      value: `${formatWithCommas(toFloat(contractStats.currentBreedCost))} CRAA`,
      icon: Coins,
      color: 'pink',
    },
    {
      title: 'Ping Interval',
      value: formatDuration(contractStats.pingInterval),
      icon: Clock,
      color: 'blue',
    },
    {
      title: 'Manual Floor Price',
      value: `${toFloat(contractStats.manualFloorPrice, 4)} APE`,
      icon: DollarSign,
      color: 'amber',
    },
    {
      title: 'Reward Rate/Second',
      value: `${toFloat(contractStats.rewardRatePerSecond, 6)} CRAA`,
      icon: Zap,
      color: 'green',
    },
    {
      title: 'Breed Cooldown',
      value: formatDuration(contractStats.breedCooldown),
      icon: Target,
      color: 'indigo',
    },
    {
      title: 'Graveyard Cooldown',
      value: formatDuration(contractStats.graveyardCooldown),
      icon: Clock,
      color: 'rose',
    },
    {
      title: 'Burn Fee',
      value: `${(parseFloat(contractStats.burnFeeBps) / 100).toFixed(2)}%`,
      icon: Flame,
      color: 'orange',
    },
    {
      title: 'Monthly Unlock',
      value: `${(parseFloat(contractStats.monthlyUnlockPercentage) / 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: 'teal',
    },
    {
      title: 'Dynamic Rate',
      value: `${toFloat(contractStats.rewardRatePerSecond, 0)} CRAA/sec`,
      icon: Activity,
      color: 'blue',
    },
  ];

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-slate-200 flex items-center'>
          <BarChart3 className='mr-3 h-6 w-6 text-violet-400' />
          Contract Statistics (Global)
        </h2>
        <div className="flex items-center gap-4">
          {/* Auto-refresh indicator */}
          <span className="text-xs text-slate-500">
            Auto-updates every 3m
          </span>
          <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Core Statistics */}
      <section>
        <h3 className='text-lg font-semibold text-slate-300 mb-4 flex items-center'>
          <Activity className='mr-2 h-5 w-5 text-orange-400' />
          Core Statistics
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {coreStats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>
      </section>

      {/* Pool Information */}
      <section>
        <h3 className='text-lg font-semibold text-slate-300 mb-4 flex items-center'>
          <Vault className='mr-2 h-5 w-5 text-cyan-400' />
          Pool Information
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {poolStats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={0.4 + index * 0.1} />
          ))}
        </div>
      </section>

      {/* Game Configuration */}
      <section>
        <h3 className='text-lg font-semibold text-slate-300 mb-4 flex items-center'>
          <Target className='mr-2 h-5 w-5 text-purple-400' />
          Game Configuration
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {configStats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={0.7 + index * 0.1} />
          ))}
        </div>
      </section>

      {/* Data Source Info */}
      <div className='text-center mt-8'>
        <p className='text-slate-400 text-sm'>
          Data sourced from The Graph (CrazyCube Indexer).
          <br />
          Last updated: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'Never'}
        </p>
      </div>
    </div>
  );
}
