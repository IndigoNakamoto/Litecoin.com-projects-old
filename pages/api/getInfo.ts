// /pages/api/getInfo.ts

import { NextApiRequest, NextApiResponse } from 'next/types'
import { fetchGetJSONAuthed } from '../../utils/api-helpers'

function filterByOrderId(items, targetOrderId) {
  return items.filter(
    (item) =>
      item.metadata &&
      item.metadata.posData &&
      item.metadata.posData.orderId === targetOrderId
  )
}

function getTwitterSupporters(items) {
  return items.map((item) => item.metadata.posData.buyerTwitter)
}

function sumAmounts(items) {
  // TODO: Fix amount for overpaid invoices
  // console.log('sumAmounts for these items (Todo: Fix amount for overpaid):')
  items.forEach((item) => console.log(item))
  return items.reduce((acc, item) => acc + Number(item.amount), 0)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const slug = req.query.slug as string
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' })
    }

    const username = process.env.BTCPAY_USERNAME
    const password = process.env.BTCPAY_PASSWORD

    const base64Credentials = Buffer.from(username + ':' + password).toString(
      'base64'
    )

    const auth = `Basic ${base64Credentials}`

    try {
      const response = await fetchGetJSONAuthed(
        `${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices?status=Settled&status=Processing`,
        auth
      )

      const filteredInvoices = filterByOrderId(response, slug)
      const donatedCreatedTime = filteredInvoices.map((invoice) => {
        return { amount: invoice.amount, createdTime: invoice.createdTime }
      })
      const totalAmount = sumAmounts(filteredInvoices)
      const twitterSupporters = getTwitterSupporters(filteredInvoices)

      res.status(200).json({
        funded_txo_sum: totalAmount,
        tx_count: Object.keys(filteredInvoices).length,
        supporters: twitterSupporters,
        donatedCreatedTime: donatedCreatedTime,
      })
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
  }
}
