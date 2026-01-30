// /pages/api/clearKV.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    console.log(
      `[${new Date().toISOString()}] Method ${req.method} Not Allowed`
    )
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  // Authenticate the request using Authorization header
  const authHeader = req.headers['authorization']
  const expectedAuthHeader = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuthHeader) {
    console.log(`[${new Date().toISOString()}] Unauthorized access attempt`)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const clearedKeys: string[] = []

  try {
    // Clear specific known cache keys
    const knownKeys = [
      'contributors:all',
      'stats:all',
      'stats:totalPaid2',
      'projects:all',
    ]

    for (const key of knownKeys) {
      await kv.del(key)
      clearedKeys.push(key)
      console.log(`[${new Date().toISOString()}] Cleared '${key}' KV cache.`)
    }

    // Use pattern matching to find and clear all project-related cache keys (no Webflow dependency)
    const patterns = ['project:*', 'tgb-info-*', 'matching-donors-*']

    for (const pattern of patterns) {
      const keys = await kv.keys(pattern)
      console.log(
        `[${new Date().toISOString()}] Found ${
          keys.length
        } keys matching pattern: ${pattern}`
      )
      for (const key of keys) {
        await kv.del(key)
        clearedKeys.push(key)
        console.log(`[${new Date().toISOString()}] Cleared cache: ${key}`)
      }
    }

    // Note: We don't call res.revalidate() here because:
    // 1. It can cause 404s if Webflow API is temporarily unavailable during revalidation
    // 2. Pages have ISR with revalidate: 600, so they'll regenerate naturally
    // 3. The next request to each page will trigger regeneration with fresh cache
    // 4. This prevents the race condition where cache is cleared but revalidation fails

    console.log(
      `[${new Date().toISOString()}] Cache clearing completed. Cleared ${
        clearedKeys.length
      } keys. Pages will regenerate naturally via ISR on next request.`
    )

    return res.status(200).json({
      message: `Cleared ${clearedKeys.length} cache keys successfully. Pages will regenerate via ISR on next request.`,
      clearedKeysCount: clearedKeys.length,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error(`[${new Date().toISOString()}] Error clearing cache:`, error)
    return res.status(500).json({
      error: 'Failed to clear cache.',
      details: err.message || 'An unexpected error occurred.',
      clearedKeysCount: clearedKeys.length,
    })
  }
}

export default handler
