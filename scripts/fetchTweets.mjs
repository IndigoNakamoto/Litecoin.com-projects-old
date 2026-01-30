import needle from 'needle'
import fs from 'fs'
import { exec } from 'child_process'

import dotenv from 'dotenv'
dotenv.config()

const fetchTweetsByHashtag = async (hashtag) => {
  const bearerToken =
    'AAAAAAAAAAAAAAAAAAAAAGKzXwEAAAAAepiSSyK3gA4XnuXxuNQkSPMsJyE%3DPrIyeQdG0d7spVUf6tuUMjATZ0y3ElNOwmI8Jc7zMSRvR9jyBV'

  const endpointUrl = 'https://api.twitter.com/2/tweets/search/recent'
  const params = {
    query: `${hashtag} -is:retweet`,
    'tweet.fields': 'id',
  }

  const headers = {
    'User-Agent': 'v2RecentSearchJS',
    Authorization: `Bearer ${bearerToken}`,
  }

  const response = await needle('get', endpointUrl, params, {
    headers: headers,
  })
  if (response.statusCode === 200) {
    const tweetsData = response.body
    // console.log(`Full Twitter response for ${hashtag}:`, tweetsData) // Made a small correction here for better logging

    if (tweetsData && tweetsData.data) {
      return tweetsData.data.map((tweet) => tweet.id)
    } else {
      console.warn(`No tweets found for hashtag: ${hashtag}`)
      return [] // Return empty array if no tweets are found
    }
  } else {
    console.error('Error details:', response.body)
    throw new Error('Failed to fetch tweets')
  }
}

const main = async () => {
  try {
    const hashtags = [
      'mweb ltc',
      'litecoinfam',
      'paywithlitecoin',
      'ltc ordinal',
      'LitecoinCore',
    ] // Add your desired hashtags here
    let tweets = {}

    for (let hashtag of hashtags) {
      tweets[hashtag] = await fetchTweetsByHashtag(hashtag)
    }

    fs.writeFileSync('./tweets.json', JSON.stringify(tweets, null, 2))

    // Pushing to git
    exec(
      'git add . && git commit -m "Updated tweets data" && git push origin master',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }
        // console.log(`stdout: ${stdout}`)
        // console.log(`stderr: ${stderr}`)
      }
    )
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
