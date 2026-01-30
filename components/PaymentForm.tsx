// components/PaymentForm.tsx
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { customImageLoader } from '../utils/customImageLoader'
import GradientButton from './GradientButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons'
import { SiLitecoin } from 'react-icons/si'
import { FaHandHoldingHeart } from 'react-icons/fa'

import PaymentModalCryptoDonate from './PaymentModalCryptoDonate'
import PaymentModalCryptoOption from './PaymentModalCryptoOption'
import PaymentModalFiatOption from './PaymentModalFiatOption'
import PaymentModalFiatDonate from './PaymentModalFiatDonate'
import PaymentModalFiatThankYou from './PaymentModalFiatThankYou'
import PaymentModalStockOption from './PaymentModalStockOption'
import PaymentModalPersonalInfo from './PaymentModalPersonalInfo'
import PaymentModalStockBrokerInfo from './PaymentModalStockBrokerInfo'
import PaymentModalStockDonorSignature from './PaymentModalStockDonorSignature'
import PaymentModalStockDonorThankYou from './PaymentModalStockDonorThankYou'
import Button from '@/components/Button'

import { ProjectItem } from '../utils/types'
import { useDonation } from '../contexts/DonationContext'

type PaymentFormProps = {
  project: ProjectItem | undefined
  onRequestClose?: () => void
  modal: boolean
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  project,
  onRequestClose,
  modal,
}) => {
  const { state, dispatch } = useDonation()
  const { projectSlug, projectTitle, image } = state
  const [widgetSnippet, setWidgetSnippet] = useState('')
  const [widgetError, setWidgetError] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (project?.slug === 'litecoin-foundation') {
      const fetchWidgetSnippet = async () => {
        try {
          const res = await fetch('/api/getWidgetSnippet')
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(
              `HTTP error! status: ${res.status} - ${
                errorData.error || res.statusText
              }`
            )
          }
          const data = await res.json()

          setWidgetSnippet(data.popup)

          // Parse and execute the script manually
          const parser = new DOMParser()
          const doc = parser.parseFromString(data.popup, 'text/html')
          const script = doc.querySelector('script')

          if (script) {
            const existingScript = document.getElementById(script.id)
            if (!existingScript) {
              const newScript = document.createElement('script')
              newScript.id = script.id
              newScript.innerHTML = script.innerHTML
              document.body.appendChild(newScript)
            }
          }
        } catch (error: any) {
          // Added type annotation for error
          console.error('Failed to fetch widget snippet:', error)
          setWidgetError(error.message)
        }
      }

      fetchWidgetSnippet()
    }
  }, [project])

  useEffect(() => {
    if (project) {
      if (
        projectSlug !== project.slug ||
        projectTitle !== project.title ||
        image !== project.coverImage
      ) {
        dispatch({
          type: 'SET_PROJECT_DETAILS',
          payload: {
            slug: project.slug,
            title: project.title,
            image: project.coverImage,
          },
        })
      }
    }
  }, [project, projectSlug, projectTitle, image])

  if (!project) {
    return <div />
  }

  const handleRequestClose =
    onRequestClose ||
    (() => {
      /* no-op */
    })

  const renderPaymentOption = () => {
    switch (state.selectedOption) {
      case 'crypto':
        return (
          <PaymentModalCryptoOption
            onCurrencySelect={(currency, value, rates) => {
              dispatch({ type: 'SET_CURRENCY', payload: currency })
              dispatch({
                type: 'SET_PLEDGED_AMOUNT',
                payload: value.toString(),
              })
              dispatch({ type: 'SET_RATES', payload: rates })
              dispatch({
                type: 'SET_FORM_DATA',
                payload: {
                  assetSymbol: currency,
                  pledgeCurrency: currency,
                  pledgeAmount: value.toString(),
                },
              })
            }}
          />
        )
      case 'fiat':
        return <PaymentModalFiatOption />
      case 'stock':
        return <PaymentModalStockOption />
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (state.currentStep) {
      case 'personalInfo':
        return <PaymentModalPersonalInfo onRequestClose={handleRequestClose} />
      case 'cryptoDonate':
        return <PaymentModalCryptoDonate onRequestClose={handleRequestClose} />
      case 'fiatDonate':
        return <PaymentModalFiatDonate />
      case 'complete':
        return <PaymentModalFiatThankYou onRequestClose={handleRequestClose} />
      case 'stockBrokerInfo':
        return <PaymentModalStockBrokerInfo />
      case 'sign':
        return (
          <PaymentModalStockDonorSignature
            onContinue={() =>
              dispatch({ type: 'SET_STEP', payload: 'thankYou' })
            }
          />
        )
      case 'thankYou':
        return (
          <PaymentModalStockDonorThankYou onRequestClose={handleRequestClose} />
        )
      case 'payment': // Explicitly handle 'payment' step
      default:
        return (
          <>
            {modal && (
              <div className="z-30 flex flex-col space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Image
                    loader={customImageLoader}
                    alt={project.title}
                    src={project.coverImage}
                    width={96}
                    height={96}
                    priority={true}
                    className="rounded-lg"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                    }}
                  />
                  <div className="flex flex-col">
                    <h3 className="font-sans text-[#222222]">Donate to</h3>
                    <h2 className="font-space-grotesk text-4xl font-semibold text-[#222222]">
                      {project.title}
                    </h2>
                    {project.title === 'The Litecoin Foundation' ? null : (
                      <h3 className="font-sans text-[#222222]">Project</h3>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex w-full flex-col justify-between space-y-4 pb-5 pt-6 ">
              {project.slug === 'litecoin-foundation' && widgetSnippet ? (
                <>
                  {/* First Row: Crypto and Card Buttons */}
                  <div className="flex justify-between space-x-3">
                    <div className="w-1/2">
                      <Button
                        moveOnHover={false}
                        onClick={() =>
                          dispatch({ type: 'SET_OPTION', payload: 'crypto' })
                        }
                        icon={<SiLitecoin className="h-6 w-6" />} // Adding the icon
                        variant={`${
                          state.selectedOption === 'crypto'
                            ? 'primary'
                            : 'secondary'
                        }`}
                        className={`block h-12 w-full`}
                      >
                        CRYPTO
                      </Button>
                    </div>

                    <div className="w-1/2">
                      <Button
                        moveOnHover={false}
                        onClick={() => {
                          dispatch({ type: 'SET_OPTION', payload: 'fiat' })
                          dispatch({
                            type: 'SET_FORM_DATA',
                            payload: {
                              pledgeAmount: '100',
                              pledgeCurrency: 'USD',
                            },
                          })
                          dispatch({
                            type: 'SET_DONATE_BUTTON_DISABLED',
                            payload: false,
                          })
                        }}
                        icon={
                          <FontAwesomeIcon
                            icon={faCreditCard}
                            className="h-6 w-6"
                          />
                        } // Adding the icon
                        variant={
                          state.selectedOption === 'fiat'
                            ? 'primary'
                            : 'secondary'
                        }
                        className={`block h-12 w-full`}
                      >
                        CARD
                      </Button>
                    </div>
                  </div>

                  {/* Second Row: widgetSnippet and Stock Button */}
                  <div className="flex justify-between space-x-3">
                    <div className="w-1/2">
                      <div className="flex w-full flex-row items-center justify-center gap-2 rounded-3xl border border-[#222222] text-xl font-bold">
                        {/* <FaHandHoldingHeart /> */}
                        <div
                          dangerouslySetInnerHTML={{ __html: widgetSnippet }}
                          className="h-full w-full"
                        />
                      </div>
                    </div>

                    <div className="w-1/2">
                      <Button
                        moveOnHover={false}
                        onClick={() => {
                          dispatch({ type: 'SET_OPTION', payload: 'stock' })
                          dispatch({
                            type: 'SET_FORM_DATA',
                            payload: {
                              assetSymbol: '',
                              assetName: '',
                              pledgeAmount: '',
                            },
                          })
                          dispatch({
                            type: 'SET_DONATE_BUTTON_DISABLED',
                            payload: true,
                          })
                        }}
                        icon={
                          <FontAwesomeIcon
                            icon={faArrowTrendUp}
                            className="h-6 w-6"
                          />
                        } // Adding the icon
                        variant={
                          state.selectedOption === 'stock'
                            ? 'primary'
                            : 'secondary'
                        }
                        className={`block h-12 w-full`}
                      >
                        STOCK
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Original Layout */}
                  <div className="flex justify-between space-x-3">
                    <div
                      className={`${
                        project.slug === 'litecoin-foundation'
                          ? 'w-1/2'
                          : 'w-full'
                      }`}
                    >
                      <Button
                        onClick={() =>
                          dispatch({ type: 'SET_OPTION', payload: 'crypto' })
                        }
                        icon={<SiLitecoin className="h-6 w-6" />} // Adding the icon
                        variant={`${
                          state.selectedOption === 'crypto'
                            ? 'primary'
                            : 'secondary'
                        }`}
                        className={`block w-full`}
                      >
                        {'CRYPTO'}
                      </Button>
                    </div>

                    {isMounted &&
                    project.slug === 'litecoin-foundation' &&
                    modal &&
                    !widgetError &&
                    widgetSnippet ? (
                      <div className="w-1/2">
                        <div className="flex w-full flex-row items-center justify-center gap-2 rounded-3xl border border-[#222222] text-xl font-bold">
                          <div
                            dangerouslySetInnerHTML={{ __html: widgetSnippet }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-between space-x-3">
                    <Button
                      onClick={() => {
                        dispatch({ type: 'SET_OPTION', payload: 'fiat' })
                        dispatch({
                          type: 'SET_FORM_DATA',
                          payload: {
                            pledgeAmount: '100',
                            pledgeCurrency: 'USD',
                          },
                        })
                        dispatch({
                          type: 'SET_DONATE_BUTTON_DISABLED',
                          payload: false,
                        })
                      }}
                      icon={
                        <FontAwesomeIcon
                          icon={faCreditCard}
                          className="h-6 w-6"
                        />
                      } // Adding the icon
                      variant={
                        state.selectedOption === 'fiat'
                          ? 'primary'
                          : 'secondary'
                      }
                      className={`w-full`}
                    >
                      CARD
                    </Button>

                    <Button
                      onClick={() => {
                        dispatch({ type: 'SET_OPTION', payload: 'stock' })
                        dispatch({
                          type: 'SET_FORM_DATA',
                          payload: {
                            assetSymbol: '',
                            assetName: '',
                            pledgeAmount: '',
                          },
                        })
                        dispatch({
                          type: 'SET_DONATE_BUTTON_DISABLED',
                          payload: true,
                        })
                      }}
                      icon={
                        <FontAwesomeIcon
                          icon={faArrowTrendUp}
                          className="h-6 w-6"
                        />
                      } // Adding the icon
                      variant={
                        state.selectedOption === 'stock'
                          ? 'primary'
                          : 'secondary'
                      }
                      className="w-full"
                    >
                      STOCK
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="pb-10">{renderPaymentOption()}</div>
            <GradientButton
              onClick={() =>
                dispatch({ type: 'SET_STEP', payload: 'personalInfo' })
              }
              isLoading={false}
              disabled={state.isDonateButtonDisabled}
              backgroundColor={
                state.isDonateButtonDisabled ? '#d1d5db' : '#222222'
              }
              textColor={state.isDonateButtonDisabled ? '#gray-800' : '#FFFFFF'}
            >
              DONATE
            </GradientButton>
          </>
        )
    }
  }

  return <div>{renderContent()}</div>
}

export default PaymentForm
