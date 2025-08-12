import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import FormData from 'form-data'
import { generateReport } from '../../lib/reports'

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

async function sendReport(reportType: 'Daily' | 'Monthly') {
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('Env misconfigured: DISCORD_WEBHOOK_URL is not set.')
  }

  const timeInMs =
    reportType === 'Daily' ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
  const reportPdf = await generateReport(timeInMs, reportType)
  const form = new FormData()
  form.append('file', reportPdf, {
    filename: `${reportType.toLowerCase()}-report.pdf`,
    contentType: 'application/pdf',
  })

  await axios.post(DISCORD_WEBHOOK_URL, form, {
    headers: form.getHeaders(),
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { reportType } = req.body

    if (reportType !== 'Daily' && reportType !== 'Monthly') {
      return res.status(400).json({ message: 'Invalid reportType' })
    }

    try {
      await sendReport(reportType)
      res
        .status(200)
        .json({ message: `${reportType} summary sent successfully.` })
    } catch (err) {
      console.error(`Error sending ${reportType} summary:`, err)
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
