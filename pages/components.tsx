// pages/components.js
import React from 'react'
// Import your components
import PaymentModalStockDonorSignature from '../components/PaymentModalStockDonorSignature'
import GradientButton from '../components/GradientButton'
import PaymentModalStockBrokerInfo from '../components/PaymentModalStockBrokerInfo'
import PaymentModalStockDonorThankYou from '../components/PaymentModalStockDonorThankYou'
import PaymentModalPersonalInfo from '../components/PaymentModalPersonalInfo'
import PaymentModalFiatDonate from '../components/PaymentModalFiatDonate'
import PaymentModalFiatOption from '../components/PaymentModalFiatOption'
import PaymentModalFiatThankYou from '../components/PaymentModalFiatThankYou'
import PaymentModalCryptoDonate from '@/components/PaymentModalCryptoDonate'
import PaymentModalCryptoOption from '@/components/PaymentModalCryptoOption'
// import ProjectMarkdownRenderer from '@/components/ProjectMarkdownRenderer'
import ProjectRichTextRenderer from '@/components/ProjectRichTextRenderer'
// import PostsList from '@/components/PostsList'
import PaymentForm from '@/components/PaymentForm'
import { ProjectCategory } from 'utils/types'
import SectionStats from '@/components/SectionStats'
import PostReddit from '@/components/PostReddit' // <-- Add this import

const ComponentsShowcase = () => {
  // const handleContinue = () => {
  //   alert('Continue action triggered')
  // }

  // function openPaymentModal() {
  //   dispatch({
  //     type: 'SET_PROJECT_DETAILS',
  //     payload: {
  //       slug: project.slug,
  //       title: project.title,
  //       image: project.coverImage,
  //     },
  //   })
  // }

  return (
    <div className="mt-32 flex min-h-screen items-center justify-center p-8">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-8">
        <h1 className="mb-6 text-4xl font-bold text-white">
          Component Showcase
        </h1>

        {/* Add a section for Reddit post */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Reddit Post Embed
        </h2>
        <section className="mb-8 w-[550px] rounded-3xl bg-[#f0f0f0] p-4">
          <PostReddit redditPostURL="https://www.reddit.com/r/litecoin/comments/1fddivu/coinswap_is_now_available_for_ltc_mweb_iykyk/" />
        </section>

        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Section Stats
        </h2>
        <section className="mb-8 max-w-4xl rounded-3xl bg-[#f0f0f0] p-4">
          <SectionStats />
        </section>

        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Post List
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          {/* <PostsList /> */}
        </section>

        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Project Rich Text Renderer
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <ProjectRichTextRenderer slug="litecoin-core" />
        </section>

        {/* // Showcase PaymentModalCryptoOption */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Crypto Option
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalCryptoOption onCurrencySelect={() => null} />
        </section>

        {/* Showcase PaymentForm */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Form
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl border border-white bg-[#f0f0f0] p-4">
          <PaymentForm
            project={{
              slug: 'general',
              title: 'General',
              summary: '',
              coverImage: '',
              telegramLink: '',
              redditLink: '',
              facebookLink: '',
              type: ProjectCategory.BOUNTY,
              isRecurring: false,
            }}
            modal={false}
          />
        </section>

        {/* // Showcase PaymentModalCryptoDonate */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Crypto Donate
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalCryptoDonate onRequestClose={() => null} />
        </section>

        {/* // Showcase PaymentModalFiatThankYou */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Fiat Thank You
        </h2>
        <section className="mb-8 w-full max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalFiatThankYou onRequestClose={() => null} />
        </section>

        {/* Showcase PaymentModalStockDonorThankYou */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Stock Donor Thank You
        </h2>
        <section className="mb-8 w-full max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalStockDonorThankYou onRequestClose={() => null} />
        </section>

        {/* // Showcase PaymentModalFiatDonate */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Fiat Donate
        </h2>
        <section className="mb-8 w-full max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalFiatDonate />
        </section>
        {/* // Showcase PaymentModalFiatOption */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Fiat Option
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalFiatOption />
        </section>
        {/* Showcase Gradient Button Component */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Gradient Button Component
        </h2>
        <section className="mb-8 w-full max-w-lg space-y-2 rounded-3xl bg-[#f0f0f0] p-4">
          <GradientButton
            isLoading={false}
            onClick={() => alert('Button clicked!')}
          >
            Click Me
          </GradientButton>
          <GradientButton
            isLoading={false}
            disabled={true}
            onClick={() => alert('Button clicked!')}
          >
            Disabled
          </GradientButton>
          <GradientButton
            isLoading={true}
            onClick={() => alert('Button clicked!')}
            loadingText="Processing.."
          >
            Click Me
          </GradientButton>
        </section>
        {/* Showcase PaymentModalStockDonorSignature */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Stock Donor Signature
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalStockDonorSignature onContinue={() => null} />
        </section>
        {/* Showcase PaymentModalStockBrokerInfo */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Stock Broker Info
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalStockBrokerInfo />
        </section>

        {/* Showcase PaymentModalPersonalInfo */}
        <h2 className="mb-2 pt-10 text-2xl font-semibold text-white">
          Payment Modal Personal Info
        </h2>
        <section className="mb-8 max-w-lg rounded-3xl bg-[#f0f0f0] p-4">
          <PaymentModalPersonalInfo onRequestClose={() => null} />
        </section>
        {/* Add more sections as needed for each component */}
      </div>
    </div>
  )
}

export default ComponentsShowcase
