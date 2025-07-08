import { NextApiRequest, NextApiResponse } from 'next/types'
import { Octokit } from '@octokit/rest'
import axios from 'axios'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_APP_REPO = process.env.GH_APP_REPO
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_APP_REPO || !DISCORD_WEBHOOK_URL) {
      throw new Error('Env misconfigured')
    }

    // Log incoming request data for debugging
    // console.log('Received Data:', req.body)

    // Extract structured data from request body
    const {
      project_overview: {
        project_name = 'No project name provided',
        project_description = 'No description provided',
        main_focus = 'other',
        potential_impact = 'No impact information provided',
        project_repository = 'No repository provided',
        social_media_links = '',
        open_source = 'null', // Changed default to 'null'
        open_source_license = '', // Added open_source_license
        partially_open_source = '', // Added partially_open_source
      },
      project_budget: {
        proposed_budget = 'No budget provided',
        received_funding = false,
        prior_funding_details = '',
      },
      applicant_information: {
        your_name = 'Anonymous',
        email = 'No email provided',
        is_lead_contributor = true,
        other_lead = '',
        personal_github = '',
        other_contact_details = '',
        prior_contributions = 'No prior contributions provided',
        references = 'No references provided',
      },
    } = req.body

    const byOrFor = received_funding ? 'for' : 'by'
    const issueTitle = `${project_name} ${byOrFor} ${your_name}`

    // Create the issue body with the restructured data
    const issueBody = `
# Project Submission

## Project Overview

**Project Name:** ${project_name}

**Description:** ${project_description}

**Main Focus:** ${main_focus}

**Potential Impact:** ${potential_impact}

**Repository:** ${project_repository}

**Social Media Links:** ${social_media_links}

**Open Source:** ${
      open_source === 'yes' ? 'Yes' : open_source === 'no' ? 'No' : 'Partially'
    }

${
  open_source === 'yes' ? `**Open Source License:** ${open_source_license}` : ''
}
${
  open_source === 'partially'
    ? `**Partially Open Source:** ${partially_open_source}`
    : ''
}

## Project Budget

**Proposed Budget:** ${proposed_budget}

**Prior Funding:** ${received_funding ? 'Yes' : 'No'}

**Funding Details:** ${prior_funding_details}

## Applicant Information

**Your Name:** ${your_name}

**Email:** ${email}

**Lead Contributor:** ${is_lead_contributor ? 'Yes' : 'No'}

**Other Lead Contributor:** ${other_lead}

**Personal GitHub:** ${personal_github}

**Other Contact Details:** ${other_contact_details}

**Prior Contributions:** ${prior_contributions}

**References:** ${references}
    `

    // Label set according to "main focus"
    const lowerCaseFocus = main_focus.toLowerCase()
    const issueLabels = [lowerCaseFocus]
    if (lowerCaseFocus === 'lightning') {
      issueLabels.push('litecoin') // LN = subset of Litecoin
    }

    // Additional tags based on yes/no answers
    if (received_funding) issueLabels.push('prior funding')
    if (open_source === 'no') issueLabels.push('not FLOSS')
    if (!is_lead_contributor) issueLabels.push('surrogate')

    try {
      const { data: issue } = await octokit.rest.issues.create({
        owner: GH_ORG,
        repo: GH_APP_REPO,
        title: issueTitle,
        body: issueBody,
        labels: issueLabels,
      })

      await axios.post(DISCORD_WEBHOOK_URL, {
        content: `New project submission: **${project_name}**\n${issue.html_url}`,
      })

      res.status(200).json({ message: 'success' })
    } catch (err) {
      console.error('Error creating issue:', err)
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
