## Donation (Prisma)

id, createdAt, projectSlug, donorEmail, isAnonymous, depositAddress, processed, valueAtDonationTimeUSD, status

## MatchingDonationLog

donationId, matchedAmount, projectSlug A

## Merged Donation and MatchingDonationLog

id (donationId), createdAt, projectSlug, donorEmail, isAnonymous, depositAddress, processed, valueAtDonationTimeUSD, status, matchedAmount
