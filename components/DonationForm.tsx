//components/DonationForm.tsx
import { useEffect, useRef, useState } from 'react'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'
import { signIn, signOut, useSession } from 'next-auth/react'
import X from './social-icons/x.svg'
import Link from './Link'

// Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core'
import Image from 'next/image'
import { customImageLoader } from '../utils/customImageLoader'

import '@fortawesome/fontawesome-svg-core/styles.css'
import React from 'react'
config.autoAddCss = false
// const EMAIL_REGEX = /^$|^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/
const EMAIL_REGEX = /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const TWITTER_USERNAME_REGEX = /^(?:[a-zA-Z0-9_]+)?$/

type DonationStepsProps = {
  projectNamePretty: string
  projectSlug: string
}

const DonationSteps: React.FC<DonationStepsProps> = ({
  // projectNamePretty,
  projectSlug,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [twitter, setTwitter] = useState('')

  const [deductable, setDeductable] = useState('no')

  const [isHovered, setIsHovered] = useState(false)

  const [readyToPayBTC, setReadyToPayBTC] = useState(false)

  const [btcPayLoading, setBtcpayLoading] = useState(false)

  const formRef = useRef<HTMLFormElement | null>(null)

  // States for input validation
  const [emailError, setEmailError] = useState('')
  const [twitterError, setTwitterError] = useState('')

  // Email validation
  const validateEmail = (value: string): boolean => {
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Invalid email address')
      return false
    }
    setEmailError('')
    return true
  }

  // Twitter validation
  const validateTwitter = (value: string): boolean => {
    if (!TWITTER_USERNAME_REGEX.test(value)) {
      setTwitterError('Invalid username. Only a-z, 0-9 and _ are allowed.')
      return false
    }
    setTwitterError('')
    return true
  }

  // Form validation
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(email)
    const isTwitterValid = validateTwitter(twitter)
    const isNameOrDeductibleValid = true
    return isEmailValid && isTwitterValid && isNameOrDeductibleValid
  }

  useEffect(() => {
    return setReadyToPayBTC(validateForm())
  }, [deductable, twitter, email, name])

  async function handleBtcPay() {
    const validity = formRef.current?.checkValidity()
    if (!validity) {
      return
    }
    setBtcpayLoading(true)
    try {
      const payload = {
        project_slug: projectSlug,
      }

      if (name) {
        Object.assign(payload, { name })
      }

      if (email) {
        Object.assign(payload, { email })
      }

      if (twitter) {
        Object.assign(payload, { twitter: `www.twitter.com/${twitter}` })
      }

      const data = await fetchPostJSON(`/api/btcpay`, payload)
      if (data.checkoutLink) {
        window.location.assign(data.checkoutLink)
      } else if (data.message) {
        throw new Error(data.message)
      } else {
        throw new Error('Something went wrong with BtcPay Server checkout.')
      }
    } catch (e) {
      console.error(e)
    }
    setBtcpayLoading(false)
  }
  const { data: session } = useSession()
  useEffect(() => {
    if (session) {
      setTwitter(session.user.username)
    }
  }, [session])

  return (
    <form
      ref={formRef}
      className="z-10 flex flex-col gap-4 font-barlow-semi-condensed"
      onSubmit={(e) => e.preventDefault()}
    >
      <section className="flex flex-col gap-1">
        <div className="mb-4">
          <h3>
            Name <span className="text-sm  text-gray-600 ">(Optional)</span>
          </h3>
          <input
            type="text"
            placeholder={'Satoshi Lite'}
            required={deductable === 'yes'}
            onChange={(e) => setName(e.target.value)}
            className=" mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></input>
        </div>
        <div className="mb-4">
          <h3>
            Email <span className="text-sm  text-gray-600 ">(Optional)</span>
          </h3>
          <input
            type="email"
            placeholder={`donate@litecoin.com`}
            className={` mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
              emailError ? 'border-red-500' : ''
            }`}
            required={deductable === 'yes'}
            onChange={(e) => {
              setEmail(e.target.value.trim())
            }}
            onBlur={(e) => {
              validateEmail(e.target.value)
            }}
          ></input>
          {emailError && (
            <div className="mt-0">
              <small className="text-red-500">{emailError}</small>
            </div>
          )}
        </div>
        <div className="mb-4">
          <h3 className="mb-1">
            {/* TODO: display X logo */}X
            <span className="ml-1 text-sm  text-gray-600 ">
              (Optional: Your X profile will be publicly shared as a community
              supporter for this project)
            </span>
          </h3>
          {!session ? (
            <button className="twitter" onClick={() => signIn('twitter')}>
              Continue with X
            </button>
          ) : (
            <div className="flex items-center">
              <Image
                // Use the custom loader
                loader={customImageLoader}
                src={session.user.image}
                alt={session.user.name}
                width={45}
                height={45}
                className="rounded-full"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
              <div className="ml-2 flex items-center">
                <div className="m-0 p-0">
                  <h4 className="text-md font-bold text-gray-600 ">
                    {session.user.name}
                  </h4>
                  <h4 className="text-md  text-gray-600 ">
                    @{session.user.username}
                  </h4>
                </div>
                <button className="twitter" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* <section className="border-t pt-4"> */}
      {/* <h3 className="mb-2 font-semibold text-gray-500 dark:text-gray-300">
          Donation Information
        </h3>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          <strong>15% service fee:</strong> A 15% service fee to enhance our
          operational capability.
        </p>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          <strong>Tax Deductibility:</strong> Donations are currently not tax
          deductible. Lite.space is registered under The Litecoin Foundation in
          Singapore (UEN: 201709179W). For US citizens considering donations
          over $5,000, please{' '}
          <a
            href="mailto:support@lite.space"
            className="font-semibold text-blue-600 dark:text-blue-400"
          >
            contact us
          </a>{' '}
          for more information.
        </p> */}

      {/* </section> */}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          name="btcpay"
          onClick={handleBtcPay}
          className="pay transition-colors duration-200"
          disabled={!readyToPayBTC || btcPayLoading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {btcPayLoading ? (
            <Spinner />
          ) : (
            <Image
              src={
                isHovered
                  ? '/litecoin-svg/coin-white.svg'
                  : '/litecoin-svg/coin-white.svg'
              }
              alt="Litecoin"
              width={32}
              height={32}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          )}
          <span className="whitespace-nowrap text-2xl">
            Donate with Litecoin
          </span>
        </button>
      </div>
      <p className="mb-2 text-sm text-gray-500 ">
        By donating, you agree to the{' '}
        <Link href="/terms" className="text-blue-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-blue-300">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}

export default DonationSteps
