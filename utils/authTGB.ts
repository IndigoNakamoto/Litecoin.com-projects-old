// utils/authTGB.ts
import axios from 'axios'
import prisma from '../lib/prisma'
import { addSeconds, isBefore } from 'date-fns'

interface TokenRecord {
  id: number
  accessToken: string
  refreshToken: string
  expiresAt: Date
  refreshedAt: Date
}

export async function getAccessToken(): Promise<string> {
  try {
    // Fetch the latest token from the database
    const token = await prisma.token.findFirst({
      orderBy: { refreshedAt: 'desc' },
    })

    if (token) {
      const now = new Date()

      if (isBefore(now, token.expiresAt)) {
        // Access token is still valid
        return token.accessToken
      } else {
        // Access token has expired, attempt to refresh
        return await refreshAccessToken(token.refreshToken)
      }
    } else {
      // No token exists, perform login to obtain tokens
      return await loginAndSaveTokens()
    }
  } catch (error) {
    console.error('Error in getAccessToken:', error)
    throw new Error('Unable to obtain access token')
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://public-api.tgbwidget.com/v1/refresh-tokens',
      {
        refreshToken,
      }
    )

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data.data

    const expiresAt = addSeconds(new Date(), 2 * 60 * 60) // Token valid for 2 hours

    // Upsert the new tokens into the database
    await prisma.token.upsert({
      where: { id: 1 }, // Assuming a single token record with id=1
      update: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt,
        refreshedAt: new Date(),
      },
      create: {
        id: 1,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt,
        refreshedAt: new Date(),
      },
    })

    return newAccessToken
  } catch (error: any) {
    console.error(
      'Error refreshing access token:',
      error.response?.data || error.message
    )
    // If refreshing fails, attempt to login again
    return await loginAndSaveTokens()
  }
}

async function loginAndSaveTokens(): Promise<string> {
  try {
    const response = await axios.post(
      'https://public-api.tgbwidget.com/v1/login',
      {
        login: process.env.GIVING_BLOCK_LOGIN,
        password: process.env.GIVING_BLOCK_PASSWORD,
      }
    )

    const { accessToken, refreshToken } = response.data.data

    const expiresAt = addSeconds(new Date(), 2 * 60 * 60) // Token valid for 2 hours

    // Upsert the tokens into the database
    await prisma.token.upsert({
      where: { id: 1 }, // Assuming a single token record with id=1
      update: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        refreshedAt: new Date(),
      },
      create: {
        id: 1,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        refreshedAt: new Date(),
      },
    })

    return accessToken
  } catch (error: any) {
    console.error(
      'Error logging in to get new tokens:',
      error.response?.data || error.message
    )
    throw new Error('Unable to obtain access token')
  }
}
