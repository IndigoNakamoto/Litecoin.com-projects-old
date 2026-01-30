import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from './Link'
import Head from 'next/head'

type Donor = {
  isAnonymous: boolean
  firstName?: string
  lastName?: string
  socialX?: string
  socialFacebook?: string
  socialLinkedIn?: string
}

function extractTwitterUsername(url: string): string | null {
  if (!url) return null

  url = url.trim()

  if (url.startsWith('@')) {
    return url.substring(1)
  }

  if (
    url.startsWith('twitter.com') ||
    url.startsWith('www.twitter.com') ||
    url.startsWith('x.com') ||
    url.startsWith('www.x.com')
  ) {
    url = 'https://' + url
  }

  if (!url.includes('/') && !url.includes(' ')) {
    return url
  }

  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : 'https://' + url)
    const hostname = parsedUrl.hostname.toLowerCase()
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const pathname = parsedUrl.pathname
      const parts = pathname.split('/')
      for (const part of parts) {
        if (part) {
          // console.log('Extracted username:', part)
          return part
        }
      }
    }
  } catch (e) {
    // console.error('Error parsing URL:', url, e)
    return null
  }

  return null
}

const SectionDonors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch('/api/getProcessedDonations')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // console.log('Fetched donors:', data)
        setDonors(data)
      } catch (error) {
        // console.error('Error fetching donors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonors()
  }, [])

  useEffect(() => {
    // Preload first 3 images
    donors.slice(0, 3).forEach((donor) => {
      const username = extractTwitterUsername(donor.socialX || '')
      if (username) {
        const img = document.createElement('img')
        img.src = `https://unavatar.io/twitter/${username}`
      }
    })
  }, [donors])

  if (loading) {
    return <div>Loading donors...</div>
  }

  // Use a Set to track unique images
  const uniqueUsernames = new Set<string>()

  return (
    <div className="m-auto flex h-full w-full max-w-[1300px] flex-col items-center justify-center">
      {/* <h1 className="m-8 font-space-grotesk text-4xl font-semibold leading-[32px] tracking-wide">
        Donors
      </h1> */}
      <div className="contributors-list grid w-full grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {donors.map((donor, index) => {
          const username = extractTwitterUsername(donor.socialX || '')
          if (!username || uniqueUsernames.has(username)) {
            return null // Skip duplicates or invalid usernames
          }

          uniqueUsernames.add(username)

          const imageUrl = username
            ? `https://unavatar.io/twitter/${username}`
            : '/images/design/chikun.jpeg'

          const profileLink = username ? `https://x.com/${username}` : '#'

          return (
            <div
              className="group relative flex aspect-square items-center justify-center overflow-hidden transition-transform duration-300 focus:outline-none group-hover:scale-105"
              key={username} // Use username as key if unique
            >
              {/* Preload only the first 3 images */}
              {index < 3 && (
                <Head>
                  <link rel="preload" as="image" href={imageUrl} />
                </Head>
              )}
              <Link href={profileLink} className="">
                <Image
                  src={
                    imageError[username]
                      ? '/images/design/chikun.jpeg'
                      : imageUrl
                  }
                  alt={username || 'Default avatar'}
                  className="rounded-full object-cover p-1 transition-transform duration-300 group-hover:scale-105"
                  width={128} // specify desired width
                  height={128} // specify desired height
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  onError={() => {
                    setImageError((prev) => ({
                      ...prev,
                      [username || 'default']: true,
                    }))
                  }}
                />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SectionDonors
