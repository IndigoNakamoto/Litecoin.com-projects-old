// components/SectionContributors.tsx

import React, { useEffect, useState, useCallback } from 'react'
import ContributorCard from './ContributorCard' // Adjust the import path
import ContributorCardProps from './ContributorCard' // Import the Contributor interface

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function SectionContributors() {
  const [contributors, setContributors] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContributors = useCallback(async () => {
    try {
      const response = await fetch('/api/getContributors')
      if (!response.ok) {
        throw new Error('Failed to fetch contributors')
      }
      const data: any[] = await response.json()
      const shuffledContributors = shuffleArray(data) // Shuffle the data
      setContributors(shuffledContributors)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contributors:', error)
      setError('Failed to load contributors.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContributors()
  }, [fetchContributors])

  return (
    <div className="m-auto flex h-full w-full max-w-[1300px] flex-col items-center justify-center ">
      {loading && <p>Loading contributors...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="contributors-list grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {contributors.map((contributor) => (
          <ContributorCard key={contributor.id} contributor={contributor} />
        ))}
      </div>
    </div>
  )
}

export default SectionContributors
