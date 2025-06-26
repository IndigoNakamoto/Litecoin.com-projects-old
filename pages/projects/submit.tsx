import ProjectSubmissionForm from '@/components/ProjectSubmissionForm'
import ApplySection from '@/components/ApplySection'
// import Link from '@/components/Link'
// import CustomLink from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import React from 'react'

export default function Apply() {
  return (
    <>
      <PageSEO
        title="Litecoin.net | Submit Your Project"
        description="Submit your project to Litecoin.net for community crowdfunding and support. Join the Litecoin ecosystem and get your project listed today."
      />
      <ApplySection title="Submit a Project">
        <div className="my-auto mt-10 max-w-2xl space-y-8 xs:my-4">
          <p>
            Have a project that can benefit the Litecoin community? Use the form
            below to submit your project for consideration. Once approved, your
            project will be listed on Litecoin.net, where the community can help
            crowdfund and support your initiative.
          </p>
          <p>
            We will review the information you provide to ensure it aligns with
            our goals and values. If your project is selected, we'll reach out
            with any additional details needed to finalize your listing. This
            may include providing Litecoin addresses or other payment details to
            facilitate donations.
          </p>
          {/* Doantion Policy */}
          <div className="prose max-w-none rounded-xl bg-gray-100 p-6 dark:bg-gray-100">
            <h2 className="text-xl font-bold">Donation Policies</h2>
            <p>
              The Litecoin Foundation is a registered non-profit organization
              dedicated to advancing Litecoin and blockchain technology through
              open-source development. Your work is vital to our mission.
            </p>
            <h3 className="text-lg font-bold">Service Fee</h3>
            <p>
              A 15% service fee is applied to each donation to cover operational
              costs, including administrative and marketing expenses that help
              us grow our impact.
            </p>
            <h3 className="text-lg font-bold">Fund Allocation</h3>
            <p>
              While we always strive to honor the donor's intent, the Litecoin
              Foundation's Open Source Fund Council reserves the right to
              reallocate funds between supported projects as needed. This
              ensures we can adapt to changing priorities and support the
              ecosystem most effectively.
            </p>
          </div>
          <ProjectSubmissionForm />
        </div>
      </ApplySection>
    </>
  )
}
