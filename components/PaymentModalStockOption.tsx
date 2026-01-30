// /components/PaymentModalStockOption.tsx

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchange } from '@fortawesome/free-solid-svg-icons'
import { useDonation } from '../contexts/DonationContext'

type Stock = {
  ticker: string
  name: string
}

export default function PaymentModalStockOption() {
  const { state, dispatch } = useDonation()
  const { formData } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [displayedStock, setDisplayedStock] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [tickerCost, setTickerCost] = useState(0)
  const [usdValue, setUsdValue] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLInputElement | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  // Persistent cache using useRef
  const cache = useRef<{ [key: string]: { tickers: Stock[]; count: number } }>(
    {}
  )

  // Fetch ticker cost when formData.assetSymbol changes
  useEffect(() => {
    if (formData.assetSymbol && formData.assetSymbol !== 'USD') {
      const stockDisplayName = formData.assetName
        ? `${formData.assetName} (${formData.assetSymbol})`
        : formData.assetSymbol

      setDisplayedStock(stockDisplayName)
      setSearchTerm('')
      setShowDropdown(false)
      fetchTickerCost(formData.assetSymbol)
    } else {
      setDisplayedStock('')
      setSearchTerm('')
      setShowDropdown(false)
    }
  }, [formData.assetSymbol, formData.assetName])

  // Update USD value when pledgeAmount or tickerCost changes
  useEffect(() => {
    if (formData.pledgeAmount && tickerCost) {
      setUsdValue(Number(formData.pledgeAmount) * tickerCost)
    }
  }, [formData.pledgeAmount, tickerCost])

  useEffect(() => {
    const MIN_SEARCH_LENGTH = 2

    if (searchTerm.length >= MIN_SEARCH_LENGTH && !displayedStock) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        const normalizedSearchTerm = searchTerm.toLowerCase()
        // Check if results are in cache
        if (cache.current[normalizedSearchTerm]) {
          setFilteredStocks(cache.current[normalizedSearchTerm].tickers)
          setTotalCount(cache.current[normalizedSearchTerm].count)
          setShowDropdown(true)
        } else {
          fetchStocks(searchTerm)
        }
      }, 250) // Adjust debounce time as needed
    } else {
      setFilteredStocks([])
      setShowDropdown(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm, displayedStock])

  const fetchStocks = async (query: string) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/getTickerList', {
        filters: {
          name: query,
          ticker: query,
        },
        pagination: {
          page: 1, // Modify if implementing infinite scroll or pagination
          itemsPerPage: 50,
        },
      })

      const { tickers, pagination: apiPagination } = response.data.data
      setFilteredStocks(tickers)
      setTotalCount(apiPagination.count)
      setShowDropdown(true)

      // Store results in cache
      const normalizedQuery = query.toLowerCase()
      cache.current[normalizedQuery] = {
        tickers,
        count: apiPagination.count,
      }
    } catch (error: any) {
      console.error(
        'Error fetching stocks:',
        error.response?.data || error.message
      )
      setFilteredStocks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const numQuantity = Number(formData.pledgeAmount)
    if (
      formData.assetSymbol &&
      !isNaN(numQuantity) &&
      numQuantity > 0 &&
      tickerCost > 0
    ) {
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false })
    } else {
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true })
    }
  }, [formData.assetSymbol, formData.pledgeAmount, tickerCost, dispatch])

  const fetchTickerCost = async (ticker: string) => {
    try {
      const response = await axios.get('/api/getTickerCost', {
        params: { ticker },
      })
      const { rate } = response.data.data
      setTickerCost(rate)
      const minimumQuantity = Math.ceil(500 / rate)

      const initialQuantity = formData.pledgeAmount
        ? Number(formData.pledgeAmount)
        : minimumQuantity

      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: initialQuantity.toString() },
      })
      setUsdValue(Number((initialQuantity * rate).toFixed(2)))
    } catch (error: any) {
      console.error(
        'Error fetching ticker cost:',
        error.response?.data || error.message
      )
      setTickerCost(0)
      setUsdValue(0)
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true })
    }
  }

  const handleStockSelect = (stock: Stock) => {
    const stockDisplayName = `${stock.name} (${stock.ticker})`
    setDisplayedStock(stockDisplayName)
    setSearchTerm('')
    dispatch({
      type: 'SET_FORM_DATA',
      payload: { assetSymbol: stock.ticker, assetName: stock.name },
    })
    // Removed fetchTickerCost from here as it's handled in useEffect
    setShowDropdown(false)
    // Enable donate button based on validation
    dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false })
  }

  const roundUpToNearestCent = (value: number) => {
    return Math.ceil(value * 100) / 100
  }

  const handleQuantityChange = (value: string) => {
    const numQuantity = Math.floor(Number(value))
    dispatch({
      type: 'SET_FORM_DATA',
      payload: { pledgeAmount: numQuantity.toString() },
    })

    if (
      !isNaN(numQuantity) &&
      numQuantity > 0 &&
      formData.assetSymbol &&
      tickerCost > 0
    ) {
      const newUsdValue = roundUpToNearestCent(numQuantity * tickerCost)
      setUsdValue(newUsdValue)
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false })
    } else {
      setUsdValue(0)
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true })
    }
  }

  const validateQuantity = () => {
    const numQuantity = Math.floor(Number(formData.pledgeAmount))
    const minimumQuantity = Math.ceil(500 / tickerCost)

    if (isNaN(numQuantity) || numQuantity < minimumQuantity) {
      const adjustedQuantity = minimumQuantity.toString()
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: adjustedQuantity },
      })
      setUsdValue(roundUpToNearestCent(minimumQuantity * tickerCost))
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true })
    } else {
      const newUsdValue = roundUpToNearestCent(numQuantity * tickerCost)
      setUsdValue(newUsdValue)
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: numQuantity.toString() },
      })
      dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) =>
          prev < filteredStocks.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredStocks.length) {
          handleStockSelect(filteredStocks[highlightedIndex])
        }
        break
      case 'Tab':
        if (filteredStocks.length > 0) {
          e.preventDefault()
          setHighlightedIndex(0)
          setShowDropdown(true)
        }
        break
      default:
        break
    }
  }

  return (
    <div className="relative flex w-full flex-col space-y-3 pt-5">
      <input
        type="text"
        name="stock"
        value={displayedStock || searchTerm || ''}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setDisplayedStock('')
          dispatch({
            type: 'SET_FORM_DATA',
            payload: { assetSymbol: '', assetName: '', pledgeAmount: '' },
          })
          setShowDropdown(true)
          setFilteredStocks([])
          dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true })
        }}
        placeholder="Search for a stock name or ticker"
        className="flex w-full rounded-lg border-[#222222] bg-[#f0f0f0] p-2 text-left font-space-grotesk font-semibold text-[#222222]"
        onFocus={() => {
          if (!displayedStock) {
            setShowDropdown(true)
          }
        }}
        onKeyDown={handleKeyDown}
        required
        ref={dropdownRef}
      />
      {showDropdown && filteredStocks.length > 0 && (
        <ul
          className="absolute top-12 max-h-56 w-full overflow-y-auto rounded-lg border border-[#222222] bg-[#f0f0f0] text-[#222222]"
          style={{ zIndex: 10 }}
        >
          {filteredStocks.map((stock, index) => (
            <li
              key={stock.ticker}
              onClick={() => handleStockSelect(stock)}
              onKeyDown={(e) => e.key === 'Enter' && handleStockSelect(stock)}
              role="option"
              tabIndex={0}
              className={`flex w-full cursor-pointer items-center p-2 text-left text-[#222222] hover:bg-gray-400 ${
                highlightedIndex === index ? 'bg-gray-300' : ''
              }`}
            >
              {stock.name} ({stock.ticker})
            </li>
          ))}
          {!loading && filteredStocks.length >= totalCount && (
            <li className="w-full p-2 text-center text-[#222222]">
              No more results
            </li>
          )}
          {loading && (
            <li className="w-full p-2 text-center text-[#222222]">
              Loading...
            </li>
          )}
        </ul>
      )}

      {formData.assetSymbol && (
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row justify-between pt-4">
            <div className="flex items-center overflow-hidden rounded-3xl border border-[#222222] bg-[#222222] pl-2">
              <div className="flex h-12 w-24 items-center justify-center bg-[#222222]">
                <h1 className="font-space-grotesk text-lg font-semibold text-white">
                  {formData.assetSymbol || 'STK'}
                </h1>
              </div>
              <input
                type="text"
                className="h-full w-40 border-none bg-[#c6d3d6] text-center font-space-grotesk text-lg font-black"
                value={formData.pledgeAmount || ''}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={validateQuantity}
                min={1}
                required
              />
            </div>

            <FontAwesomeIcon icon={faExchange} className="m-auto h-10 px-3" />

            <div className="flex overflow-hidden rounded-3xl border border-[#222222]">
              <div className="flex h-12 w-24 items-center justify-center bg-[#222222]">
                <h1 className="font-space-grotesk text-lg font-semibold text-[#f2f2f2]">
                  USD
                </h1>
              </div>
              <input
                type="number"
                className="w-36 border-none bg-[#c6d3d6] text-center font-space-grotesk text-lg font-black"
                value={usdValue}
                disabled // Disable user input for USD
              />
            </div>
          </div>
          <p className="text-right text-sm text-gray-500">
            Minimum donation is $500
          </p>
        </div>
      )}
    </div>
  )
}
