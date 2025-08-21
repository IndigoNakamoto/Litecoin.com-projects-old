import { useMemo } from 'react'
import DonationsTable from '../../components/admin/DonationsTable'
import ProjectSummaryTable from '../../components/admin/ProjectSummaryTable'
import TotalsSummary from '../../components/admin/TotalsSummary'
import { Donation } from '@prisma/client'
import { useRouter } from 'next/router'
import SectionGrey from '../../components/SectionGrey'
import { GetServerSideProps } from 'next'
import { getAllDonations } from '../../lib/prisma'

interface DonationWithMatchedAmount extends Donation {
  matchedAmount: number
  serviceFee: number
  netAmount: number
}

type DashboardProps = {
  donations: DonationWithMatchedAmount[]
}

export default function Dashboard({ donations }: DashboardProps) {
  const router = useRouter()

  const filteredDonations = useMemo(
    () =>
      donations.filter(
        (donation) =>
          donation.status === 'Complete' &&
          Number(donation.valueAtDonationTimeUSD ?? 0) >= 2
      ),
    [donations]
  )

  const handleLogout = async () => {
    await fetch('/api/auth/logout')
    router.push('/admin/login')
  }

  return (
    <SectionGrey>
      <h1 className="pt-20">Admin Dashboard</h1>
      <button className="text-black" onClick={handleLogout}>
        Logout
      </button>
      <div>
        <TotalsSummary donations={filteredDonations} />
        <ProjectSummaryTable donations={filteredDonations} />
        <DonationsTable donations={filteredDonations} />
      </div>
    </SectionGrey>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const donations = await getAllDonations()

  return {
    props: {
      donations: JSON.parse(JSON.stringify(donations)),
    },
  }
}
