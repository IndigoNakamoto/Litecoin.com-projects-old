// components/DonationStats.tsx
import React from 'react'
import { AddressStats } from '../utils/types'
import { defaultAddressStats } from '../utils/defaultValues' // Adjust the path as necessary

type DonationStatsProps = {
  addressStats?: AddressStats
  formatUSD: (value: any) => string
  formatLits?: (value: any) => string
  litecoinRaised?: number
  litecoinPaid?: number
  isMatching?: boolean
  isBitcoinOlympics2024?: boolean
  isRecurring?: boolean
  matchingTotal?: number
  serviceFeeCollected?: number
  totalPaid?: number
  matchingDonors?: any[]
  monthlyTotal?: number
  recurringAmountGoal?: number
  monthlyDonorCount?: number
  timeLeftInMonth?: number
}

type StatItemProps = {
  value: string | number
  label: string
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div className="mt-2">
    <h4 className="font-space-grotesk text-3xl font-semibold text-blue-500">
      {value}
    </h4>
    <h4 className="">{label}</h4>
  </div>
)

const DonationStats: React.FC<DonationStatsProps> = ({
  addressStats = defaultAddressStats,
  isMatching = false,
  isBitcoinOlympics2024 = false,
  isRecurring = false,
  matchingTotal = 0,
  serviceFeeCollected = 0,
  matchingDonors = [],
  totalPaid = 0,
  formatUSD,
  formatLits,
  litecoinRaised = 0,
  litecoinPaid = 0,
  monthlyTotal = 0,
  recurringAmountGoal = 0,
  monthlyDonorCount = 0,
  timeLeftInMonth = 0,
}) => {
  return (
    <div className="flex w-full flex-col">
      {!isBitcoinOlympics2024 && !isRecurring && (
        <div className="flex w-full flex-col">
          {litecoinRaised > 0 && formatLits && (
            <StatItem
              value={`Ł ${formatLits(litecoinRaised)}`}
              label="LTC Raised"
            />
          )}
          <StatItem
            value={`$ ${formatUSD(addressStats.funded_txo_sum)}`}
            label="USD Raised"
          />
          {/* TODO: map matching donors: Name, Amount Matched, Multiplier */}
          {matchingDonors?.map((donor, i) => {
            return (
              <StatItem
                key={i}
                value={`$ ${formatUSD(donor.totalMatchedAmount)}`}
                label={`Donations Matched by ${donor.donorFieldData.name}`}
              />
            )
          })}

          {/* <StatItem
            value={`$ ${formatUSD(serviceFeeCollected)}`}
            label="15% Service Fee Collected"
          /> */}
          <StatItem
            value={`$ ${formatUSD(totalPaid)}`}
            label="Paid to Contributors"
          />
          {litecoinPaid > 0 && formatLits && (
            <StatItem
              value={`Ł ${formatLits(litecoinPaid)}`}
              label="LTC Paid to Contributors"
            />
          )}
          <StatItem value={addressStats.tx_count || '0'} label="Donations" />
        </div>
      )}

      {/* Bitcoin Olypmics */}
      {isMatching && isBitcoinOlympics2024 && (
        <div className="flex w-full flex-col">
          <StatItem
            value={`$ ${formatUSD(addressStats.funded_txo_sum)}`}
            label="The USD Community Raised Prize"
          />
          <StatItem
            value={`$ ${formatUSD(matchingTotal)}`}
            label="Prizes Matched by Charlie Lee & Galal Doss"
          />
          <StatItem
            value={`$ ${formatUSD(
              addressStats.funded_txo_sum + matchingTotal
            )} + $8,000`}
            label="Total Prize Pool"
          />
          <StatItem
            value={`$ ${formatUSD(totalPaid)}`}
            label="Awarded to Bitcoin Olympics 2024 Participants"
          />
          <StatItem value="$ 0" label="15% Service Fee Collected" />
          <StatItem value={addressStats.tx_count || '0'} label="Donations" />
        </div>
      )}

      {isRecurring && (
        <div className="w-full rounded-lg text-gray-800">
          <div className="flex w-full flex-row lg:flex-col">
            <div>
              <h2 className="font-space-grotesk font-semibold">
                Total Donations
              </h2>
              <StatItem
                value={`$ ${formatUSD(addressStats.funded_txo_sum)}`}
                label="USD Raised"
              />
              <StatItem
                value={addressStats.tx_count || '0'}
                label="Supporters"
              />
            </div>
            <div className="pl-16 lg:pl-0 lg:pt-4">
              <h2 className="font-space-grotesk font-semibold">Monthly Goal</h2>
              <div>
                <StatItem
                  value={`$ ${formatUSD(monthlyTotal)}`}
                  label={`Donated of $${recurringAmountGoal} monthly goal`}
                />
              </div>
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <h4 className="mt-4 font-space-grotesk text-3xl font-semibold text-blue-500">
                    {monthlyDonorCount}
                  </h4>
                  <h4 className="font-space-grotesk">Supporters</h4>
                </div>
                <div className="ml-8 flex flex-col">
                  <h4 className="mt-4 font-space-grotesk text-3xl font-semibold text-blue-500">
                    {timeLeftInMonth}
                  </h4>
                  <h4 className="font-space-grotesk">Days to go</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonationStats
