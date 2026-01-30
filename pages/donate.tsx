// pages/donate.tsx

import { useRouter } from 'next/router'
import DonateSection from '@/components/DonateSection'
import { PageSEO } from '@/components/SEO'
import PaymentForm from '@/components/PaymentForm'
import { ProjectCategory } from 'utils/types'
import React, { useEffect } from 'react'
import { useDonation } from '../contexts/DonationContext'
import CompletedProjects from '@/components/CompletedProjects'
import SectionMatchingDonations from '@/components/SectionMatchingDonations'
// import SectionDonors from '@/components/SectionDonors'
// import SectionProjects from './SectionProjects'
import SectionWhite from '@/components/SectionWhite'
import SectionBlue from '@/components/SectionBlue'
import SectionGrey from '@/components/SectionGrey'
import SectionStats from '@/components/SectionStats'

export default function Donate() {
  const { dispatch } = useDonation()
  const router = useRouter()
  const { reset } = router.query

  useEffect(() => {
    if (reset === 'true') {
      dispatch({ type: 'RESET_DONATION_STATE' })
      // Optionally, remove the reset parameter from the URL
      const newPath = router.pathname
      const newQuery = { ...router.query }
      delete newQuery.reset
      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      )
    }
  }, [dispatch, reset, router])

  return (
    <>
      <PageSEO
        title="Donate to Litecoin Foundation | Support Cryptocurrency Innovation"
        description="Support the Litecoin Foundation by making a donation. Your contribution helps advance Litecoin adoption, development, and community initiatives."
        // keywords="Litecoin, Donate, Cryptocurrency, Support, Foundation, Blockchain"
      />
      <DonateSection title="">
        <div className="mx-auto flex w-full flex-col items-center justify-between xl:flex-row xl:items-start">
          <div className="max-w-[600px] flex-1 pr-0  xl:pr-6">
            <h1 className="font-space-grotesk text-4xl font-bold text-[#222222]">
              Support the Future of Litecoin: Donate Today
            </h1>
            <div>
              <p className="mt-6 text-lg text-[#222222]">
                Litecoin Foundation Inc. is a 501(c)(3) nonprofit organization
                whose mission is to promote the adoption, awareness &
                development of Litecoin & its ecosystem.
              </p>
              <p className="mt-4 text-lg text-[#222222]">
                Since Litecoin is a fairly launched, decentralized
                cryptocurrency, Litecoin Foundation’s primary source of
                financial support is through individual donations. Your
                contribution helps Litecoin Foundation continue to fund research
                and development, education, community support, partnerships and
                advocacy related to Litecoin, cryptocurrency and financial
                privacy.
              </p>
              <p className="mt-4 text-lg text-[#222222]">
                Your contribution may also reduce your taxable income, depending
                on your tax situation. If you have any questions, please feel
                free to consult with your tax advisor to ensure you're getting
                the full benefit of your charitable donation.
              </p>
            </div>
          </div>
          <div className="mt-12 w-full max-w-[600px] flex-none rounded-2xl border border-[#222222] bg-gray-100 p-6 xl:mt-0">
            <PaymentForm
              project={{
                slug: 'litecoin-foundation',
                title: 'Litecoin Foundation',
                summary: '',
                coverImage:
                  'https://cdn.prod.website-files.com/6233ca951c563d47368b1def/675b68a6b7eab91cd73b0765_Litecoin%20Foundation%20Project.png',
                telegramLink: '',
                redditLink: '',
                facebookLink: '',
                type: ProjectCategory.BOUNTY,
                isRecurring: false,
              }}
              modal={true}
            />
          </div>
        </div>
      </DonateSection>
      <SectionGrey>
        <SectionStats />
      </SectionGrey>
      <SectionBlue>
        {/* Matching Donations Section */}
        <SectionMatchingDonations />
      </SectionBlue>

      <SectionWhite bgColor="#ffffff">
        <div className="min-w-full">
          <CompletedProjects />
        </div>
      </SectionWhite>
    </>
  )
}
