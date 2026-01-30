// utils/extractIds.ts

/**
 * Extracts the YouTube video ID from a YouTube URL.
 * Supports both 'watch' and 'youtu.be' formats.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} - The extracted video ID or null if not found.
 */
export function extractYouTubeID(url) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname.includes('youtube.com')) {
      return parsedUrl.searchParams.get('v')
    } else if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1) // Remove the leading '/'
    }
    return null
  } catch (error) {
    console.error('Invalid YouTube URL:', url)
    return null
  }
}

/**
 * Extracts the X post ID from an X (Twitter) URL.
 * @param {string} url - The X URL.
 * @returns {string|null} - The extracted post ID or null if not found.
 */
export function extractXPostID(url) {
  try {
    const parsedUrl = new URL(url)
    if (
      parsedUrl.hostname === 'x.com' ||
      parsedUrl.hostname === 'twitter.com'
    ) {
      const paths = parsedUrl.pathname.split('/').filter(Boolean) // Remove empty segments
      const statusIndex = paths.findIndex((segment) => segment === 'status')
      if (statusIndex !== -1 && paths.length > statusIndex + 1) {
        return paths[statusIndex + 1]
      }
    }
    return null
  } catch (error) {
    console.error('Invalid X (Twitter) URL:', url)
    return null
  }
}
