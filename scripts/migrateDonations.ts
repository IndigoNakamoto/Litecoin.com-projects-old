// /scripts/migrateDonations.ts
import axios from 'axios'
import crypto from 'crypto'
import prisma from '../lib/prisma' // Ensure the path is correct
import Decimal from 'decimal.js'
import readline from 'readline'
import Bottleneck from 'bottleneck'
import fs from 'fs'
import { join } from 'path'
import { fetchGetJSONAuthed } from '../utils/api-helpers'
// import matter from 'gray-matter'

// // Create a Bottleneck limiter to manage CoinGecko API rate limits
// const limiter = new Bottleneck({
//   minTime: 1200, // Minimum time between requests in milliseconds (1200ms = ~50 requests/minute)
//   maxConcurrent: 1, // Only one request at a time
// })

// Define types for donation data
type DonationData = {
  amount: string
  createdTime: number
  supporter: string | null
}

// Function to fetch donation data from BTCPay Server for a given slug
async function fetchDonationData(slug: string): Promise<DonationData[] | null> {
  try {
    console.log('Fetch donation data for slug: ', slug)
    const username = process.env.BTCPAY_USERNAME
    const password = process.env.BTCPAY_PASSWORD
    const btcpay_url = process.env.BTCPAY_URL
    const btcpay_store_id = process.env.BTCPAY_STORE_ID
    // console.log('username: ', username)
    // console.log('password: ', password)
    // console.log('btcpay_url: ', btcpay_url)
    // console.log('btcpay_store_id: ', btcpay_store_id)

    // Ensure BTCPay credentials are set
    if (!username || !password || !btcpay_store_id || !btcpay_url) {
      // console.log('username or password is not set')
    }

    if (!username || !password) {
      throw new Error('BTCPAY_USERNAME and BTCPAY_PASSWORD must be set in .env')
    }

    const base64Credentials = Buffer.from(`${username}:${password}`).toString(
      'base64'
    )

    // console.log('base64: ', base64Credentials)
    const auth = `Basic ${base64Credentials}`

    // console.log('make get request')
    const response = await fetchGetJSONAuthed(
      `${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices?status=Settled&status=Processing`,
      auth
    )
    // console.log('Fetched Invoices: ', response.data)

    if (!Array.isArray(response)) {
      // console.log('Unexpected response format from BTCPay Server')
    }

    // Filter invoices by slug
    const filteredInvoices = response.filter(
      (item: any) =>
        item.metadata &&
        item.metadata.posData &&
        item.metadata.posData.orderId === slug
    )

    const donationData: DonationData[] = filteredInvoices.map(
      (invoice: any) => ({
        amount: invoice.amount,
        createdTime: invoice.createdTime,
        supporter: invoice.metadata.posData.buyerTwitter || null,
      })
    )

    console.log(`Fetched ${donationData.length} donations for slug "${slug}".`)
    return donationData
  } catch (error: any) {
    console.error(
      `Error fetching donation data for slug "${slug}":`,
      error.message
    )
    return null
  }
}

// Function to fetch historical LTC/USD rate using Coinbase API
async function fetchHistoricalLtcUsdRateCoinbase(
  timestamp: number
): Promise<number | null> {
  try {
    const productId = 'LTC-USD'
    const granularity = 60 // 1 minute

    const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
    const isoStart = date.toISOString()
    const isoEnd = new Date(date.getTime() + granularity * 1000).toISOString() // +1 minute

    const url = `https://api.exchange.coinbase.com/products/${productId}/candles`

    const response = await axios.get(url, {
      params: {
        start: isoStart,
        end: isoEnd,
        granularity,
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName/1.0', // Replace with your app's name/version
      },
    })

    if (response.data.length === 0) {
      throw new Error('No candlestick data found for the given timestamp.')
    }

    // Each candle: [ time, low, high, open, close, volume ]
    const closingPrice = parseFloat(response.data[0][4]) // Close price
    console.log(`LTC/USD rate on ${date.toUTCString()}: $${closingPrice}`)
    return closingPrice
  } catch (error: any) {
    console.error(
      'Error fetching historical LTC/USD rate from Coinbase:',
      error.message
    )
    return null
  }
}

