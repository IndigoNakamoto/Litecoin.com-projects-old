import { Donation } from '@prisma/client'
import { useMemo } from 'react'

interface DonationWithMatchedAmount extends Donation {
  matchedAmount: number
  serviceFee: number
  netAmount: number
}

type ProjectSummary = {
  projectSlug: string
  totalDonations: number
  totalServiceFees: number
  totalNetAmount: number
  totalMatchedAmount: number
}

export default function ProjectSummaryTable({
  donations,
}: {
  donations: DonationWithMatchedAmount[]
}) {
  const projectSummary = useMemo(() => {
    const summary: Record<string, ProjectSummary> = {}
    donations.forEach((donation) => {
      if (!summary[donation.projectSlug]) {
        summary[donation.projectSlug] = {
          projectSlug: donation.projectSlug,
          totalDonations: 0,
          totalServiceFees: 0,
          totalNetAmount: 0,
          totalMatchedAmount: 0,
        }
      }
      summary[donation.projectSlug].totalDonations +=
        Number(donation.valueAtDonationTimeUSD) ?? 0
      summary[donation.projectSlug].totalServiceFees += donation.serviceFee
      summary[donation.projectSlug].totalMatchedAmount += donation.matchedAmount
    })

    return Object.values(summary).map((project) => ({
      ...project,
      totalNetAmount:
        project.totalDonations -
        project.totalServiceFees +
        project.totalMatchedAmount,
    }))
  }, [donations])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Project Summary</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">Project</th>
            <th className="border-b px-4 py-2 text-left">Total Donations</th>
            <th className="border-b px-4 py-2 text-left">LF's Service Fees</th>
            <th className="border-b px-4 py-2 text-left">
              Total Matched Amount
            </th>
            <th className="border-b px-4 py-2 text-left">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {projectSummary.map((project, index) => (
            <tr
              key={project.projectSlug}
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="border-b px-4 py-2">{project.projectSlug}</td>
              <td className="border-b px-4 py-2">
                ${project.totalDonations.toFixed(2)}
              </td>
              <td className="border-b px-4 py-2">
                ${project.totalServiceFees.toFixed(2)}
              </td>
              <td className="border-b px-4 py-2">
                ${project.totalMatchedAmount.toFixed(2)}
              </td>
              <td className="border-b px-4 py-2">
                ${project.totalNetAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
