// components/PaymentModalFiatThankYou.tsx
import React from 'react'
import { useDonation } from '../contexts/DonationContext'
import GradientButton from './GradientButton' // Import the GradientButton component

type ThankYouModalProps = {
  onRequestClose?: () => void // Optional: Remove if not needed
}

const PaymentModalFiatThankYou: React.FC<ThankYouModalProps> = ({
  onRequestClose,
}) => {
  const { state, dispatch } = useDonation()
  const projectTitle = state.projectTitle || 'your selected project'

  const handleBack = () => {
    dispatch({ type: 'RESET_DONATION_STATE' })
    // Do NOT call onRequestClose to keep the modal open and render initial step
  }

  return (
    <div className="mx-auto flex max-w-md flex-col  space-y-6 rounded-lg p-8">
      <h2 className="font-space-grotesk text-[30px] font-bold text-[#222222]">
        Thank You for Your Donation!
      </h2>
      <hr className="border-t-1 w-full border-gray-400" />
      <p className="mt-4 text-[16px] text-[#222222]">
        Your generous donation to {projectTitle} has been successfully
        processed. We appreciate your support!
      </p>
      <div className="my-4 text-[16px]">
        <p className="text-gray-800">
          <span className="font-semibold">Project:</span> {projectTitle}
        </p>
        <p className="text-gray-800"></p>
        <p className="text-gray-800">
          <span className="font-semibold">Amount:</span> $
          {state.formData.pledgeAmount}
        </p>
      </div>
      <p className="text-[16px] text-gray-700">
        You will receive a confirmation email with your tax receipt once your
        donation is processed.
      </p>
      {/* Back Button using GradientButton */}
      <GradientButton
        onClick={handleBack}
        isLoading={false} // Back button typically doesn't require a loading state
        disabled={false} // Enable the button
        loadingText="Going Back..." // Optional: Custom loading text if needed
        type="button"
      >
        BACK
      </GradientButton>
    </div>
  )
}

export default PaymentModalFiatThankYou
