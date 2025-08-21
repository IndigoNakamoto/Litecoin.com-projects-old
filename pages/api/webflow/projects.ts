// /pages/api/webflow/projects.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllProjects } from '../../../utils/webflow'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch projects
    const projects = await getAllProjects()

    // Filter out projects if isDraft is true (Note: Your original code did not filter isArchived)
    const filteredProjects = projects.filter((project) => !project.isDraft)

    // Respond with the filtered projects data (ONLY ONCE)
    res.status(200).json({ projects: filteredProjects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
