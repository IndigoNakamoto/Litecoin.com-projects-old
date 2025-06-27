// components/PaymentModalPersonalInfo.tsx

import React, { useState, useEffect } from 'react'
import { SiX } from 'react-icons/si'
import { useDonation } from '../contexts/DonationContext'
import Image from 'next/image'
import { countries } from './countries'
import { useSession } from 'next-auth/react'
import GradientButton from './GradientButton'
import Button from './Button'

type PaymentModalPersonalInfoProps = {
  onRequestClose: () => void
}

const PaymentModalPersonalInfo: React.FC<
  PaymentModalPersonalInfoProps
> = () => {
  const { state, dispatch } = useDonation()
  const { formData, projectSlug } = state
  const [isLoading, setIsLoading] = useState(false)

  const [donateAnonymously, setDonateAnonymously] = useState(
    formData.isAnonymous ?? false
  )
  const [needsTaxReceipt, setNeedsTaxReceipt] = useState(
    formData.taxReceipt ?? true
  )
  const [joinMailingList, setJoinMailingList] = useState(
    formData.joinMailingList ?? false
  )

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState(formData.country || '')
  const [focusedCountryIndex, setFocusedCountryIndex] = useState(-1)

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const [errors, setErrors] = useState<{
    receiptEmail?: string
    firstName?: string
    lastName?: string
    country?: string
    addressLine1?: string
    city?: string
    state?: string
    zipcode?: string
    phoneNumber?: string
  }>({})

  const { data: session } = useSession()

  const shouldShowAddressFields =
    (!donateAnonymously && state.selectedOption !== 'stock') ||
    state.selectedOption === 'stock'

  const validateField = (name: string, value: string | boolean): string => {
    const stringValue =
      typeof value === 'boolean' ? value.toString() : value.trim()

    // Conditions for required fields:
    const isEmailRequired =
      needsTaxReceipt ||
      joinMailingList ||
      (!needsTaxReceipt && !joinMailingList && !donateAnonymously)
    const isNameRequired =
      !donateAnonymously || state.selectedOption === 'stock'
    const isAddressRequired = shouldShowAddressFields
    const isPhoneRequired = state.selectedOption === 'stock'

    switch (name) {
      case 'receiptEmail':
        if (isEmailRequired) {
          if (!stringValue) return 'Email is required.'
          if (!/^\S+@\S+\.\S+$/.test(stringValue))
            return 'Please enter a valid email address.'
        }
        return ''
      case 'firstName':
        if (isNameRequired && !stringValue) return 'First name is required.'
        return ''
      case 'lastName':
        if (isNameRequired && !stringValue) return 'Last name is required.'
        return ''
      case 'country':
        if (isAddressRequired && !stringValue) return 'Country is required.'
        return ''
      case 'addressLine1':
        if (isAddressRequired && !stringValue)
          return 'Street Address is required.'
        return ''
      case 'city':
        if (isAddressRequired && !stringValue) return 'City is required.'
        return ''
      case 'state':
        if (isAddressRequired && !stringValue) return 'State is required.'
        return ''
      case 'zipcode':
        if (isAddressRequired && !stringValue) return 'ZIP Code is required.'
        return ''
      case 'phoneNumber':
        if (isPhoneRequired && !stringValue) return 'Phone Number is required.'
        return ''
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // Determine which fields need validation:
    const fieldsToValidate: (keyof typeof formData)[] = []

    // Email
    fieldsToValidate.push('receiptEmail')

    // Names if required
    if (!donateAnonymously || state.selectedOption === 'stock') {
      fieldsToValidate.push('firstName', 'lastName')
    }

    // Address if required
    if (shouldShowAddressFields) {
      fieldsToValidate.push(
        'country',
        'addressLine1',
        'city',
        'state',
        'zipcode'
      )
    }

    // Phone if stock
    if (state.selectedOption === 'stock') {
      fieldsToValidate.push('phoneNumber')
    }

    fieldsToValidate.forEach((field) => {
      const val = formData[field] ?? ''
      const error = validateField(field, val)
      if (error) newErrors[field] = error
    })

    return newErrors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    dispatch({ type: 'SET_FORM_DATA', payload: { [name]: value } })

    // Clear error for this field if any
    if (errors[name as keyof typeof errors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }))
  }

  const handleCountrySelect = (country: string) => {
    dispatch({ type: 'SET_FORM_DATA', payload: { country } })
    setSearchTerm(country)
    setShowDropdown(false)
    setFocusedCountryIndex(-1)

    // Clear the country error after selection if any
    if (errors.country) {
      setErrors((prevErrors) => ({ ...prevErrors, country: '' }))
    }
  }

  const handleCountryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedCountryIndex((prevIndex) =>
          prevIndex < filteredCountries.length - 1 ? prevIndex + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedCountryIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredCountries.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (
          focusedCountryIndex >= 0 &&
          focusedCountryIndex < filteredCountries.length
        ) {
          handleCountrySelect(filteredCountries[focusedCountryIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
      default:
        break
    }
  }

  const handleDonateAnonymouslyChange = () => {
    const newValue = !donateAnonymously
    setDonateAnonymously(newValue)
    dispatch({ type: 'SET_FORM_DATA', payload: { isAnonymous: newValue } })

    // Clear relevant errors if going anonymous might relax some requirements
    if (errors.firstName || errors.lastName || errors.receiptEmail) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        firstName: '',
        lastName: '',
        receiptEmail: '',
      }))
    }
  }

  const handleNeedsTaxReceiptChange = () => {
    const newValue = !needsTaxReceipt
    setNeedsTaxReceipt(newValue)
    dispatch({ type: 'SET_FORM_DATA', payload: { taxReceipt: newValue } })

    // If tax receipt becomes optional and errors related to email exist, clear them if not required.
    // We'll let form-level validation handle correctness on submit.
  }

  useEffect(() => {
    setDonateAnonymously(formData.isAnonymous ?? false)
    setNeedsTaxReceipt(formData.taxReceipt ?? true)
    setJoinMailingList(formData.joinMailingList ?? false)
  }, [formData.isAnonymous, formData.taxReceipt, formData.joinMailingList])

  useEffect(() => {
    setFocusedCountryIndex(-1)
  }, [showDropdown, searchTerm])

  useEffect(() => {
    if (session && formData.socialXUseSession) {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: {
          socialX: session.user.username,
          socialXimageSrc: session.user.image,
        },
      })
    }
  }, [session, formData.socialXUseSession, dispatch])

  useEffect(() => {
    if (state.selectedOption === 'stock') {
      setDonateAnonymously(false)
      dispatch({ type: 'SET_FORM_DATA', payload: { isAnonymous: false } })
    }
  }, [state.selectedOption, dispatch])

  const isButtonDisabled = (() => {
    // Button disabled if any error exists or if required fields aren't filled correctly
    const noErrors = Object.values(errors).every((error) => error === '')
    if (!noErrors) return true

    // Double-check if all conditions are met (in case of fields that are empty but no error yet)
    const validationCheck = validateForm()
    return Object.keys(validationCheck).length > 0
  })()

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    dispatch({
      type: 'SET_DONATION_DATA',
      payload: {
        ...state.donationData,
        ...formData,
      },
    })

    const { selectedOption } = state

    let apiEndpoint = ''
    let apiBody = {}

    const anonInfo = {
      firstName: formData.firstName || 'Anonymous',
      lastName: formData.lastName || 'Donor',
      receiptEmail: formData.receiptEmail || 'anon@anon.com',
      addressLine1: 'N/A',
      addressLine2: 'N/A',
      country: 'N/A',
      state: 'N/A',
      city: 'N/A',
      zipcode: 'N/A',
    }

    if (selectedOption === 'fiat') {
      apiEndpoint = '/api/createFiatDonationPledge'
      apiBody = {
        projectSlug: projectSlug,
        organizationId: 1189134331,
        isAnonymous: donateAnonymously,
        pledgeCurrency: formData.pledgeCurrency,
        assetDescription: formData.assetName,
        pledgeAmount: formData.pledgeAmount,
        firstName: donateAnonymously ? anonInfo.firstName : formData.firstName,
        lastName: donateAnonymously ? anonInfo.lastName : formData.lastName,
        receiptEmail: donateAnonymously
          ? anonInfo.receiptEmail
          : formData.receiptEmail,
        addressLine1: donateAnonymously
          ? anonInfo.addressLine1
          : formData.addressLine1,
        addressLine2: formData.addressLine2,
        country: donateAnonymously ? anonInfo.country : formData.country,
        state: donateAnonymously ? anonInfo.state : formData.state,
        city: donateAnonymously ? anonInfo.city : formData.city,
        zipcode: donateAnonymously ? anonInfo.zipcode : formData.zipcode,
        taxReceipt: formData.taxReceipt,
        joinMailingList: formData.joinMailingList,
      }
    } else if (selectedOption === 'crypto') {
      apiEndpoint = '/api/createDepositAddress'
      apiBody = {
        projectSlug: projectSlug,
        organizationId: 1189134331,
        pledgeCurrency: formData.assetSymbol,
        pledgeAmount: formData.pledgeAmount,
        receiptEmail: donateAnonymously
          ? anonInfo.receiptEmail
          : formData.receiptEmail,
        firstName: donateAnonymously ? anonInfo.firstName : formData.firstName,
        lastName: donateAnonymously ? anonInfo.lastName : formData.lastName,
        addressLine1: donateAnonymously
          ? anonInfo.addressLine1
          : formData.addressLine1,
        addressLine2: donateAnonymously
          ? anonInfo.addressLine2
          : formData.addressLine2,
        country: donateAnonymously ? anonInfo.country : formData.country,
        state: donateAnonymously ? anonInfo.state : formData.state,
        city: donateAnonymously ? anonInfo.city : formData.city,
        zipcode: donateAnonymously ? anonInfo.zipcode : formData.zipcode,
        taxReceipt: formData.taxReceipt,
        isAnonymous: formData.isAnonymous,
        joinMailingList: formData.joinMailingList,
        socialX: formData.socialX,
        socialFacebook: formData.socialFacebook,
        socialLinkedIn: formData.socialLinkedIn,
      }
    } else if (selectedOption === 'stock') {
      apiEndpoint = '/api/createStockDonationPledge'
      apiBody = {
        organizationId: 1189134331,
        projectSlug: projectSlug,
        assetSymbol: formData.assetSymbol,
        assetDescription: formData.assetName,
        pledgeAmount: formData.pledgeAmount,
        receiptEmail: formData.receiptEmail,
        firstName: formData.firstName,
        lastName: formData.lastName,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zipcode: formData.zipcode,
        phoneNumber: formData.phoneNumber,
        taxReceipt: formData.taxReceipt,
        isAnonymous: formData.isAnonymous,
        joinMailingList: formData.joinMailingList,
        socialX: formData.socialX,
        socialFacebook: formData.socialFacebook,
        socialLinkedIn: formData.socialLinkedIn,
      }
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (selectedOption === 'fiat' && data?.pledgeId) {
          dispatch({
            type: 'SET_DONATION_DATA',
            payload: {
              ...state.donationData,
              pledgeId: data.pledgeId,
            },
          })
          dispatch({ type: 'SET_STEP', payload: 'fiatDonate' })
        } else if (selectedOption === 'crypto' && data?.depositAddress) {
          dispatch({
            type: 'SET_DONATION_DATA',
            payload: {
              ...state.donationData,
              depositAddress: data.depositAddress,
              qrCode: data.qrCode,
              ...state.formData,
            },
          })
          dispatch({ type: 'SET_STEP', payload: 'cryptoDonate' })
        } else if (selectedOption === 'stock' && data?.donationUuid) {
          dispatch({
            type: 'SET_DONATION_DATA',
            payload: {
              ...state.donationData,
              donationUuid: data.donationUuid,
            },
          })
          dispatch({ type: 'SET_STEP', payload: 'stockBrokerInfo' })
        } else {
          console.error(
            'Expected data (pledgeId, depositAddress, or donationUuid) missing in response',
            data
          )
        }
      } else {
        console.error(data.error)
      }
    } catch (error: any) {
      console.error('Error submitting pledge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const emailDescription =
    donateAnonymously && !needsTaxReceipt
      ? 'Please enter your email to receive a confirmation of your donation. We will use this email solely to notify you that your donation has been received.'
      : needsTaxReceipt
      ? 'Enter your email to receive a tax receipt.'
      : ''

  return (
    <div className="flex flex-col space-y-4 p-0 md:p-8">
      <h2 className="font-space-grotesk text-[30px] font-bold text-[#000]">
        Personal Information
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {state.selectedOption === 'stock' ? null : (
          <>
            <span className="block w-full border-t border-gray-400"></span>
            <div className="space-y-0">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={donateAnonymously}
                  onChange={handleDonateAnonymouslyChange}
                  className="h-4 w-4 border-[#222222] bg-[#f0f0f0]"
                  id="donate-anonymously"
                />
                <label htmlFor="donate-anonymously" className="text-[#000]">
                  Donate Anonymously
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={needsTaxReceipt}
                  onChange={handleNeedsTaxReceiptChange}
                  className="h-4 w-4 border-[#222222] bg-[#f0f0f0]"
                  id="tax-receipt"
                />
                <label htmlFor="tax-receipt" className="text-[#000]">
                  Request A Tax Receipt
                </label>
              </div>
              <p className="ml-10 text-[14px] text-black ">
                Provide your email to receive a confirmation of your donation
                and your tax receipt. This information will only be used to send
                you these documents.
              </p>
            </div>
          </>
        )}
        <span className="block w-full border-t border-gray-400 "></span>

        {/* EMAIL */}
        <div>
          <h2 className=" text-lg text-[#000]">
            Email
            {(needsTaxReceipt ||
              joinMailingList ||
              (!needsTaxReceipt && !joinMailingList && !donateAnonymously)) && (
              <span className="text-red-600">*</span>
            )}
            {!needsTaxReceipt && !joinMailingList && donateAnonymously && (
              <span className="text-sm">{` (Optional)`}</span>
            )}
          </h2>
          <p className="my-auto pb-1  text-sm text-gray-600">
            {emailDescription}
          </p>
          <input
            type="email"
            name="receiptEmail"
            placeholder="Email"
            value={formData.receiptEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg p-2  text-[#000] ${
              errors.receiptEmail
                ? 'border-1 border-red-600 '
                : 'border-[#222222] bg-[#f0f0f0]'
            }`}
            aria-invalid={errors.receiptEmail ? 'true' : 'false'}
            aria-describedby={errors.receiptEmail ? 'email-error' : undefined}
          />
          {errors.receiptEmail && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.receiptEmail}
            </p>
          )}
        </div>

        {/* PHONE NUMBER */}
        {state.selectedOption === 'stock' && (
          <div>
            <h2 className=" text-lg text-[#000]">
              Phone Number <span className="text-red-600">*</span>
            </h2>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2  text-[#000] ${
                errors.phoneNumber
                  ? 'border-1 border-red-600'
                  : 'border-[#222222] bg-[#f0f0f0]'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
            <div className=" mt-4 block w-full border-t border-gray-400 "></div>
          </div>
        )}

        {/* NAME */}
        <div>
          <h2 className=" text-lg text-[#000]">
            Name
            {(!donateAnonymously || state.selectedOption === 'stock') && (
              <span className="text-red-600">*</span>
            )}
            {donateAnonymously && state.selectedOption !== 'stock' && (
              <span className="text-sm">{` (Optional)`}</span>
            )}
          </h2>
          <div className="flex flex-row gap-x-2">
            <div className="w-full">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2  text-[#000] ${
                  errors.firstName
                    ? 'border-1 border-red-600'
                    : 'border-[#222222] bg-[#f0f0f0]'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div className="w-full">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2  text-[#000] ${
                  errors.lastName
                    ? 'border-1 border-red-600'
                    : 'border-[#222222] bg-[#f0f0f0]'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        {shouldShowAddressFields && (
          <div>
            <div className="flex flex-col gap-y-2">
              <h2 className=" text-lg text-[#000]">
                Address <span className="text-red-600">*</span>
              </h2>
              <div className="relative flex w-full flex-col space-y-3">
                <input
                  type="text"
                  name="country"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowDropdown(true)
                    if (errors.country) {
                      setErrors((prev) => ({ ...prev, country: '' }))
                    }
                  }}
                  onBlur={handleBlur}
                  placeholder="Search for a country"
                  className={`flex w-full rounded-lg p-2  text-[#000] ${
                    errors.country
                      ? 'border-1 border-red-600'
                      : 'border-[#222222] bg-[#f0f0f0]'
                  }`}
                  onFocus={() => {
                    setSearchTerm(formData.country || '')
                    setShowDropdown(true)
                  }}
                  onKeyDown={handleCountryKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={showDropdown}
                  aria-controls="country-listbox"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
                {showDropdown && filteredCountries.length > 0 && (
                  <ul
                    id="country-listbox"
                    role="listbox"
                    className="absolute top-12 max-h-56 w-full overflow-y-auto rounded-lg border border-[#222222] bg-[#f0f0f0] text-[#000]"
                    style={{ zIndex: 10 }}
                  >
                    {filteredCountries.map((country, index) => (
                      <button
                        key={country}
                        onClick={() => handleCountrySelect(country)}
                        role="option"
                        aria-selected={index === focusedCountryIndex}
                        className={`flex w-full cursor-pointer items-center p-2 text-left text-[#000] ${
                          index === focusedCountryIndex
                            ? 'bg-gray-400'
                            : 'hover:bg-gray-200'
                        }`}
                        onMouseEnter={() => setFocusedCountryIndex(index)}
                      >
                        {country}
                      </button>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full">
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Street Address 1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg p-2  text-[#000] ${
                    errors.addressLine1
                      ? 'border-1 border-red-600'
                      : 'border-[#222222] bg-[#f0f0f0]'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.addressLine1}
                  </p>
                )}
              </div>
              <input
                type="text"
                name="addressLine2"
                placeholder="Street Address 2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2  text-[#000]"
              />
              <div className="flex flex-row gap-x-2">
                <div className="w-full">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg p-2  text-[#000] ${
                      errors.city
                        ? 'border-1 border-red-600'
                        : 'border-[#222222] bg-[#f0f0f0]'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    name="state"
                    placeholder="State/Province/Region"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg p-2  text-[#000] ${
                      errors.state
                        ? 'border-1 border-red-600'
                        : 'border-[#222222] bg-[#f0f0f0]'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="ZIP/Postal Code"
                    value={formData.zipcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg p-2  text-[#000] ${
                      errors.zipcode
                        ? 'border-1 border-red-600'
                        : 'border-[#222222] bg-[#f0f0f0]'
                    }`}
                  />
                  {errors.zipcode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.zipcode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between space-x-2 pt-8">
          <Button
            className="w-1/3"
            variant="secondary"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'payment' })}
          >
            BACK
          </Button>
          <GradientButton
            isLoading={isLoading}
            disabled={isButtonDisabled}
            type="submit"
            loadingText="Processing.."
          >
            CONTINUE
          </GradientButton>
        </div>
      </form>
    </div>
  )
}

export default PaymentModalPersonalInfo
