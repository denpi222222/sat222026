import { apeChain } from './chains';

// ---- Export commonly-used constants (safe on server) ----
export const MAIN_CHAIN_ID = apeChain.id;
export const NFT_CONTRACT_ADDRESS = apeChain.contracts.crazyCubeNFT.address;
export const TOKEN_CONTRACT_ADDRESS = apeChain.contracts.crazyToken.address;
export const GAME_CONTRACT_ADDRESS = apeChain.contracts.gameProxy.address;

// The heavy wagmi + walletconnect setup must run ONLY in the browser:
//   – WalletConnect SDK tries to access IndexedDB which doesn't exist in Node.js
//   – Netlify serverless functions therefore crash with `indexedDB is not defined`
// We lazily build the config when window is available.

// `config` will be assigned only in browser. We keep it typed as `any` so client code can pass it without complaints.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export let config: any;

if (typeof window !== 'undefined') {
  // Dynamic imports for browser-only code
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createConfig, http, fallback } = require('wagmi');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { injected, metaMask, walletConnect } = require('wagmi/connectors');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createPublicClient } = require('viem');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initWagmiClient } = require('@/lib/alchemyKey');

  // Create public client with fallback transports
  const publicClient = createPublicClient({
    chain: apeChain,
    transport: fallback([
      http(apeChain.rpcUrls.default.http[0]),
      http(apeChain.rpcUrls.default.http[1]),
    ]),
  });

  // Initialize the multi-tier system with wagmi client
  initWagmiClient(publicClient);

  // Detect problematic browsers (e.g., Yandex) where multiple extensions may clash
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
  const isYandex = ua.includes('yabrowser') || ua.includes('yandex');
  const enableInjected = (process.env.NEXT_PUBLIC_ENABLE_INJECTED ?? 'false') !== 'false' && !isYandex;

  // Define configuration for Wagmi with fallback transports
  config = createConfig({
    chains: [apeChain],
    // Add a listener to check for chain changes
    onChainChanged: (chain: any) => {
      if (chain.id !== apeChain.id) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('crazycube:toast', {
              detail: {
                title: 'Please switch to ApeChain',
                description: 'Нажмите Switch Network в кошельке',
                variant: 'destructive',
              },
            })
          );
        }
      }
    },
    transports: {
      [apeChain.id]: fallback([
        http(apeChain.rpcUrls.default.http[0]),
        http(apeChain.rpcUrls.default.http[1]),
      ]),
    },
    // Disable persistent storage to prevent auto-reconnect across sessions
    storage: null,
    connectors: [
      // WalletConnect first (works across browsers and mobile)
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        metadata: {
          name: 'CrazyCube',
          description: 'CrazyCube NFT Game',
          url: window.location.origin,
          icons: ['https://crazycube.xyz/favicon.ico'],
        },
        showQrModal: true,
      }),
      // Enable injected connectors only on safe browsers
      ...(enableInjected
        ? [
            metaMask({
              dappMetadata: {
                name: 'CrazyCube',
                url: window.location.origin,
                iconUrl: 'https://crazycube.xyz/favicon.ico',
              },
            }),
            injected({ shimDisconnect: true }),
          ]
        : []),
    ],
    ssr: false,
  });
}
