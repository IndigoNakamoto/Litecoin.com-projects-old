// /pages/api/clearKV.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { getAllProjects } from '../../utils/webflow'

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

  try {
    // Clear the contributors cache
    await kv.del('contributors:all')
    console.log(
      `[${new Date().toISOString()}] Cleared 'contributors:all' KV cache.`
    )

    // Clear the stats cache
    await kv.del('stats:all')
    console.log(`[${new Date().toISOString()}] Cleared 'stats:all' KV cache.`)
    await kv.del('stats:totalPaid2')
    console.log(
      `[${new Date().toISOString()}] Cleared 'stats:totalPaid2' KV cache.`
    )
    await kv.del('projects:all')
    console.log(
      `[${new Date().toISOString()}] Cleared 'projects:all' KV cache.`
    )

    // Revalidate all project pages and clear individual project caches
    const projects = await getAllProjects()
    if (projects && projects.length > 0) {
      for (const project of projects) {
        const slug = project.fieldData.slug
        if (slug) {
          // Clear the individual project cache
          const cacheKey = `project:${slug}2`
          await kv.del(cacheKey)
          console.log(
            `[${new Date().toISOString()}] Cleared project cache: ${cacheKey}`
          )

          // Revalidate the project page
          await res.revalidate(`/projects/${slug}`)
          console.log(
            `[${new Date().toISOString()}] Revalidated project: ${slug}`
          )
        }
      }
    }

    console.log(
      `[${new Date().toISOString()}] All caches cleared and pages revalidated successfully.`
    )
    return res.status(200).json({
      message: 'All caches cleared and pages revalidated successfully.',
    })
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}] Error clearing cache and revalidating:`,
      error
    )
    return res.status(500).json({
      error: 'Failed to clear cache and revalidate.',
      details: error.message || 'An unexpected error occurred.',
    })
  }
}

export default handler
