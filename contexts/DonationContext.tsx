// contexts/DonationContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import axios from 'axios'

type Currency = {
  id: string
  name: string
  code: string
  imageUrl: string
  isErc20: boolean
  network: string
  minDonation: number
}

// Define the structure of formData
type FormData = {
  firstName: string
  lastName: string
  receiptEmail: string
  addressLine1: string
  addressLine2: string
  country: string
  state: string
  city: string
  zipcode: string
  phoneNumber: string
  assetName: string
  assetSymbol: string // For stock donations
  pledgeAmount: string // For fiat, stock, and crypto donations
  pledgeCurrency: string // For crypto donations (e.g., "BTC")
  isAnonymous: boolean // Common field for all types
  taxReceipt: boolean // Common field for all types
  pledgeId: string // For charging fiat donation
  cardToken: string // For charging fiat donation
  donationUuid: string // For stock donations
  brokerName: string // for stock donations
  brokerLabelName: string // for stock donations
  brokerageAccountNumber: string // For stock donations
  brokerContactName: string // For stock donations
  brokerEmail: string // For stock donations
  brokerPhone: string // For stock donations
  signatureDate: string // For signing stock donations
  signatureImage: string // For signing stock donations
  joinMailingList: boolean
  socialXUseSession: boolean // Add this line
  socialX: string
  socialXimageSrc: string
  socialFacebook: string
  socialLinkedIn: string
}

type DonationData = {
  pledgeId?: string
  depositAddress?: string
  qrCode?: string
  donationUuid?: string
  // Add other fields as needed
}

type DonationState = {
  selectedOption: 'crypto' | 'fiat' | 'stock'
  selectedCurrency: string | null
  selectedCurrencyPledged: string | null
  currentStep:
    | 'payment' // parent
    | 'personalInfo'
    | 'cryptoDonate' // option select crypto and amount
    | 'fiatDonate' // option select amount
    | 'complete' // fiat thank you
    | 'stockBrokerInfo' // stock broker info
    | 'sign' // stock sign
    | 'thankYou' // stock thank you
  currencyRates: { rate: number } | null
  donationData: DonationData
  projectSlug: string
  currencyList: Currency[]
  projectTitle: string
  image: string
  isDonateButtonDisabled: boolean
  formData: FormData // Include formData in the DonationState
  // New state properties for persisting selected currency and inputs
  selectedCurrencyCode: string | null
  selectedCurrencyName: string | null
  usdInput: string
  cryptoInput: string
}

type Action =
  | { type: 'SET_OPTION'; payload: 'crypto' | 'fiat' | 'stock' }
  | { type: 'SET_CURRENCY_LIST'; payload: Currency[] }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_PLEDGED_AMOUNT'; payload: string }
  | {
      type: 'SET_STEP'
      payload:
        | 'payment'
        | 'personalInfo'
        | 'cryptoDonate'
        | 'fiatDonate'
        | 'complete'
        | 'stockBrokerInfo'
        | 'sign'
        | 'thankYou'
    }
  | { type: 'SET_RATES'; payload: { rate: number } }
  | { type: 'SET_DONATION_DATA'; payload: Partial<DonationData> }
  | {
      type: 'SET_PROJECT_DETAILS'
      payload: { slug: string; title: string; image: string }
    }
  | { type: 'RESET_DONATION_STATE' }
  | { type: 'SET_DONATE_BUTTON_DISABLED'; payload: boolean }
  | { type: 'SET_FORM_DATA'; payload: Partial<FormData> }
  // New actions for persisting selected currency and inputs
  | { type: 'SET_SELECTED_CURRENCY'; payload: { code: string; name: string } }
  | { type: 'SET_USD_INPUT'; payload: string }
  | { type: 'SET_CRYPTO_INPUT'; payload: string }

