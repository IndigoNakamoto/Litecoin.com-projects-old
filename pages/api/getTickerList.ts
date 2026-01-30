import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosResponse } from 'axios'
import { getAccessToken } from '../../utils/authTGB'

type TickerResponse = {
  data: {
    tickers: { name: string; ticker: string }[]
    pagination: {
      count: number
      page: number
      itemsPerPage: number
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { filters, pagination } = req.body

  if (!pagination) {
    return res.status(400).json({ error: 'Pagination is required' })
  }

  const { name, ticker } = filters || {}

  if (!name && !ticker) {
    return res
      .status(400)
      .json({ error: 'Please provide a filter, either name or ticker.' })
  }

  try {
    const accessToken = await getAccessToken() // Retrieve The Giving Block access token

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Function to make requests to The Giving Block API
    const fetchTickers = async (filter: {
      name?: string
      ticker?: string
    }): Promise<AxiosResponse<TickerResponse>> => {
      return axios.post<TickerResponse>(
        'https://public-api.tgbwidget.com/v1/stocks/tickers',
        {
          filters: filter,
          pagination: {
            page: pagination.page || 1,
            itemsPerPage: pagination.itemsPerPage || 50,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // If both name and ticker are provided, make separate requests
    const promises: Promise<AxiosResponse<TickerResponse>>[] = []
    if (name) {
      promises.push(fetchTickers({ name }))
    }

    if (ticker) {
      promises.push(fetchTickers({ ticker }))
    }

    // Execute both requests (if applicable)
    const results = await Promise.all(promises)

    // Combine results into a set to avoid duplicates
    const tickersSet = new Set<string>()
    const combinedTickers: { name: string; ticker: string }[] = []

    results.forEach((response) => {
      response.data.data.tickers.forEach((tickerObj) => {
        const uniqueKey = `${tickerObj.name}-${tickerObj.ticker}`
        if (!tickersSet.has(uniqueKey)) {
          tickersSet.add(uniqueKey)
          combinedTickers.push(tickerObj)
        }
      })
    })

    // Send the relevant data in the response
    res.status(200).json({
      data: {
        tickers: combinedTickers,
        pagination: {
          count: combinedTickers.length, // Return the number of unique results
          page: pagination.page,
          itemsPerPage: pagination.itemsPerPage,
        },
      },
    })
  } catch (error: any) {
    console.error(
      'Error fetching ticker list:',
      error.response?.data || error.message
    )
    res
      .status(500)
      .json({ error: error.response?.data || 'Internal Server Error' })
  }
}
