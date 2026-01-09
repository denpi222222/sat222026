'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Performance mode type: auto uses device detection, others are manual overrides
export type PerformanceMode = 'auto' | 'low' | 'medium' | 'high';

interface PerformanceInfo {
  hardwareConcurrency: number;
  deviceMemory: number;
  connectionSpeed: 'slow' | 'average' | 'fast' | 'unknown';
}

interface PerformanceContextType {
  // Legacy boolean for backwards compatibility
  isLiteMode: boolean;
  setManualLiteMode: (enabled: boolean) => void;
  // New 4-mode system
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
  // Device info
  isMobile: boolean;
  isWeakDevice: boolean;
  performanceInfo: PerformanceInfo;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined
);

// Device detection utilities
const detectSlowDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const connection = (navigator as any).connection;

  // Low memory devices (< 4GB)
  if (memory && memory < 4) return true;

  // Low core count (< 4 cores)
  if (cores && cores < 4) return true;

  // Slow network connection
  if (
    connection &&
    (connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g')
  ) {
    return true;
  }

  return false;
};

const detectMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
};

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [performanceMode, setPerformanceModeState] = useState<PerformanceMode>('auto');
  const [isMobile, setIsMobile] = useState(false);
  const [isWeakDevice, setIsWeakDevice] = useState(false);

  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo>({
    hardwareConcurrency: 0,
    deviceMemory: 0,
    connectionSpeed: 'unknown',
  });

  // Derive isLiteMode from performanceMode
  const isLiteMode = (() => {
    switch (performanceMode) {
      case 'low':
        return true; // Force lite mode
      case 'medium':
        return false; // Medium = slightly reduced but not lite
      case 'high':
        return false; // Full effects
      case 'auto':
      default:
        // Auto: based on device detection
        return isWeakDevice || isMobile;
    }
  })();

  useEffect(() => {
    const mobile = detectMobileDevice();
    const slowDevice = detectSlowDevice();

    setIsMobile(mobile);
    setIsWeakDevice(slowDevice);

    // Load saved mode from localStorage
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('performanceMode') as PerformanceMode | null : null;

    // Check if we have a valid saved mode, otherwise strictly use 'auto'
    if (savedMode && ['auto', 'low', 'medium', 'high'].includes(savedMode)) {
      setPerformanceModeState(savedMode);
    } else {
      setPerformanceModeState('auto');
      if (typeof window !== 'undefined') {
        localStorage.setItem('performanceMode', 'auto');
      }
    }

    // Gather performance info
    const cores =
      typeof navigator !== 'undefined' && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 0;
    const memory =
      typeof navigator !== 'undefined' && (navigator as any).deviceMemory
        ? (navigator as any).deviceMemory
        : 0;
    let connectionSpeed: 'slow' | 'average' | 'fast' | 'unknown' = 'unknown';
    const connection =
      typeof navigator !== 'undefined' && (navigator as any).connection;
    if (connection) {
      if (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g'
      )
        connectionSpeed = 'slow';
      else if (connection.effectiveType === '3g') connectionSpeed = 'average';
      else if (connection.effectiveType === '4g') connectionSpeed = 'fast';
    }

    setPerformanceInfo({
      hardwareConcurrency: cores,
      deviceMemory: memory,
      connectionSpeed,
    });
  }, []);

  // Set performance mode and save to localStorage
  const setPerformanceMode = (mode: PerformanceMode) => {
    setPerformanceModeState(mode);
    localStorage.setItem('performanceMode', mode);
  };

  // Legacy function for backwards compatibility
  const handleSetIsLiteMode = (enabled: boolean) => {
    setPerformanceMode(enabled ? 'low' : 'high');
  };

  return (
    <PerformanceContext.Provider
      value={{
        isLiteMode,
        setManualLiteMode: handleSetIsLiteMode,
        performanceMode,
        setPerformanceMode,
        isMobile,
        isWeakDevice,
        performanceInfo,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error(
      'usePerformanceContext must be used within a PerformanceProvider'
    );
  }
  return context;
}
