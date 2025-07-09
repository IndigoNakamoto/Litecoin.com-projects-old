import dotenv from 'dotenv'
import fs from 'fs'
import { generateReport } from '../lib/reports'
import prisma from '../lib/prisma'

dotenv.config({ path: '.env.local' })

async function generateDailyReport() {
  return generateReport(24 * 60 * 60 * 1000, 'Daily')
}

async function generateMonthlyReport() {
  return generateReport(30 * 24 * 60 * 60 * 1000, 'Monthly')
}

async function main() {
  console.log('--- Generating Daily Report ---')
  const dailyReport = await generateDailyReport()
  fs.writeFileSync('daily-report.pdf', dailyReport as unknown as Uint8Array)
  console.log('Daily report saved to daily-report.pdf')

  console.log('\n--- Generating Monthly Report ---')
  const monthlyReport = await generateMonthlyReport()
  fs.writeFileSync('monthly-report.pdf', monthlyReport as unknown as Uint8Array)
  console.log('Monthly report saved to monthly-report.pdf')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
