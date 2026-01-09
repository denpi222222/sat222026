// Safe external link opener with tabnabbing protection
const ALLOWED_HOSTS = new Set([
  'app.camelot.exchange',
  'camelot.exchange',
  'dexscreener.com',
  'apechain.com',
  'opensea.io',
  'magiceden.io',
  'ipfs.io',
  'gateway.pinata.cloud',
  'cloudflare-ipfs.com',
  'dweb.link',
  'ipfs.dweb.link',
  'nftstorage.link',
  'alchemy.com',
  'walletconnect.com',
  'walletconnect.org',
  'metamask.io',
  'rainbow.me',
  'coinbase.com',
  'trustwallet.com',
  'infura.io',
  'quicknode.com',
  'web3modal.org',
  'pulse.walletconnect.org',
  'cloud.reown.com',
  'google.com',
  'gstatic.com',
  'jsdelivr.net',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
]);

// Validate URL and check if it's allowed
export function validateAndSanitizeUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    
    // Check if hostname is allowed
    const isAllowed = ALLOWED_HOSTS.has(url.hostname) || 
                     ALLOWED_HOSTS.has(url.hostname.replace(/^www\./, '')) ||
                     url.hostname.endsWith('.dexscreener.com') ||
                     url.hostname.endsWith('.ipfs.io') ||
                     url.hostname.endsWith('.ipfs.dweb.link') ||
                     url.hostname.endsWith('.gateway.pinata.cloud') ||
                     url.hostname.endsWith('.cloudflare-ipfs.com') ||
                     url.hostname.endsWith('.dweb.link') ||
                     url.hostname.endsWith('.nftstorage.link') ||
                     url.hostname.endsWith('.alchemy.com') ||
                     url.hostname.endsWith('.walletconnect.com') ||
                     url.hostname.endsWith('.walletconnect.org') ||
                     url.hostname.endsWith('.metamask.io') ||
                     url.hostname.endsWith('.rainbow.me') ||
                     url.hostname.endsWith('.coinbase.com') ||
                     url.hostname.endsWith('.trustwallet.com') ||
                     url.hostname.endsWith('.infura.io') ||
                     url.hostname.endsWith('.quicknode.com') ||
                     url.hostname.endsWith('.web3modal.org') ||
                     url.hostname.endsWith('.pulse.walletconnect.org') ||
                     url.hostname.endsWith('.cloud.reown.com') ||
                     url.hostname.endsWith('.google.com') ||
                     url.hostname.endsWith('.gstatic.com') ||
                     url.hostname.endsWith('.jsdelivr.net') ||
                     url.hostname.endsWith('.unpkg.com') ||
                     url.hostname.endsWith('.fonts.googleapis.com') ||
                     url.hostname.endsWith('.fonts.gstatic.com') ||
                     url.hostname.endsWith('.cdn.jsdelivr.net');

    if (!isAllowed) {
      // Удаляем console.error для production безопасности
      // console.error('Blocked external link - unauthorized host:', url.hostname);
      return null;
    }

    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      // Удаляем console.error для production безопасности
      // console.error('Blocked external link - non-HTTPS protocol:', url.protocol);
      return null;
    }

    // Sanitize URL to prevent injection attacks
    const sanitizedUrl = url.toString()
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+=/gi, '');

    return sanitizedUrl;
  } catch (error) {
    // Удаляем console.error для production безопасности
    // console.error('Invalid URL format:', rawUrl, error);
    return null;
  }
}

// Safe external link opener with tabnabbing protection
export function safeOpen(rawUrl: string): boolean {
  try {
    const sanitizedUrl = validateAndSanitizeUrl(rawUrl);
    
    if (!sanitizedUrl) {
      // Удаляем console.error для production безопасности
      // console.error('Blocked external link - validation failed:', rawUrl);
      return false;
    }

    // Open with security attributes to prevent tabnabbing
    const newWindow = window.open(
      sanitizedUrl, 
      '_blank', 
      'noopener,noreferrer,noindex,nofollow'
    );

    if (!newWindow) {
      // Удаляем console.error для production безопасности
      // console.error('Failed to open external link - popup blocked');
      return false;
    }

    // Additional security: nullify opener reference
    newWindow.opener = null;
    
  } catch (error) {
    // Удаляем console.error для production безопасности
    // console.error('Error opening external link:', error);
    return false;
  }
  return true;
}

// Safe redirect function
export function safeRedirect(url: string): boolean {
  try {
    const sanitizedUrl = validateAndSanitizeUrl(url);
    
    if (!sanitizedUrl) {
      // Удаляем console.error для production безопасности
      // console.error('Blocked redirect - validation failed:', url);
      return false;
    }

    // Use location.replace for redirects
    window.location.replace(sanitizedUrl);
    return true;
  } catch (error) {
    // Удаляем console.error для production безопасности
    // console.error('Error redirecting:', error);
    return false;
  }
}

// Safe navigation function for internal links
export function safeNavigate(path: string): boolean {
  try {
    // Validate internal path
    if (!path || typeof path !== 'string') {
      // Удаляем console.error для production безопасности
      // console.error('Invalid navigation path:', path);
      return false;
    }

    // Prevent path traversal attacks
    if (path.includes('..') || path.includes('//')) {
      // Удаляем console.error для production безопасности
      // console.error('Blocked navigation - path traversal detected:', path);
      return false;
    }

    // Ensure path starts with /
    const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Use Next.js router or window.location for navigation
    if (typeof window !== 'undefined') {
      window.location.href = sanitizedPath;
    }
    
    return true;
  } catch (error) {
    // Удаляем console.error для production безопасности
    // console.error('Error navigating:', error);
    return false;
  }
}

// Export validation function for external use
export { validateAndSanitizeUrl as validateUrl }; 