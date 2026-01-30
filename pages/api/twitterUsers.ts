// /pages/api/twitterUsers.ts
import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { kv } from '@vercel/kv'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { usernames, clearCache } = req.query
  console.log('\n \n api/twitterUsers')

  if (!usernames) {
    return res.status(400).json({ error: 'Usernames parameter is required' })
  }

  const usernamesStr = Array.isArray(usernames)
    ? usernames.join(',')
    : usernames
  const cacheKey = `twitterUsers:${usernamesStr}`

  try {
    if (clearCache) {
      await kv.del(cacheKey)
    }

    // Retrieve from KV
    const cachedData = await kv.get<string>(cacheKey)
    let users = cachedData ? JSON.parse(cachedData) : null

    if (!users) {
      const endpoint = `https://api.twitter.com/2/users/by?usernames=${usernamesStr}&user.fields=profile_image_url`
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      })

      users = response.data.data.map((obj) => ({
        name: obj.name,
        screen_name: obj.username,
        profile_image_url_https: obj.profile_image_url,
      }))

      // Store JSON-serialized users with a TTL (e.g., 1 hour)
      await kv.set(cacheKey, JSON.stringify(users), { ex: 3600 })
    }

    res.status(200).json(users)
  } catch (error: any) {
    if (error.response) {
      console.error('Error data:', error.response.data)
      console.error('Error status:', error.response.status)
      console.error('Error headers:', error.response.headers)
    } else if (error.request) {
      console.error('Error request:', error.request)
    } else {
      console.error('Error message:', error.message)
    }
    console.error('Error config:', error.config)

    res.status(500).json({
      error: 'Failed to fetch Twitter user data',
      message: error.message,
      details: error.response?.data || error.request || error.message,
    })
  }
}

export default handler
