// components/PaymentModalStockBrokerInfo.tsx

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDonation } from '../contexts/DonationContext'
import GradientButton from './GradientButton' // Import the GradientButton component
import Button from './Button'

export default function PaymentModalStockBrokerInfo() {
  const { state, dispatch } = useDonation()

  type Broker = {
    id: string
    name: string
    label: string
  }

  const [brokers, setBrokers] = useState<Broker[]>([])
  const [selectedBroker, setSelectedBroker] = useState('')
  const [selectedBrokerLabel, setSelectedBrokerLabel] = useState('')
  const [brokerageAccountNumber, setbrokerageAccountNumber] = useState('')
  const [brokerContactName, setBrokerContactName] = useState('')
  const [brokerEmail, setBrokerEmail] = useState('')
  const [brokerPhone, setBrokerPhone] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the list of supported brokers
    const fetchBrokers = async () => {
      try {
        const response = await axios.get('/api/getBrokersList')
        // console.log('response: ', response)
        setBrokers(response.data.data.brokers)
      } catch (error) {
        console.error('Error fetching brokers:', error)
      }
    }

    fetchBrokers()
  }, [])

  const handleBrokerChange = (e) => {
    const selectedBrokerName = e.target.value
    setSelectedBroker(selectedBrokerName)
    const broker = brokers.find((b) => b.name === selectedBrokerName)
    if (broker) {
      setSelectedBrokerLabel(broker.label)
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { brokerLabelName: broker.label },
      })
    }
  }

  useEffect(() => {
    // Enable continue button only when all required fields are filled
    setIsButtonDisabled(!selectedBroker || !brokerageAccountNumber)
  }, [selectedBroker, brokerageAccountNumber])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Dispatch broker information to context
    dispatch({
      type: 'SET_FORM_DATA',
      payload: {
        brokerName: selectedBroker,
        // TODO: Implmement brokerLabelName.
        // brokerLabelName:
        brokerageAccountNumber,
        brokerContactName,
        brokerEmail,
        brokerPhone,
      },
    })

    // Prepare data for API call
    const donationUuid = state.donationData.donationUuid // Assuming this is stored in the context
    if (!donationUuid) {
      setError('Donation UUID is missing')
      setLoading(false)
      return
    }

    dispatch({ type: 'SET_FORM_DATA', payload: { donationUuid } })

    const payload = {
      donationUuid,
      brokerName: selectedBroker,
      brokerageAccountNumber,
      brokerContactName,
      brokerEmail,
      brokerPhone,
    }

    try {
      const response = await axios.post('/api/submitStockDonation', payload)
      // console.log('Stock donation submitted:', response.data)

      // Proceed to the next step
      dispatch({ type: 'SET_STEP', payload: 'sign' })
    } catch (error) {
      console.error('Error submitting stock donation:', error)
      setError(`Error submitting stock donation: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-0 md:p-8">
      <h2 className="font-space-grotesk text-[30px] font-[600] text-[#000]">
        Broker Information
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="broker-firm" className="text-[16px]text-[#000]">
            Delivering Broker Firm<span className="text-red-600">*</span>
          </label>
          <select
            id="broker-firm"
            value={selectedBroker}
            onChange={handleBrokerChange}
            required
            className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2"
          >
            <option value="">Select a broker</option>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.name}>
                {/* This is the value we want to capture as part of the todo */}
                {broker.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="broker-account-number"
            className="text-[16px]text-[#000]"
          >
            Brokerage Account Number<span className="text-red-600">*</span>
          </label>
          <input
            id="broker-account-number"
            type="text"
            value={brokerageAccountNumber}
            onChange={(e) => setbrokerageAccountNumber(e.target.value)}
            required
            className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2"
          />
        </div>
        <div>
          <label
            htmlFor="broker-contact-name"
            className="text-[16px]text-[#000]"
          >
            Broker Contact Name
          </label>
          <input
            id="broker-contact-name"
            type="text"
            value={brokerContactName}
            onChange={(e) => setBrokerContactName(e.target.value)}
            className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2"
          />
        </div>
        <div>
          <label htmlFor="broker-email" className="text-[16px]text-[#000]">
            Broker Email
          </label>
          <input
            id="broker-email"
            type="email"
            value={brokerEmail}
            onChange={(e) => setBrokerEmail(e.target.value)}
            className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2"
          />
        </div>
        <div>
          <label htmlFor="broker-phone" className="text-[16px]text-[#000]">
            Broker Phone
          </label>
          <input
            id="broker-phone"
            type="tel"
            value={brokerPhone}
            onChange={(e) => setBrokerPhone(e.target.value)}
            className="w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2"
          />
        </div>
        <div className="flex justify-between space-x-2 pt-8 !font-space-grotesk !text-xl">
          <Button
            variant="secondary"
            onClick={() =>
              dispatch({ type: 'SET_STEP', payload: 'personalInfo' })
            }
            className="w-1/3 "
          >
            BACK
          </Button>
          {/* Use the GradientButton Component */}
          <GradientButton
            type="submit"
            isLoading={loading}
            disabled={isButtonDisabled}
            loadingText="Processing"
          >
            CONTINUE
          </GradientButton>
        </div>
      </form>
    </div>
  )
}