const initialState: DonationState = {
  selectedOption: 'crypto',
  selectedCurrency: null,
  selectedCurrencyPledged: null,
  currentStep: 'payment',
  projectSlug: '',
  projectTitle: '',
  currencyList: [],
  image: '',
  currencyRates: null,
  donationData: {},
  isDonateButtonDisabled: true,
  formData: {
    firstName: '',
    lastName: '',
    receiptEmail: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    zipcode: '',
    phoneNumber: '',
    assetName: '',
    assetSymbol: '',
    pledgeAmount: '',
    pledgeCurrency: '',
    isAnonymous: false,
    taxReceipt: true,
    pledgeId: '',
    cardToken: '',
    donationUuid: '',
    brokerName: '',
    brokerLabelName: '',
    brokerageAccountNumber: '',
    brokerContactName: '',
    brokerEmail: '',
    brokerPhone: '',
    signatureDate: '',
    signatureImage: '',
    joinMailingList: false,
    socialXUseSession: true,
    socialX: '',
    socialXimageSrc: '',
    socialFacebook: '',
    socialLinkedIn: '',
  },
  // Initialize new state properties
  selectedCurrencyCode: 'LTC',
  selectedCurrencyName: 'Litecoin',
  usdInput: '0',
  cryptoInput: '0',
}

const DonationContext = createContext<{
  state: DonationState
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => null,
})

const donationReducer = (
  state: DonationState,
  action: Action
): DonationState => {
  switch (action.type) {
    case 'SET_OPTION':
      return {
        ...state,
        selectedOption: action.payload,
        isDonateButtonDisabled: true,
      }
    case 'SET_CURRENCY_LIST':
      return { ...state, currencyList: action.payload }
    case 'SET_CURRENCY':
      return { ...state, selectedCurrency: action.payload }
    case 'SET_PLEDGED_AMOUNT':
      return { ...state, selectedCurrencyPledged: action.payload }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_RATES':
      return { ...state, currencyRates: action.payload }
    case 'SET_DONATION_DATA':
      return {
        ...state,
        donationData: { ...state.donationData, ...action.payload },
      }
    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } }
    case 'SET_PROJECT_DETAILS':
      return {
        ...state,
        projectSlug: action.payload.slug,
        projectTitle: action.payload.title,
        image: action.payload.image,
      }
    case 'SET_DONATE_BUTTON_DISABLED':
      return { ...state, isDonateButtonDisabled: action.payload }
    case 'RESET_DONATION_STATE':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('donationState')
      }
      return {
        ...initialState,
        currencyList: state.currencyList, // Preserve currencyList
        projectSlug: state.projectSlug,
        projectTitle: state.projectTitle,
        selectedCurrency: 'LTC', // Reset selected currency
        selectedCurrencyCode: 'LTC', // Reset currency code
        selectedCurrencyName: 'Litecoin', // Reset currency name
        usdInput: '0', // Reset USD input
        cryptoInput: '0', // Reset crypto input
        image: state.image,
      }
    // New cases for persisting selected currency and inputs
    case 'SET_SELECTED_CURRENCY':
      return {
        ...state,
        selectedCurrencyCode: action.payload.code,
        selectedCurrencyName: action.payload.name,
      }
    case 'SET_USD_INPUT':
      return {
        ...state,
        usdInput: action.payload,
      }
    case 'SET_CRYPTO_INPUT':
      return {
        ...state,
        cryptoInput: action.payload,
      }
    default:
      return state
  }
}

interface DonationProviderProps {
  children: React.ReactNode
}

export const DonationProvider: React.FC<DonationProviderProps> = ({
  children,
}) => {
  const initializer = (initialValue: DonationState) => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('donationState')
      return savedState ? JSON.parse(savedState) : initialValue
    }
    return initialValue
  }
  const [state, dispatch] = useReducer(
    donationReducer,
    initialState,
    initializer
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('donationState', JSON.stringify(state))
    }
  }, [state])

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await axios.post('/api/postCurrenciesList', {})
      if (Array.isArray(response.data)) {
        dispatch({ type: 'SET_CURRENCY_LIST', payload: response.data })
        // console.log('Fetched currencies:', response.data)
      } else {
        throw new Error('Invalid currency list data')
      }
    } catch (err: any) {
      console.error(
        'Error fetching currencies:',
        err.response?.data || err.message
      )
    }
  }, [dispatch])

  // Fetch currencies on initial mount
  useEffect(() => {
    fetchCurrencies()
  }, [fetchCurrencies])

  return (
    <DonationContext.Provider value={{ state, dispatch }}>
      {children}
    </DonationContext.Provider>
  )
}

export const useDonation = () => {
  const context = useContext(DonationContext)
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider')
  }
  return context
}
