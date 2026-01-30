// components/PaymentModalCryptoDonate.tsx

import React, { useState, useCallback } from 'react'
import { useDonation } from '../contexts/DonationContext'
import { QRCodeSVG } from 'qrcode.react'
import { FaRegCopy } from 'react-icons/fa6'
import Image from 'next/image'
import Button from './Button'

interface PaymentModalCryptoDonateProps {
  onRequestClose: () => void
}

const PaymentModalCryptoDonate: React.FC<PaymentModalCryptoDonateProps> = ({
  onRequestClose,
}) => {
  const { state, dispatch } = useDonation()

  const depositAddress = state.donationData?.depositAddress || ''
  const pledgeAmount = state.formData?.pledgeAmount || ''
  const pledgeCurrency = state.formData?.assetName || ''
  const qrCode = state.donationData?.qrCode || ''

  const [copied, setCopied] = useState<{ address: boolean; amount: boolean }>({
    address: false,
    amount: false,
  })

  const formatPledgeAmount = (amount: string) => {
    // Ensure the amount has exactly 8 decimal places
    let formattedAmount = parseFloat(amount).toFixed(8)

    // Insert spaces after the first two and fifth decimal places
    formattedAmount = formattedAmount.replace(
      /^(\d+\.\d{2})(\d{3})(\d{3})$/,
      '$1 $2 $3'
    )

    return formattedAmount
  }

  const handleDone = useCallback(() => {
    dispatch({ type: 'RESET_DONATION_STATE' })
    onRequestClose()
  }, [dispatch, onRequestClose])

  const handleCopy = useCallback(
    (type: 'address' | 'amount') => {
      const textToCopy = type === 'address' ? depositAddress : pledgeAmount
      navigator.clipboard.writeText(textToCopy)
      setCopied((prev) => ({ ...prev, [type]: true }))

      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 3000)
    },
    [depositAddress, pledgeAmount]
  )

  const qrCodeCurrencies = ['bitcoin', 'litecoin', 'dogecoin']

  let qrValue = depositAddress
  if (qrCodeCurrencies.includes(pledgeCurrency.toLowerCase())) {
    qrValue = `${pledgeCurrency.toLowerCase()}:${depositAddress}?amount=${pledgeAmount}`
  }

  const CopyableField = ({
    text,
    copiedText,
    isCopied,
    onCopy,
  }: {
    text: string
    copiedText: string
    isCopied: boolean
    onCopy: () => void
  }) => (
    <div
      className="flex w-full cursor-pointer flex-row justify-between rounded-lg border border-[#000] bg-[#f2f2f2] p-4"
      role="button"
      tabIndex={0}
      onClick={onCopy}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCopy()
        }
      }}
    >
      <p
        className={`text-md break-all font-semibold text-[#000] transition-opacity duration-300 ${
          isCopied ? 'opacity-100' : 'opacity-100'
        }`}
      >
        {isCopied ? copiedText : text}
      </p>
      <span>
        <FaRegCopy />
      </span>
    </div>
  )

  // Update the relevant line in the component to format the pledgeAmount
  const formattedPledgeAmount = formatPledgeAmount(pledgeAmount)

  return (
    <div className="flex items-center justify-center">
      <div className="my-auto flex flex-col items-center justify-center space-y-4 p-0 md:p-8">
        <h2 className="font-space-grotesk text-[30px] font-[600] text-[#000]">
          Complete Your Donation
        </h2>
        <hr className="border-t-1 w-full border-gray-400" />
        <p className="text-[#000]">
          Please send your donation to the following address:
        </p>

        {qrCodeCurrencies.includes(pledgeCurrency.toLowerCase()) ? (
          <>
            <QRCodeSVG
              value={qrValue}
              size={256}
              bgColor="#000"
              fgColor="#f2f2f2"
            />
            {/* NEW REMINDER MESSAGE */}
            <p className="mt-2 text-sm font-semibold text-[#000]">
              IMPORTANT: Please only send exactly {formattedPledgeAmount}{' '}
              {pledgeCurrency}. Sending a different amount could cause issues
              when verifying your donation.
            </p>
          </>
        ) : qrCode ? (
          <>
            <Image
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code"
              width={256}
              height={256}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            {/* NEW REMINDER MESSAGE */}
            <p className="mt-2 text-sm font-semibold text-[#000]">
              IMPORTANT: Please only send exactly {formattedPledgeAmount}{' '}
              {pledgeCurrency}. Sending a different amount could cause issues
              when verifying your donation.
            </p>
          </>
        ) : null}

        <CopyableField
          text={depositAddress}
          copiedText="Address copied to clipboard!"
          isCopied={copied.address}
          onCopy={() => handleCopy('address')}
        />
        <CopyableField
          text={formattedPledgeAmount}
          copiedText="Amount copied to clipboard!"
          isCopied={copied.amount}
          onCopy={() => handleCopy('amount')}
        />

        <Button onClick={handleDone} className="mt-4 h-12 w-full">
          DONE
        </Button>
        <p className="mt-4 text-[16px] text-[#000]">
          You will receive an email confirmation once your transaction is
          settled. Thank you for your generous support!
        </p>
      </div>
    </div>
  )
}

export default PaymentModalCryptoDonate
