/**
 * NFT Local Images Utility
 * Provides local images from /public/nft/ for instant loading
 * Fallback to IPFS only if local image not available
 */

/**
 * Get local NFT image path
 * @param tokenId - Token ID (can be number, string, or hex)
 * @returns Local image path like /nft/0023.webp
 */
export function getLocalNFTImage(tokenId: string | number | bigint): string {
  try {
    // Convert tokenId to number
    let id: number;
    
    if (typeof tokenId === 'bigint') {
      id = Number(tokenId);
    } else if (typeof tokenId === 'string') {
      // Handle hex format (0x... or plain hex)
      if (tokenId.startsWith('0x')) {
        id = parseInt(tokenId, 16);
      } else if (/^[0-9a-fA-F]+$/.test(tokenId) && tokenId.length > 10) {
        // Looks like unprefixed hex
        id = parseInt(tokenId, 16);
      } else {
        // Plain decimal string
        id = parseInt(tokenId, 10);
      }
    } else {
      id = tokenId;
    }
    
    // Validate range (1-5000 available)
    if (isNaN(id) || id < 1 || id > 5000) {
      return '/favicon.ico'; // Fallback for out of range
    }
    
    // Format with leading zeros: 23 → "0023"
    const paddedId = id.toString().padStart(4, '0');
    
    // Return local path: /nft/0023.webp
    return `/nft/${paddedId}.webp`;
    
  } catch (error) {
    // Safe fallback on any error
    if (process.env.NODE_ENV === 'development') {
      console.warn('getLocalNFTImage error:', error);
    }
    return '/favicon.ico';
  }
}

/**
 * Check if local NFT image exists in range
 * @param tokenId - Token ID
 * @returns true if image should exist locally (1-5000)
 */
export function hasLocalNFTImage(tokenId: string | number | bigint): boolean {
  try {
    let id: number;
    
    if (typeof tokenId === 'bigint') {
      id = Number(tokenId);
    } else if (typeof tokenId === 'string') {
      if (tokenId.startsWith('0x')) {
        id = parseInt(tokenId, 16);
      } else if (/^[0-9a-fA-F]+$/.test(tokenId) && tokenId.length > 10) {
        id = parseInt(tokenId, 16);
      } else {
        id = parseInt(tokenId, 10);
      }
    } else {
      id = tokenId;
    }
    
    return !isNaN(id) && id >= 1 && id <= 5000;
    
  } catch {
    return false;
  }
}

/**
 * Extract numeric token ID from various formats
 * @param nft - NFT object from any source
 * @returns Decimal token ID as string
 */
export function extractTokenId(nft: any): string {
  try {
    // Try name field first (e.g., "CrazyCube #3430")
    const nameField = nft?.metadata?.name || nft?.title || nft?.name || '';
    const nameMatch = nameField.match(/#(\d+)/);
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1];
    }
    
    // Try tokenId field
    if (nft?.tokenId) {
      if (typeof nft.tokenId === 'string') {
        if (nft.tokenId.startsWith('0x')) {
          return BigInt(nft.tokenId).toString();
        }
        return nft.tokenId;
      }
      return String(nft.tokenId);
    }
    
    // Try id.tokenId (Alchemy format)
    if (nft?.id?.tokenId) {
      if (typeof nft.id.tokenId === 'string') {
        if (nft.id.tokenId.startsWith('0x')) {
          return BigInt(nft.id.tokenId).toString();
        }
        return nft.id.tokenId;
      }
      return String(nft.id.tokenId);
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Get NFT image with automatic fallback
 * Priority: Local → IPFS → Fallback
 * @param nft - NFT object
 * @param ipfsUrl - Optional IPFS URL for fallback
 * @returns Image URL
 */
export function getNFTImageWithFallback(nft: any, ipfsUrl?: string): string {
  try {
    // Extract token ID
    const tokenId = extractTokenId(nft);
    
    if (!tokenId) {
      return ipfsUrl || '/favicon.ico';
    }
    
    // Try local image first (PRIORITY)
    const localImage = getLocalNFTImage(tokenId);
    if (localImage !== '/favicon.ico') {
      return localImage; // ✅ Use local (instant loading)
    }
    
    // Fallback to IPFS if provided
    if (ipfsUrl) {
      return ipfsUrl;
    }
    
    // Last resort
    return '/favicon.ico';
    
  } catch {
    return ipfsUrl || '/favicon.ico';
  }
}
