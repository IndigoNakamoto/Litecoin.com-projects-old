// utils/imageLoader.ts

// Check if we're on litecoin.com (the only domain where Cloudflare optimization works)
// Cloudflare has hotlink protection that blocks requests from other domains
const isOnLitecoinDomain =
  typeof window !== 'undefined'
    ? window.location.hostname.includes('litecoin.com')
    : process.env.VERCEL_URL?.includes('litecoin.com') || false

/**
 * Optimizes Webflow CDN URLs by routing them through Cloudflare image optimization
 * Only applies in production - in development, returns original URLs to avoid 403 errors
 * @param url - The image URL to optimize
 * @param width - Optional width parameter
 * @param quality - Optional quality parameter
 * @returns The optimized URL if it's from Webflow CDN and in production, otherwise the original URL
 */
export const optimizeWebflowImageUrl = (
  url: string,
  width?: number,
  quality?: number
): string => {
  if (!url || typeof url !== 'string') {
    return url
  }

  // Check if the URL is from Webflow's CDN
  if (url.includes('cdn.prod.website-files.com')) {
    // Only use Cloudflare optimization on litecoin.com
    // Cloudflare blocks requests from other domains due to hotlink protection
    if (!isOnLitecoinDomain) {
      return url
    }

    // Remove any existing query parameters from the source URL
    const [baseUrl] = url.split('?')

    // Build Cloudflare image optimization parameters
    const cloudflareParams = [
      'format=avif',
      `quality=${quality || 80}`,
      width ? `width=${width}` : null,
    ]
      .filter(Boolean)
      .join(',')

    // Cloudflare requires the nested URL to be URL-encoded
    const encodedUrl = encodeURIComponent(baseUrl)

    return `https://litecoin.com/cdn-cgi/image/${cloudflareParams}/${encodedUrl}`
  }

  return url
}

export const customImageLoader = ({ src, width, quality }) => {
  // Optimize Webflow URLs through Cloudflare (only in production)
  const optimizedSrc = optimizeWebflowImageUrl(src, width, quality)

  // For non-Webflow URLs or not on litecoin.com, add Next.js query parameters
  if (!src.includes('cdn.prod.website-files.com') || !isOnLitecoinDomain) {
    return `${optimizedSrc}?w=${width}&q=${quality || 75}`
  }

  return optimizedSrc
}
