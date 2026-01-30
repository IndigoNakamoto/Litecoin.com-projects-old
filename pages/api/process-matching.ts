// pages/api/process-matching.js

import { processDonationMatching } from '../../services/matching'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await processDonationMatching()
      res.status(200).json({ message: 'Matching process completed.' })
    } catch (error) {
      console.error('Error processing matching donations:', error)
      res.status(500).json({ message: 'Internal Server Error.' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed.' })
  }
}
