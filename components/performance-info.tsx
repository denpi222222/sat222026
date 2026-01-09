'use client';

import { usePerformanceContext, PerformanceMode } from '@/hooks/use-performance-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Smartphone,
  Monitor,
  Zap,
  ZapOff,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Settings2,
} from 'lucide-react';

const MODE_CONFIG: Record<PerformanceMode, { label: string; color: string; description: string }> = {
  auto: { label: 'Auto', color: 'bg-gray-600', description: 'System decides based on device' },
  low: { label: 'Low', color: 'bg-orange-500', description: 'Minimal effects for weak devices' },
  medium: { label: 'Medium', color: 'bg-yellow-500', description: 'Balanced performance' },
  high: { label: 'High', color: 'bg-green-500', description: 'Full effects' },
};

export const PerformanceInfo = () => {
  const {
    isLiteMode,
    isMobile,
    isWeakDevice,
    performanceInfo,
    performanceMode,
    setPerformanceMode,
  } = usePerformanceContext();
  const { hardwareConcurrency, deviceMemory, connectionSpeed } = performanceInfo;

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className='w-4 h-4' />;
    return <Monitor className='w-4 h-4' />;
  };

  const getConnectionIcon = () => {
    if (connectionSpeed === 'slow')
      return <WifiOff className='w-4 h-4 text-red-400' />;
    if (connectionSpeed === 'fast')
      return <Wifi className='w-4 h-4 text-green-400' />;
    return <Wifi className='w-4 h-4 text-gray-400' />;
  };

  const currentModeConfig = MODE_CONFIG[performanceMode];

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          <Settings2 className='w-5 h-5' />
          Performance Status
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Mode Selector - 4 buttons */}
        <div className='space-y-2'>
          <span className='text-sm text-gray-400'>Mode:</span>
          <div className='grid grid-cols-4 gap-1'>
            {(Object.keys(MODE_CONFIG) as PerformanceMode[]).map((mode) => {
              const config = MODE_CONFIG[mode];
              const isActive = performanceMode === mode;
              return (
                <Button
                  key={mode}
                  variant={isActive ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setPerformanceMode(mode)}
                  className={`text-xs px-2 py-1 h-8 ${isActive
                      ? `${config.color} text-white hover:opacity-90`
                      : 'hover:bg-slate-700'
                    }`}
                >
                  {config.label}
                </Button>
              );
            })}
          </div>
          <p className='text-xs text-gray-500'>{currentModeConfig.description}</p>
        </div>

        {/* Current Effect Status */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-400'>Effects:</span>
          <Badge className={isLiteMode ? 'bg-orange-500' : 'bg-blue-500'}>
            {isLiteMode ? (
              <><ZapOff className='w-3 h-3 mr-1' />Lite</>
            ) : (
              <><Zap className='w-3 h-3 mr-1' />Full</>
            )}
          </Badge>
        </div>

        {/* Device Type */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-400'>Device:</span>
          <div className='flex items-center gap-2'>
            {getDeviceIcon()}
            <span className='text-sm'>{isMobile ? 'Mobile' : 'Desktop'}</span>
          </div>
        </div>

        {/* Performance Level */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-400'>Performance:</span>
          <Badge variant={isWeakDevice ? 'destructive' : 'default'}>
            {isWeakDevice ? 'Weak Device' : 'Strong Device'}
          </Badge>
        </div>

        {/* Hardware Info */}
        {hardwareConcurrency > 0 && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-400'>CPU:</span>
            <div className='flex items-center gap-2'>
              <Cpu className='w-4 h-4' />
              <span className='text-sm'>{hardwareConcurrency} cores</span>
            </div>
          </div>
        )}

        {deviceMemory > 0 && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-400'>RAM:</span>
            <div className='flex items-center gap-2'>
              <HardDrive className='w-4 h-4' />
              <span className='text-sm'>{deviceMemory}GB</span>
            </div>
          </div>
        )}

        {/* Connection */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-400'>Connection:</span>
          <div className='flex items-center gap-2'>
            {getConnectionIcon()}
            <span className='text-sm capitalize'>
              {connectionSpeed === 'unknown' ? 'Unknown' : connectionSpeed}
            </span>
          </div>
        </div>

        {/* Auto-detection notice */}
        {performanceMode === 'auto' && isLiteMode && (
          <div className='mt-4 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md'>
            <p className='text-xs text-orange-700 dark:text-orange-300'>
              Lite mode automatically enabled for better performance on this
              device.
            </p>
          </div>
        )}

        {/* Manual override notice */}
        {performanceMode !== 'auto' && (
          <div className='mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md'>
            <p className='text-xs text-blue-700 dark:text-blue-300'>
              Manual mode override active. Select "Auto" to use device detection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
