// /pages/api/webflow/project.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getProjectBySlug } from '../../../utils/webflow' // Adjust the path to your utility file

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the slug from the query parameters
    const { slug } = req.query

    // Ensure the slug is provided
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Project slug is required' })
    }

    // Fetch the project by slug
    const project = await getProjectBySlug(slug)

    // If the project is not found, return a 404 response
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Respond with the project data
    res.status(200).json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
}
