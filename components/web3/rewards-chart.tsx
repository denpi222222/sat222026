'use client';

import { useState, useEffect } from 'react';
import { ChartCard } from './chart-card';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const DENIS_3_ENDPOINT =
  'https://api.studio.thegraph.com/query/111010/denis-3/v0.0.3';

interface DailyReward {
  date: string;
  amount: number;
}

export function RewardsChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DailyReward[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRewardsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Query for recent reward claims from subgraph
        const query = `
          query {
            rewardClaims(first: 200, orderBy: timestamp, orderDirection: desc) {
              id
              amount
              timestamp
            }
            contractStats(id: "contract") {
              totalCRADistributed
            }
          }
        `;

        const response = await fetch(DENIS_3_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        const claims = result.data?.rewardClaims || [];

        // Generate last 7 days
        const dailyMap = new Map<string, number>();
        const now = Date.now();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now - i * 86400000).toISOString().slice(0, 10);
          dailyMap.set(date, 0);
        }

        // Aggregate claims by day
        for (const claim of claims) {
          const ts = parseInt(claim.timestamp) * 1000;
          const date = new Date(ts).toISOString().slice(0, 10);
          if (dailyMap.has(date)) {
            const amount = parseFloat(claim.amount) / 1e18;
            dailyMap.set(date, (dailyMap.get(date) || 0) + amount);
          }
        }

        // Convert to array
        const dailyData: DailyReward[] = Array.from(dailyMap.entries()).map(
          ([date, amount]) => ({ date, amount })
        );

        if (mounted) {
          setData(dailyData);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load');
          // Fallback to empty data
          const fallback: DailyReward[] = [];
          const now = Date.now();
          for (let i = 6; i >= 0; i--) {
            fallback.push({
              date: new Date(now - i * 86400000).toISOString().slice(0, 10),
              amount: 0,
            });
          }
          setData(fallback);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRewardsData();
    const interval = setInterval(fetchRewardsData, 120000); // Refresh every 2 mins

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle empty data or loading state
  if (data.length === 0) {
    return (
      <ChartCard
        title='Rewards Distribution'
        icon={<TrendingUp className='h-5 w-5' />}
        color='green'
        loading={isLoading}
      >
        <div className='h-64 flex items-center justify-center text-slate-400'>
          No rewards data available
        </div>
      </ChartCard>
    );
  }

  // Find max and min values for scaling (with safety for division by zero)
  const amounts = data.map(item => item.amount);
  const maxValue = Math.max(...amounts, 1); // Ensure at least 1 to avoid division issues
  const minValue = Math.min(...amounts, 0);
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Create points for the line chart
  const points = data
    .map((item, index) => {
      const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
      const y = 100 - ((item.amount - minValue) / range) * 100;
      return `${x},${isNaN(y) ? 50 : y}`;
    })
    .join(' ');


  return (
    <ChartCard
      title='Rewards Distribution'
      icon={<TrendingUp className='h-5 w-5' />}
      color='green'
      loading={isLoading}
    >
      <div className='h-64 relative'>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(percent => (
          <div
            key={`grid-${percent}`}
            className='absolute w-full border-t border-slate-700/30'
            style={{ top: `${percent}%` }}
          ></div>
        ))}

        {/* Chart line */}
        <svg
          className='absolute inset-0 w-full h-full'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
        >
          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id='gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#10b981' stopOpacity='0.5' />
              <stop offset='100%' stopColor='#10b981' stopOpacity='0' />
            </linearGradient>
          </defs>

          {/* Area fill under the line */}
          <motion.path
            d={`M0,100 L${points} L100,100 Z`}
            fill='url(#gradient)'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Chart line */}
          <motion.polyline
            points={points}
            fill='none'
            stroke='#10b981'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Data points on chart */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y =
              100 - ((item.amount - minValue) / (maxValue - minValue)) * 100;
            return (
              <motion.circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r='1.5'
                fill='#10b981'
                stroke='#0f172a'
                strokeWidth='1'
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Value labels */}
        <div className='absolute right-0 inset-y-0 flex flex-col justify-between text-xs text-slate-400 pr-2'>
          <div>{formatNumber(maxValue)}</div>
          <div>{formatNumber((maxValue + minValue) / 2)}</div>
          <div>{formatNumber(minValue)}</div>
        </div>
      </div>

      {/* Date labels */}
      <div className='flex justify-between mt-2'>
        {data.map((item, index) => (
          <div key={`date-${index}`} className='text-xs text-slate-400'>
            {new Date(item.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// Helper to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
