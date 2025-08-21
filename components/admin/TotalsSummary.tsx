import { Donation } from '@prisma/client'
import { useMemo } from 'react'

interface DonationWithMatchedAmount extends Donation {
  matchedAmount: number
  serviceFee: number
  netAmount: number
}

export default function TotalsSummary({
  donations,
}: {
  donations: DonationWithMatchedAmount[]
}) {
  const totals = useMemo(() => {
    return donations.reduce(
      (acc, donation) => {
        acc.totalDonations += Number(donation.valueAtDonationTimeUSD) ?? 0
        acc.totalServiceFees += donation.serviceFee
        acc.totalMatchedAmount += donation.matchedAmount
        return acc
      },
      {
        totalDonations: 0,
        totalServiceFees: 0,
        totalMatchedAmount: 0,
      }
    )
  }, [donations])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Overall Totals</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded bg-gray-100 p-4">
          <h3 className="text-lg font-bold">Total Donations Received</h3>
          <p className="text-2xl">${totals.totalDonations.toFixed(2)}</p>
        </div>
        <div className="rounded bg-gray-100 p-4">
          <h3 className="text-lg font-bold">Total Service Fees Collected</h3>
          <p className="text-2xl">${totals.totalServiceFees.toFixed(2)}</p>
        </div>
        <div className="rounded bg-gray-100 p-4">
          <h3 className="text-lg font-bold">Total Matching Amount</h3>
          <p className="text-2xl">${totals.totalMatchedAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
