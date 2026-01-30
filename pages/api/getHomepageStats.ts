// pages/api/getHomepageStats.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { kv } from '@vercel/kv'

type HomepageStats = {
  numberOfDailyTransactions: number
  usdValuePerDay: number
  networkSecurity: number
  dailyAddresses: number
  median_transaction_fee_usd_24h: number
}

const BLOCKCHAIR_STATS_URL = 'https://api.blockchair.com/litecoin/stats'
const LITECOINSPACE_API = 'https://litecoinspace.org/api'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const TOTAL_BLOCKS_NEEDED = 576

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HomepageStats | { error: string }>
) {
  try {
    const homepageStats = await fetchHomepageStats()
    res.status(200).json(homepageStats)
  } catch (error) {
    console.error('Error in getHomepageStats handler:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const fetchHomepageStats = async (): Promise<HomepageStats> => {
  const cacheKey = 'homepageStats_blockchair_litecoinspace_chunks'
  const cachedStats = await kv.get<HomepageStats>(cacheKey)

  if (cachedStats !== null && cachedStats !== undefined) {
    console.log('Using cached homepage stats.')
    return cachedStats
  }

  try {
    const response = await fetch(BLOCKCHAIR_STATS_URL)
    if (!response.ok)
      throw new Error(`Blockchair API error: ${response.statusText}`)
    const blockchairData = await response.json()
    if (!blockchairData || !blockchairData.data)
      throw new Error('Invalid data from Blockchair API')

    const data = blockchairData.data
    const numberOfDailyTransactions = data.transactions_24h
    const marketPriceUsd = data.market_price_usd
    const median_transaction_fee_usd_24h = data.median_transaction_fee_usd_24h
    const volume24h = data.volume_24h

    console.log('Fetched Blockchair stats:')
    console.log(`- Transactions (24h): ${numberOfDailyTransactions}`)
    console.log(`- Volume (24h) in satoshis: ${volume24h}`)
    console.log(`- Market Price (USD): ${marketPriceUsd}`)
    console.log(
      `- Median Transaction Fee (USD, 24h): ${median_transaction_fee_usd_24h}`
    )

    const mwebHogExVolume = await calculateMwebHogExVolume()

    console.log(`Calculated MWEB HogEx Volume (satoshis): ${mwebHogExVolume}`)

    const adjustedVolume24h = volume24h - mwebHogExVolume
    const totalLtcTransferred = adjustedVolume24h / 1e8
    const usdValuePerDay = totalLtcTransferred * marketPriceUsd

    console.log(
      `Adjusted Volume (24h) after MWEB removal (satoshis): ${adjustedVolume24h}`
    )
    console.log(`Total LTC Transferred (24h): ${totalLtcTransferred} LTC`)
    console.log(
      `USD Value Per Day after adjustment: $${usdValuePerDay.toFixed(2)}`
    )

    const hashrate24h = parseFloat(data.hashrate_24h) / 1e15
    const dailyAddresses = data.hodling_addresses

    const homepageStats: HomepageStats = {
      numberOfDailyTransactions,
      usdValuePerDay,
      networkSecurity: hashrate24h,
      dailyAddresses,
      median_transaction_fee_usd_24h,
    }

    await kv.set(cacheKey, homepageStats, { ex: 300 })
    console.log('Homepage stats cached successfully.')

    return homepageStats
  } catch (error) {
    console.error('Error fetching homepage stats:', error)
    throw new Error('Failed to fetch homepage stats')
  }
}

const calculateMwebHogExVolume = async (): Promise<number> => {
  try {
    console.log(
      `Fetching ${TOTAL_BLOCKS_NEEDED} recent blocks from litecoinspace in chunks of 10...`
    )
    const allBlocks = await fetchRecentBlocksInChunks()
    console.log(`Total blocks fetched: ${allBlocks.length}`)

    const now = Date.now()
    const twentyFourHoursAgo = now - ONE_DAY_MS
    const recentBlocks = allBlocks.filter(
      (b) => b.timestamp * 1000 >= twentyFourHoursAgo
    )
    console.log(`Blocks within the last 24 hours: ${recentBlocks.length}`)

    let mwebVolume = 0
    let processedBlockCount = 0

    for (const block of recentBlocks) {
      processedBlockCount++
      const transactions = await fetchBlockTransactions(block.hash)
      if (!transactions || transactions.length === 0) {
        console.warn(`No transactions found in block ${block.hash}.`)
        continue
      }

      const lastTransaction = transactions[transactions.length - 1]
      const txDetails = await fetchTransaction(lastTransaction.txid)
      const txValue = sumTransactionOutputs(txDetails)

      console.log(
        `Block #${processedBlockCount}/${recentBlocks.length}: ${block.hash}`
      )
      console.log(
        `Last transaction: ${lastTransaction.txid}, Value: ${txValue} satoshis`
      )

      mwebVolume += txValue
    }

    console.log(
      `Processed ${processedBlockCount} blocks for MWEB HogEx calculation.`
    )
    console.log(
      `Total MWEB HogEx Volume (satoshis) over last 24 hours: ${mwebVolume}`
    )
    return mwebVolume
  } catch (error) {
    console.error('Error calculating MWEB HogEx volume:', error)
    return 0
  }
}

async function fetchRecentBlocksInChunks(): Promise<any[]> {
  const tipRes = await fetch(`${LITECOINSPACE_API}/v1/blocks`)
  if (!tipRes.ok) {
    console.warn(`Failed to fetch tip blocks: ${tipRes.statusText}`)
    return []
  }

  const tipData = await tipRes.json()
  if (!Array.isArray(tipData) || tipData.length === 0) {
    console.warn('No blocks returned from the tip endpoint.')
    return []
  }

  // Find the maximum height from the returned blocks
  const heights = tipData.map((b: any) => b.height)
  const currentHeight = Math.max(...heights)

  const startHeight = currentHeight - (TOTAL_BLOCKS_NEEDED - 1)
  const minHeight = Math.max(1, startHeight) // Ensure not below 1
  const maxHeight = currentHeight

  console.log(`Fetching blocks from height ${minHeight} to ${maxHeight}`)

  const allBlocks: any[] = []

  for (let h = minHeight; h <= maxHeight; h += 10) {
    const chunkStart = h
    const chunkEnd = Math.min(h + 9, maxHeight)
    const url = `${LITECOINSPACE_API}/v1/blocks-bulk/${chunkStart}/${chunkEnd}`
    const bulkResponse = await fetch(url)
    if (!bulkResponse.ok) {
      console.warn(
        `Failed to fetch bulk blocks [${chunkStart}-${chunkEnd}]: ${bulkResponse.statusText}`
      )
      continue // Skip this chunk if not found
    }

    const blocksData = await bulkResponse.json()
    if (Array.isArray(blocksData)) {
      allBlocks.push(...blocksData)
    } else {
      console.warn(
        `Unexpected response for blocks [${chunkStart}-${chunkEnd}].`
      )
    }
  }

  return allBlocks
}

async function fetchBlockTransactions(blockHash: string): Promise<any[]> {
  const res = await fetch(`${LITECOINSPACE_API}/block/${blockHash}/txs`)
  if (!res.ok) {
    console.warn(
      `Failed to fetch transactions for block ${blockHash}: ${res.statusText}`
    )
    return []
  }
  return await res.json()
}

async function fetchTransaction(txid: string): Promise<any> {
  const res = await fetch(`${LITECOINSPACE_API}/tx/${txid}`)
  if (!res.ok) {
    console.warn(`Failed to fetch transaction ${txid}: ${res.statusText}`)
    return {}
  }
  return await res.json()
}

function sumTransactionOutputs(txDetails: any): number {
  if (!txDetails.vout || txDetails.vout.length === 0) return 0
  return txDetails.vout.reduce(
    (sum: number, out: any) => sum + (out.value || 0),
    0
  )
}
