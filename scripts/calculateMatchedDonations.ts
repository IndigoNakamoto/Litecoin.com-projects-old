import { getMatchedDonations } from '../lib/reports'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  const matchedDonations = await getMatchedDonations()
  console.log('Total Matched Donations:', matchedDonations)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
