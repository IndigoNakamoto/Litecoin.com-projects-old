// pages/api/webflow/project-posts.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getPostsByProjectIdLocal } from '../../../utils/webflow'

/**
 * Replaces the comment section. Returns X, Reddit, and YouTube links.
 *
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the slug from the query parameters
    const { projectId } = req.query

    // Ensure the projectId is provided
    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Project projectId is required' })
    }

    // Fetch the project by projectId
    const project = await getPostsByProjectIdLocal(projectId)

    // If the project is not found, return a 404 response
    if (!project) {
      return res
        .status(404)
        .json({ error: `Project of projectId(${projectId}) not found` })
    }

    // Respond with the project data
    res.status(200).json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
}
