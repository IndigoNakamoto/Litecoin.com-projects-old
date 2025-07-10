import SubmittedSection from '@/components/SubmittedSection'
import { PageSEO } from '@/components/SEO'
import React from 'react'
import Link from '@/components/Link'

export default function Submitted() {
  return (
    <>
      <PageSEO
        title="Litecoin.net | Project Submitted"
        description="Thank you for submitting your project to Litecoin.net. We will review your application shortly."
      />
      <SubmittedSection title="Thank You for Your Submission!">
        <div className="my-auto mt-10 max-w-2xl space-y-8 text-center xs:my-4">
          <p>
            We've received your project submission and are excited to review
            your application. The Litecoin Foundation appreciates your
            initiative and your commitment to strengthening the Litecoin
            ecosystem.
          </p>
          <p>
            Our team will carefully review the details you've provided. You can
            expect to hear from us within the next 7-10 business days regarding
            the status of your submission. We'll reach out if we have any
            questions.
          </p>
        </div>
      </SubmittedSection>
    </>
  )
}
