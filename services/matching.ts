// services/matching.ts

import {
  getActiveMatchingDonors,
  getMatchingTypeLabelForDonor,
  getSupportedProjectsForDonor,
  MatchingDonorWithRemainingAmount,
} from '../utils/webflow'

import {
  prisma,
  getUnprocessedDonations,
  getDonorsMatchedAmounts,
  getMatchedDonationsByProject,
} from '../lib/prisma'

export const calculateMatchedDonationsForProject = async (
  projectSlug: string
) => {
  try {
    const totalMatched = await getMatchedDonationsByProject(projectSlug)
    return totalMatched
  } catch (error) {
    console.error(
      `Error calculating matched donations for project ${projectSlug}:`,
      error
    )
    throw error
  }
}

export const processDonationMatching = async () => {
  try {
    console.log('Starting processDonationMatching')

    const donations = await getUnprocessedDonations()
    console.log('Matching.ts donations: ', donations)
    const matchingDonors = await getActiveMatchingDonors()

    // Get donor IDs
    const donorIds = matchingDonors.map((donor) => donor.id)
    console.log('Matching.ts donorIds: ', donorIds)

    // Get already matched amounts for donors
    const donorMatchedAmountMap = await getDonorsMatchedAmounts(donorIds)
    console.log('Matching.ts donorMatchedAmountMap: ', donorMatchedAmountMap)

    for (const donation of donations) {
      try {
        const donationAmount = Number(donation.valueAtDonationTimeUSD)
        if (isNaN(donationAmount) || donationAmount <= 0) {
          console.warn(
            `Donation ID ${donation.id} has invalid or zero amount (${donationAmount}), skipping matching.`
          )
          // Do not mark as processed; allow future processing if amount is updated
          continue // Skip to the next donation
        }
        const projectSlug = donation.projectSlug

        console.log(
          `Processing donation ID ${donation.id}, amount: ${donationAmount}, projectSlug: ${projectSlug}`
        )

        // Find eligible matching donors for the project
        const eligibleDonorsResults = await Promise.all(
          matchingDonors.map(async (donor) => {
            const matchingTypeLabel = await getMatchingTypeLabelForDonor(donor)
            if (matchingTypeLabel === 'All Projects') {
              console.log(
                `Donor ID ${donor.id} (All Projects) is eligible for projectSlug ${projectSlug}`
              )
              return donor
            } else if (matchingTypeLabel === 'Per Project') {
              // Get the supported project slugs for the donor
              const supportedProjectSlugs = await getSupportedProjectsForDonor(
                donor
              )
              console.log(
                `Donor ID ${donor.id} - Supported Projects (Slugs): ${supportedProjectSlugs}, Project Slug: ${projectSlug}`
              )
              if (supportedProjectSlugs.includes(projectSlug)) {
                console.log(
                  `Donor ID ${donor.id} (Per Project) supports projectSlug ${projectSlug}`
                )
                return donor
              } else {
                console.log(
                  `Donor ID ${donor.id} (Per Project) does not support projectSlug ${projectSlug}`
                )
              }
            }
            return null
          })
        )

        const filteredEligibleDonors = eligibleDonorsResults.filter(
          (donor): donor is MatchingDonorWithRemainingAmount => donor !== null
        )

        console.log(
          `Found ${filteredEligibleDonors.length} eligible donors for donation ID ${donation.id}`
        )

        let remainingDonationAmount = donationAmount
        // Apply matching logic
        for (const donor of filteredEligibleDonors) {
          console.log(
            `Evaluating donor ID ${donor.id} for donation ID ${donation.id}`
          )
          const totalMatchingAmount = Number(
            donor.fieldData['total-matching-amount']
          )

          // Get already matched amount
          const alreadyMatchedAmount = donorMatchedAmountMap.get(donor.id) || 0
          console.log(
            `Donor ID ${donor.id} - Total Matching Amount: ${totalMatchingAmount}, Already Matched Amount: ${alreadyMatchedAmount}`
          )

          // Calculate remaining matching amount
          const remainingAmountDecimal =
            donor.remainingAmount - alreadyMatchedAmount
          console.log(
            `Donor ID ${donor.id} - Remaining Matching Amount: ${remainingAmountDecimal}`
          )

          if (remainingAmountDecimal <= 0) {
            console.log(
              `Donor ID ${donor.id} has no remaining matching amount.`
            )
            continue
          }

          // Determine the amount to match
          const multiplier = donor.fieldData['multiplier'] || 1
          if (multiplier === 0) {
            console.warn(
              `Donor ID ${donor.id} has a multiplier of 0, skipping.`
            )
            continue
          }
          const maxMatchableAmount = remainingAmountDecimal / multiplier
          const matchAmount = Math.min(
            remainingDonationAmount,
            maxMatchableAmount
          )

          console.log(
            `Donor ID ${donor.id} - Multiplier: ${multiplier}, Max Matchable Amount: ${maxMatchableAmount}, Match Amount: ${matchAmount}`
          )

          if (matchAmount <= 0) {
            console.log(
              `Donor ID ${donor.id} cannot match the donation amount.`
            )
            continue
          }

          console.log(
            `Donor ID ${donor.id} is matching donation ID ${
              donation.id
            } for amount ${matchAmount * multiplier}`
          )

          // Log the matching donation in PostgreSQL
          const logData = {
            donorId: donor.id,
            donationId: donation.id,
            matchedAmount: matchAmount * multiplier,
            date: new Date().toISOString(),
            projectSlug: projectSlug,
          }

          const logResult = await prisma.matchingDonationLog.create({
            data: {
              donorId: logData.donorId,
              donationId: logData.donationId,
              matchedAmount: logData.matchedAmount,
              date: new Date(logData.date),
              projectSlug: logData.projectSlug,
            },
          })
          console.log(`Logged matching donation: ${JSON.stringify(logResult)}`)

          // Update the donorMatchedAmountMap
          donorMatchedAmountMap.set(
            donor.id,
            alreadyMatchedAmount + matchAmount * multiplier
          )
          console.log(
            `Updated donorMatchedAmountMap for donor ID ${donor.id} to ${
              alreadyMatchedAmount + matchAmount * multiplier
            }`
          )

          remainingDonationAmount -= matchAmount
          if (remainingDonationAmount <= 0) {
            console.log(`Donation ID ${donation.id} has been fully matched.`)
            break // Exit the donor loop
          }
        }
      } catch (error: any) {
        console.error(`Error processing donation ID ${donation.id}:`, error)
      } finally {
        // After processing all matching donors for this donation, mark it as processed
        try {
          await prisma.donation.update({
            where: { id: donation.id },
            data: { processed: true },
          })
          console.log(`Donation ID ${donation.id} marked as processed.`)
        } catch (updateError) {
          console.error(
            `Failed to update processed flag for donation ID ${donation.id}:`,
            updateError
          )
          // Depending on your requirements, you might choose to handle this differently
        }
      }
    }

    console.log('Donation matching process completed')
  } catch (error: any) {
    console.error('Error in processDonationMatching:', error)
    throw error
  }
}

// Main function to trigger the donation matching process
if (require.main === module) {
  processDonationMatching()
    .then(() => {
      console.log('Process completed successfully.')
    })
    .catch((error) => {
      console.error('An error occurred during processing:', error)
    })
}