// Function to create a donation record in PostgreSQL via Prisma
async function createDonationRecord(
  donationData: DonationData,
  slug: string,
  ltcUsdValue: number
): Promise<any | null> {
  try {
    // Prepare data for the donation record
    const parsedPledgeAmount = new Decimal(donationData.amount)

    // Generate a unique pledgeId
    const pledgeId = crypto.randomUUID()

    const existingDonation = await prisma.donation.findFirst({
      where: {
        pledgeAmount: parsedPledgeAmount,
        projectSlug: slug,
        timestampms: new Date(donationData.createdTime * 1000),
      },
    })

    if (existingDonation) {
      console.log(
        `Donation with amount ${donationData.amount}, projectSlug "${slug}", and timestamp ${donationData.createdTime} already exists. Skipping.`
      )
      return existingDonation
    }

    const donationRecord = await prisma.donation.create({
      data: {
        // Project
        projectSlug: slug.replace(/_/g, '-'),
        organizationId: 1189134331, // Replace with your actual organization ID
        // Donation
        donationType: 'crypto',
        assetSymbol: 'LTC',
        success: true,
        processed: true,
        pledgeAmount: parsedPledgeAmount,
        // Donor Info
        firstName: 'Supporter',
        lastName: 'Anonymous',
        donorEmail: 'supporter@example.com', // Placeholder email
        // Donor Settings
        isAnonymous: true,
        taxReceipt: false,
        joinMailingList: false,
        // Donor Social Profiles
        socialX: donationData.supporter,
        // Additional fields
        amount: parsedPledgeAmount,
        currency: 'LTC',
        valueAtDonationTimeUSD: parsedPledgeAmount.mul(ltcUsdValue),
        status: 'Complete',
        transactionHash: crypto.randomBytes(32).toString('hex'),
        timestampms: new Date(donationData.createdTime * 1000),
        eid: `${Math.floor(Math.random() * 10000000000)}`, // Unique event ID
        paymentMethod: 'Crypto',
        eventData: {
          DEPOSIT_TRANSACTION: {
            // Mocked event data
            type: 'Deposit',
            id: crypto.randomUUID(),
            status: 'Complete',
            timestampms: `${Date.now()}`,
            eid: `${Math.floor(Math.random() * 10000000000)}`,
            transactionHash: crypto.randomBytes(32).toString('hex'),
            currency: 'LTC',
            amount: donationData.amount,
            organizationId: 1189134331,
            eventTimestamp: `${Date.now()}`,
            valueAtDonationTimeUSD: parsedPledgeAmount
              .mul(ltcUsdValue)
              .toFixed(2),
            paymentMethod: 'Crypto',
            payoutAmount: null,
            payoutCurrency: 'USD',
            externalId: `ext-${crypto.randomBytes(8).toString('hex')}`,
            campaignId: `camp-${crypto.randomBytes(4).toString('hex')}`,
          },
        },
        pledgeId: pledgeId, // Assign the generated pledgeId
      },
    })

    console.log(`Created donation record with ID: ${donationRecord.id}`)
    return donationRecord
  } catch (error: any) {
    console.error('Error creating donation record:', error.message)
    return null
  }
}

// Function to prompt user for input
function promptUser(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    })
  )
}

// Function to get all project slugs
function getPostSlugs() {
  const postsDirectory = join(process.cwd(), 'data/projects')
  return fs.readdirSync(postsDirectory)
}

// Function to migrate donations for all projects
async function migrateAllDonations() {
  const slugs = getPostSlugs()
  for (const slug of slugs) {
    await migrateDonations(slug)
  }
}

// Main function to run the migration per project slug or all projects
async function migrateDonations(slug: string) {
  console.log(`\nStarting migration for project slug: "${slug}"`)

  const donations = await fetchDonationData(slug)

  if (!donations || donations.length === 0) {
    console.error(`No donations found for slug "${slug}". Exiting...`)
    return
  }

  for (const donation of donations) {
    console.log(`\nProcessing donation...`)

    const ltcUsdValue = await fetchHistoricalLtcUsdRateCoinbase(
      donation.createdTime
    )

    if (!ltcUsdValue) {
      console.error('Failed to fetch LTC/USD rate. Skipping this donation.')
      continue
    }

    const donationRecord = await createDonationRecord(
      donation,
      slug,
      ltcUsdValue
    )

    if (donationRecord) {
      console.log(`Donation migrated successfully: ID ${donationRecord.id}`)
    } else {
      console.error('Failed to migrate donation.')
    }
  }

  console.log(`\nMigration completed for project slug: "${slug}".`)
}

// Main execution
async function main() {
  try {
    // Prompt user to enter project slug or choose to migrate all
    const slugInput = await promptUser(
      'Enter the project slug to migrate or type "all" to migrate all projects: '
    )

    const slug = slugInput.trim()

    if (slug.toLowerCase() === 'all') {
      await migrateAllDonations()
    } else if (!slug) {
      console.error('No valid project slug entered. Exiting...')
      process.exit(1)
    } else {
      await migrateDonations(slug)
    }

    console.log('\nAll migrations completed.')
  } catch (error: any) {
    console.error('Unexpected error during migration:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
