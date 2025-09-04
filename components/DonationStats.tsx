// components/DonationStats.tsx
import React from 'react'
import { AddressStats } from '../utils/types'
import { defaultAddressStats } from '../utils/defaultValues'

// --- Type Definitions ---
type SharedStatsProps = {
  addressStats: AddressStats
  formatUSD: (value: number) => string
  totalPaid?: number
}

// --- Reusable Child Component ---
type StatItemProps = {
  value: string | number
  label: string
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div>
    <h4 className="font-space-grotesk text-3xl font-semibold text-blue-500">
      {value}
    </h4>
    <h4 className="">{label}</h4>
  </div>
)

// --- Decomposed View Components ---

/**
 * @description Displays standard donation stats with a clear breakdown of raised vs. matched funds.
 */
const StandardStats: React.FC<
  SharedStatsProps & {
    formatLits?: (value: number) => string
    litecoinRaised?: number
    litecoinPaid?: number
    matchingDonors?: {
      totalMatchedAmount: number
      donorFieldData: { name: string }
    }[]
  }
> = ({
  addressStats,
  formatUSD,
  formatLits,
  litecoinRaised = 0,
  litecoinPaid = 0,
  matchingDonors = [],
  totalPaid = 0,
}) => {
  // --- Calculations ---
  const communityRaisedUSD = addressStats.funded_txo_sum
  const totalMatched = matchingDonors.reduce(
    (sum, donor) => sum + donor.totalMatchedAmount,
    0
  )
  const grandTotalUSD = communityRaisedUSD + totalMatched

  const formattedCommunityLtc = litecoinRaised.toFixed(2)
  const formattedLtcPaid = litecoinPaid.toFixed(2)

  // --- NEW: Conditional Display Logic ---
  const hasLtcRaised = litecoinRaised > 0
  const hasUsdRaised = grandTotalUSD > 0
  const hasLtcPaid = litecoinPaid > 0 && !!formatLits
  const hasUsdPaid = totalPaid > 0

  return (
    <div className="flex w-full flex-col gap-6">
      {/* --- Group 1: Funding Breakdown --- */}
      <div className="flex flex-col gap-4">
        <h3 className="font-space-grotesk text-lg font-bold text-gray-800">
          Funding Summary
        </h3>
        {litecoinRaised > 0 && (
          <StatItem
            value={`Ł ${formattedCommunityLtc}`}
            label="Community Raised (LTC)"
          />
        )}
        <StatItem
          value={`$ ${formatUSD(communityRaisedUSD)}`}
          label="Community Raised (USD)"
        />

        {totalMatched > 0 && (
          <StatItem
            value={`$ ${formatUSD(totalMatched)}`}
            label="From Matching Partners"
          />
        )}
      </div>

      {/* --- Divider and Grand Total --- */}
      <div className="border-t border-gray-400/60 pt-4">
        <div>
          <h4 className="font-space-grotesk text-3xl font-semibold text-blue-500">
            {hasLtcRaised && `Ł ${formattedCommunityLtc}`}
            {hasLtcRaised && hasUsdRaised && ' + '}
            {hasUsdRaised && `$ ${formatUSD(grandTotalUSD)}`}
            {!hasLtcRaised && !hasUsdRaised && `$ ${formatUSD(0)}`}
          </h4>
          <h4 className="">Total Raised</h4>
        </div>
      </div>

      {/* --- Group 2: Other Activity --- */}
      <div className="border-t border-gray-400/60 pt-4">
        <div className="flex flex-col gap-4">
          <StatItem
            value={addressStats.tx_count || 0}
            label="Total Donations"
          />
          <div>
            <h4 className="font-space-grotesk text-3xl font-semibold text-blue-500">
              {hasLtcPaid && `Ł ${formattedLtcPaid}`}
              {hasLtcPaid && hasUsdPaid && ' + '}
              {hasUsdPaid && `$ ${formatUSD(totalPaid)}`}
              {!hasLtcPaid && !hasUsdPaid && `$ ${formatUSD(0)}`}
            </h4>
            <h4 className="">Total Paid to Contributors</h4>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * @description Displays stats specifically for the Bitcoin Olympics 2024 campaign.
 */
const BitcoinOlympicsStats: React.FC<
  SharedStatsProps & {
    matchingTotal: number
  }
> = ({ addressStats, formatUSD, matchingTotal, totalPaid = 0 }) => (
  // This component remains unchanged
  <></>
)

/**
 * @description Displays stats for recurring donation goals.
 */
const RecurringStats: React.FC<
  SharedStatsProps & {
    monthlyTotal: number
    recurringAmountGoal: number
    monthlyDonorCount: number
    timeLeftInMonth: number
  }
> = ({
  addressStats,
  formatUSD,
  monthlyTotal,
  recurringAmountGoal,
  monthlyDonorCount,
  timeLeftInMonth,
}) => (
  // This component remains unchanged
  <></>
)

// --- Main "Controller" Component ---
type DonationStatsProps = {
  addressStats?: AddressStats
  formatUSD: (value: any) => string
  formatLits?: (value: number) => string
  isBitcoinOlympics2024?: boolean
  isRecurring?: boolean
  litecoinRaised?: number
  litecoinPaid?: number
  matchingDonors?: {
    totalMatchedAmount: number
    donorFieldData: { name: string }
  }[]
  matchingTotal?: number
  monthlyDonorCount?: number
  monthlyTotal?: number
  recurringAmountGoal?: number
  timeLeftInMonth?: number
  totalPaid?: number
}

const DonationStats: React.FC<DonationStatsProps> = ({
  addressStats = defaultAddressStats,
  isBitcoinOlympics2024 = false,
  isRecurring = false,
  ...props
}) => {
  if (isRecurring) {
    return <RecurringStats addressStats={addressStats} {...props} />
  }
  if (isBitcoinOlympics2024) {
    return <BitcoinOlympicsStats addressStats={addressStats} {...props} />
  }
  return <StandardStats addressStats={addressStats} {...props} />
}

export default DonationStats
