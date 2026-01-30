import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { useDonation } from '../contexts/DonationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEraser } from '@fortawesome/free-solid-svg-icons'
import GradientButton from './GradientButton' // Import the GradientButton component
import Button from './Button'

export default function PaymentModalStockDonorSignature({ onContinue }) {
  const { state, dispatch } = useDonation()
  const signaturePadRef = useRef<SignatureCanvas | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canvasWidth, setCanvasWidth] = useState(445) // Initial width
  const [canvasHeight, setCanvasHeight] = useState(200) // You can also make height responsive if needed

  // Function to update canvas width based on parent container
  const updateCanvasSize = () => {
    if (containerRef.current) {
      const parentWidth = containerRef.current.clientWidth
      // Set canvas width to 100% of parent width minus padding/margins if necessary
      setCanvasWidth(parentWidth)
      // Optionally adjust height based on aspect ratio or other logic
      // setCanvasHeight(parentWidth * (200 / 445)) // Example: maintain aspect ratio
    }
  }

  useEffect(() => {
    updateCanvasSize()

    // Create a ResizeObserver to watch for changes in the container's size
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
      setIsButtonDisabled(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const signature = signaturePadRef.current
      ? signaturePadRef.current.toDataURL('image/png')
      : ''

    if (signature) {
      setIsSubmitting(true)
      try {
        const response = await fetch('/api/signStockDonation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donationUuid: state.formData.donationUuid,
            date: new Date().toISOString(),
            signature: signature,
          }),
        })

        dispatch({
          type: 'SET_FORM_DATA',
          payload: {
            signatureDate: new Date().toISOString(),
            signatureImage: signature,
          },
        })

        const data = await response.json()

        if (data?.data?.isSuccess) {
          onContinue()
        } else {
          console.error('Error in API response:', data)
        }
      } catch (error) {
        console.error('Error signing donation:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleEnd = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setIsButtonDisabled(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-8">
      <h2 className="font-space-grotesk text-[30px] font-[600] text-[#000]">
        Signature
      </h2>
      <p className="flex items-center text-[16px] text-gray-600">
        By signing your donation request electronically, you consent to the
        terms and acknowledge the disclaimer
        <span className="relative ml-1 inline-block">
          {/* Group hover class applied to this container */}
          <span className="group cursor-pointer text-blue-500">
            (?) {/* This is the element that triggers the hover */}
            <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-72 -translate-x-[90%] rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
              By signing my donation request electronically, I hereby consent to
              contracting electronically and agree that such signature will be
              legally equivalent to a manual paper signature. I consent to
              having the donation request information I provided compiled
              together with this signature into the broker-specific required
              forms. I acknowledge that I will later receive a record of this
              form and have the ability to maintain my own records of the same,
              whether in digital or hard-copy form. If you have any questions,
              please reach out to{' '}
              <a
                href="mailto:support@thegivingblock.com"
                className="text-blue-500 underline"
              >
                support@thegivingblock.com
              </a>
              .
            </span>
          </span>
        </span>
      </p>
      <div className="relative" ref={containerRef}>
        <SignatureCanvas
          ref={signaturePadRef}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: canvasHeight,
            className:
              'w-full h-auto sigCanvas border border-gray-300 rounded-lg shadow-sm',
          }}
          onEnd={handleEnd}
        />
        <FontAwesomeIcon
          icon={faEraser}
          className="absolute bottom-2 right-2 h-6 w-6 cursor-pointer text-black hover:text-blue-600"
          onClick={handleClear}
        />
      </div>
      <div className="flex justify-between space-x-2 pt-8">
        <Button
          onClick={() =>
            dispatch({ type: 'SET_STEP', payload: 'stockBrokerInfo' })
          }
          className="w-1/3"
          variant="secondary"
        >
          Back
        </Button>
        <GradientButton
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isButtonDisabled || isSubmitting}
          backgroundColor="#222222"
          textColor="#f0f0f0"
          loadingText="Submitting"
        >
          Sign & Continue
        </GradientButton>
      </div>
    </div>
  )
}
