// components/PaymentModalFiatOption.js
import React, { useState, useRef, useEffect } from 'react'
import { useDonation } from '../contexts/DonationContext'
import Button from './Button'

export default function PaymentModalFiatOption() {
  const { state, dispatch } = useDonation()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100) // Default amount
  const [customAmount, setCustomAmount] = useState('')
  const [coverFees, setCoverFees] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const minDonation = 10 // Minimum donation amount in USD
  const buttonValues = [50, 100, 250, 500, 1000, 2500]

  // Check if the current amount is below the minimum donation
  const isBelowMin =
    (selectedAmount !== null && selectedAmount < minDonation) ||
    (customAmount !== '' &&
      (!parseFloat(customAmount) || parseFloat(customAmount) < minDonation))

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setCoverFees(false)
    // Update the formData with the correct pledgeAmount and selectedCurrency
    dispatch({
      type: 'SET_FORM_DATA',
      payload: { pledgeAmount: amount.toString(), pledgeCurrency: 'USD' },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow empty or partial input, including decimals like "50."
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setCustomAmount(value)
      setSelectedAmount(null) // Reset selectedAmount as user is entering a custom value
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: value, pledgeCurrency: 'USD' },
      })
    }
  }

  const handleInputBlur = () => {
    if (customAmount !== '') {
      const numericValue = parseFloat(customAmount)

      if (!isNaN(numericValue)) {
        // Format to two decimal places
        const formattedAmount = numericValue.toFixed(2)

        // Check if the formatted amount matches any predefined button value
        const matchingAmount = buttonValues.find(
          (value) => value === parseFloat(formattedAmount)
        )

        if (matchingAmount) {
          setSelectedAmount(matchingAmount)
          setCustomAmount('') // Clear customAmount since a predefined button is selected
          dispatch({
            type: 'SET_FORM_DATA',
            payload: {
              pledgeAmount: matchingAmount.toString(),
              pledgeCurrency: 'USD',
            },
          })
        } else {
          setCustomAmount(formattedAmount)
          setSelectedAmount(null) // No matching predefined amount
          dispatch({
            type: 'SET_FORM_DATA',
            payload: { pledgeAmount: formattedAmount, pledgeCurrency: 'USD' },
          })
        }
      } else {
        // Handle non-numeric input if necessary
        setCustomAmount('')
        setSelectedAmount(null)
        dispatch({
          type: 'SET_FORM_DATA',
          payload: { pledgeAmount: '', pledgeCurrency: 'USD' },
        })
      }
    } else {
      // If customAmount is cleared, you might want to reset selectedAmount or keep it as is
      // Here, we keep selectedAmount as is to maintain the current selection
    }
  }

  const handleCoverFeesChange = () => {
    setCoverFees((prev) => !prev)
    if (!coverFees && inputRef.current) {
      const baseAmount = parseFloat(customAmount) || selectedAmount || 0
      const totalAmount = (baseAmount * 1.030928).toFixed(2)
      setCustomAmount(totalAmount)
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: totalAmount, pledgeCurrency: 'USD' },
      }) // Adjust for fees
    } else if (coverFees && inputRef.current) {
      const baseAmount = parseFloat(customAmount) / 1.030928
      setCustomAmount(baseAmount.toFixed(2))
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: baseAmount.toFixed(2), pledgeCurrency: 'USD' },
      }) // Revert fees
    }
  }

  // Add useEffect to dispatch initial pledgeAmount
  useEffect(() => {
    if (selectedAmount !== null) {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: {
          pledgeAmount: selectedAmount.toString(),
          pledgeCurrency: 'USD',
        },
      })
    }
  }, [selectedAmount, dispatch])

  const displayAmount =
    customAmount || (selectedAmount !== null ? selectedAmount.toFixed(2) : '')

  const isCustomAmount =
    !buttonValues.includes(Number(displayAmount)) && customAmount !== ''

  // **New useEffect to handle Donate button disabled state**
  useEffect(() => {
    const disableDonate =
      isBelowMin || (customAmount === '' && selectedAmount === null)
    dispatch({
      type: 'SET_DONATE_BUTTON_DISABLED',
      payload: disableDonate,
    })
  }, [isBelowMin, customAmount, selectedAmount, dispatch])

  return (
    <div className="flex w-full flex-col gap-4 pt-5">
      <div className="flex h-full w-full justify-between space-x-6 pt-6">
        {buttonValues.slice(0, 3).map((value) => (
          <Button
            key={value}
            onClick={() => handleAmountClick(value)}
            variant={selectedAmount === value ? 'primary' : 'secondary'}
            className="h-[50px] w-[24vw]"
          >
            ${value}
          </Button>
        ))}
      </div>
      <div className="flex h-full w-full justify-between space-x-6">
        {buttonValues.slice(3).map((value) => (
          <Button
            key={value}
            onClick={() => handleAmountClick(value)}
            variant={selectedAmount === value ? 'primary' : 'secondary'}
            className="h-[50px] w-[24vw]"
          >
            ${value}
          </Button>
        ))}
      </div>
      <div className="relative w-full">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-[600] ${
            isCustomAmount
              ? !isBelowMin
                ? 'text-[#f0f0f0]'
                : 'text-gray-600'
              : 'text-[#222222]'
          }`}
        >
          $
        </span>
        <input
          type="number"
          ref={inputRef}
          className={`w-full appearance-none rounded-3xl border pl-8 pr-4 text-[14px] font-[600] 
      ${
        isCustomAmount
          ? !isBelowMin
            ? 'border-[#222222] bg-[#222222] text-[#f0f0f0]' // Valid custom input
            : 'border-gray-400 bg-[#f0f0f0] text-gray-600' // Below minimum or invalid input
          : 'border-[#222222] bg-[#f0f0f0] text-[#222222]' // Default predefined styles
      }`}
          value={displayAmount}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          step="0.01"
          min="0"
          style={{ paddingLeft: '2rem' }}
        />
      </div>
      {customAmount === '' && selectedAmount === null ? (
        <p className="-mt-3 text-sm font-semibold text-red-500">
          Please enter a valid donation amount.
        </p>
      ) : isBelowMin ? (
        <p className="-mt-3 text-sm font-semibold text-red-500">
          Minimum donation is {minDonation.toFixed(2)} USD
        </p>
      ) : (
        <p className="-mt-3 text-sm text-gray-600">
          Minimum donation is {minDonation.toFixed(2)} USD
        </p>
      )}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={coverFees}
          onChange={handleCoverFeesChange}
          className="h-4 w-4 border border-[#000] bg-[#f0f0f0]"
          id="cover-transaction-fees"
        />
        <label
          htmlFor="cover-transaction-fees"
          className="flex items-center text-[14px] text-[#000]"
        >
          Cover transaction fees
          <span className="group relative ml-1">
            (?)
            <span className="absolute z-10 mt-2 w-64 rounded border border-white bg-gray-700 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Make your impact go even further by covering the processing fees
              of this donation
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}
