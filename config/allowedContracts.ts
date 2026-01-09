// Normalize to lowercase, because callers compare using .toLowerCase()
// Security: restrict on-chain interactions strictly to this allowlist
const RAW_ALLOWED = [
  '0x606a47707d5aEdaE9f616A6f1853fE3075bA740B', // CrazyCube NFT
  '0xBb526D657Cc1Ba772469A6EC96AcB2ed9D2A93e5', // CRAA Token
  '0x7dFb75F1000039D650A4C2B8a068f53090e857dD', // Game Proxy
] as const;

export const ALLOWED_CONTRACTS = new Set<`0x${string}`>(
  (RAW_ALLOWED as readonly string[]).map(
    addr => addr.toLowerCase() as `0x${string}`
  )
);
