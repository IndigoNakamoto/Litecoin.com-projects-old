// components/PaymentModalCryptoOption.tsx

import React, { useState, useRef, useEffect } from 'react'
import { SiBitcoin, SiLitecoin, SiDogecoin } from 'react-icons/si'
import { useDonation } from '../contexts/DonationContext'
import Image from 'next/image'
import { customImageLoader } from '../utils/customImageLoader'
import ConversionRateCalculator from './ConversionRateCalculator'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import Button from './Button'

type Currency = {
  code: string
  name: string
  minDonation: number
  imageUrl: string
  isErc20?: boolean
}

const excludedCoins = ['XRP'] // Add more names or codes as needed

interface PaymentModalCryptoOptionProps {
  onCurrencySelect: (
    currencyCode: string,
    amount: number,
    rateInfo: { rate: number }
  ) => void
}

export default function PaymentModalCryptoOption({
  onCurrencySelect,
}: PaymentModalCryptoOptionProps) {
  const { state, dispatch } = useDonation()
  const { currencyList, selectedCurrencyCode, selectedCurrencyName } = state

  // Local State Variables
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle Currency Selection
  const handleCurrencySelect = (coin: string) => {
    const currency = currencyList.find((c) => c.name === coin)
    if (currency) {
      dispatch({
        type: 'SET_SELECTED_CURRENCY',
        payload: { code: currency.code, name: currency.name },
      })
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { assetName: currency.name, assetSymbol: currency.code },
      })
      setSearchTerm('') // Clear search term after selection
      setShowDropdown(false)

      // Ensure the donate button is enabled after valid selection
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false })
    }
  }

  // Handle Key Down Events for Dropdown Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredOptions = currencyList.filter(
      (currency) =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !excludedCoins.includes(currency.name)
    )

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleCurrencySelect(filteredOptions[highlightedIndex].name)
        }
        break
      case 'Tab':
        if (filteredOptions.length > 0) {
          e.preventDefault()
          setHighlightedIndex(0)
          setShowDropdown(true)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
      default:
        break
    }
  }

  // Filter currency options based on search term and exclusion list
  const filteredOptions: Currency[] = currencyList
    .filter(
      (currency) =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !excludedCoins.includes(currency.name)
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Find selected currency data for display
  // const selectedCurrencyData = currencyList.find(
  //   (currency) => currency.code === selectedCurrencyCode
  // )

  // Effect to handle clicks outside the dropdown and input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
      }
    }

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={dropdownRef} className="flex w-full flex-col gap-4 pt-5">
      {/* Currency Selection Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Bitcoin Button */}
        <Button
          onClick={() => handleCurrencySelect('Bitcoin')}
          icon={<SiBitcoin className="h-6 w-6" />} // Icon without 'mr-2'
          variant={selectedCurrencyName === 'Bitcoin' ? 'primary' : 'secondary'}
          className={`order-2 h-12 w-full`}
        >
          BITCOIN
        </Button>

        {/* Litecoin Button */}
        <Button
          onClick={() => handleCurrencySelect('Litecoin')}
          icon={<SiLitecoin className="h-6 w-6" />} // Icon without 'mr-2'
          variant={
            selectedCurrencyName === 'Litecoin' ? 'primary' : 'secondary'
          }
          className={`order-1 h-12 w-full`}
        >
          LITECOIN
        </Button>

        {/* Dogecoin Button */}
        <Button
          onClick={() => handleCurrencySelect('Dogecoin')}
          icon={<SiDogecoin className="h-6 w-6" />} // Icon without 'mr-2'
          variant={
            selectedCurrencyName === 'Dogecoin' ? 'primary' : 'secondary'
          }
          className={`order-3 h-12 w-full`}
        >
          DOGECOIN
        </Button>
      </div>

      {/* Search and Dropdown */}
      <div className="relative flex w-full space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={
            isFocused
              ? searchTerm
              : ['Bitcoin', 'Litecoin', 'Dogecoin'].includes(
                  selectedCurrencyName || ''
                )
              ? ''
              : selectedCurrencyName || ''
          }
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowDropdown(true)
          }}
          placeholder="Search for a coin"
          className={`flex w-full rounded-xl border-[#222222] text-center ${
            !['Bitcoin', 'Litecoin', 'Dogecoin'].includes(
              selectedCurrencyName || ''
            )
              ? 'bg-[#222222] text-[#ffffff]'
              : 'bg-[#f0f0f0] text-[#222222]'
          } p-2 text-left font-space-grotesk text-[16px]`}
          onClick={() => setShowDropdown((prev) => !prev)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        />

        {/* Chevron Icon */}
        <div
          role="button"
          tabIndex={0}
          className="absolute right-3 top-1/4 -translate-y-1/2 transform cursor-pointer focus:outline-none"
          onClick={() => setShowDropdown((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowDropdown((prev) => !prev)
            }
          }}
          aria-label={showDropdown ? 'Close dropdown' : 'Open dropdown'}
        >
          {showDropdown ? (
            <FaChevronUp
              className={searchTerm ? 'text-[#222222]' : 'text-[#f0f0f0]'}
            />
          ) : (
            <FaChevronDown
              className={searchTerm ? 'text-[#222222]' : 'text-[#f0f0f0]'}
            />
          )}
        </div>

        {showDropdown && filteredOptions.length > 0 && (
          <ul
            className="absolute top-12 max-h-56 w-full overflow-y-auto rounded-lg border border-[#222222] bg-[#222222] text-white"
            style={{ zIndex: 10 }}
          >
            {filteredOptions.map((option, index) => (
              <button
                key={option.code}
                onClick={() => handleCurrencySelect(option.name)}
                className={`flex w-full cursor-pointer items-center p-2 text-left hover:bg-[#333333] ${
                  highlightedIndex === index ? 'bg-gray-300' : ''
                }`}
              >
                <Image
                  loader={customImageLoader}
                  src={option.imageUrl}
                  alt={option.name}
                  width={24}
                  height={24}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
                <span className="pl-2">
                  {option.name} {option.isErc20 && <span>(ERC-20)</span>}
                </span>
              </button>
            ))}
          </ul>
        )}
      </div>

      {/* Conversion Rate Calculator */}
      <ConversionRateCalculator
        selectedCurrencyCode={selectedCurrencyCode || undefined}
        selectedCurrencyName={selectedCurrencyName || undefined}
        onCurrencySelect={onCurrencySelect}
      />
    </div>
  )
}
