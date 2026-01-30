import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import FormData from 'form-data'
import { generateReport } from '../../../lib/reports'

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('Env misconfigured: DISCORD_WEBHOOK_URL is not set.')
    }

    try {
      const reportPdf = await generateReport(
        30 * 24 * 60 * 60 * 1000,
        'Monthly'
      )
      const form = new FormData()
      form.append('file', reportPdf, {
        filename: 'monthly-report.pdf',
        contentType: 'application/pdf',
      })

      await axios.post(DISCORD_WEBHOOK_URL, form, {
        headers: form.getHeaders(),
      })

      res.status(200).json({ message: 'Monthly summary sent successfully.' })
    } catch (err) {
      console.error('Error sending monthly summary:', err)
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
