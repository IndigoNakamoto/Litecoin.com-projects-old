import { calculateMatchedDonationsForProject } from '../services/matching'

const projectSlug = 'litecoin-foundation'

const run = async () => {
  try {
    const totalMatched = await calculateMatchedDonationsForProject(projectSlug)
    console.log(`Total matched donations for ${projectSlug}: ${totalMatched}`)
  } catch (error) {
    console.error(`Error running script for ${projectSlug}:`, error)
  }
}

run()
