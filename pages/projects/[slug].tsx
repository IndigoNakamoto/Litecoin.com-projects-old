// pages/projects/[slug].tsx
import { FAQItem, Post, Update } from '../../utils/webflow'

import { useDonation } from '../../contexts/DonationContext'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import {
  getProjectBySlug,
  getProjectUpdatesBySlug,
  getContributorsByIds,
  getFAQsByProjectSlug,
  getPostsBySlug,
  getAllActiveContributors,
  getAllProjects,
} from '../../utils/webflow'
import {
  ProjectItem,
  ProjectCategory,
  AddressStats,
  BountyStatus,
  TwitterUser,
} from '../../utils/types'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const PaymentModal = dynamic(() => import('../../components/PaymentModal'), {
  ssr: false,
})
import ThankYouModal from '@/components/ThankYouModal'
import { fetchGetJSON } from '../../utils/api-helpers'
import SEOHead from '@/components/SEOHead'
import ProjectHeader from '@/components/ProjectHeader'
import ProjectMenu from '@/components/ProjectMenu'
import MenuSections from '@/components/MenuSections'
import AsideSection from '@/components/AsideSection'
import tweetsData from '../../data/tweets.json'
import React from 'react'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
  posts: object[]
  updates: object[]
  faqs: object[]
}

const Project: NextPage<SingleProjectPageProps> = ({
  project,
  updates,
  faqs,
  posts,
}) => {
  const { dispatch } = useDonation()
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(true) // Payment Modal
  const [isThankYouModalOpen, setThankYouModalOpen] = useState(false) // Thank you modal

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  // Project Data
  const {
    // Main Info
    slug,
    title,
    summary,
    socialSummary,
    coverImage,
    content,

    // Community Interaction
    contributor,
    contributorsBitcoin,
    contributorsLitecoin,
    advocates,
    hashtag,

    // Resources and Metadata
    website,

    // Links
    twitterHandle,
    gitRepository,
    discordLink,
    telegramLink,
    facebookLink,
    redditLink,

    // Funding
    bountyStatus,
    isRecurring,
    isBitcoinOlympics2024,
    serviceFeesCollected,
    isMatching,
    matchingMultiplier,
    recurringAmountGoal,
    totalPaid,
  } = project

  // Log coverImage when it changes
  useEffect(() => {
    // console.log('Project cover image: ', coverImage)
  }, [coverImage])

  // State Variables
  const [addressStats, setAddressStats] = useState<AddressStats>()
  const [matchingDonors, setMatchingDonors] = useState(undefined)
  const [twitterUsers, setTwitterUsers] = useState<TwitterUser[]>([])
  const [matchingTotal, setMatchingTotal] = useState(0)
  const [twitterContributors, setTwitterContributors] = useState<TwitterUser[]>(
    []
  )
  const [twitterContributorsBitcoin, setTwitterContributorsBitcoin] = useState<
    TwitterUser[]
  >([])
  const [twitterContributorsLitecoin, setTwitterContributorsLitecoin] =
    useState<TwitterUser[]>([])
  const [twitterAdvocates, setTwitterAdvocates] = useState<TwitterUser[]>([])

  const [faq, setFaq] = useState<any>({})
  const [faqCount, setFaqCount] = useState<number>(0)

  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [monthlyDonorCount, setMonthlyDonorCount] = useState(0)
  const [percentGoalCompleted, setPercentGoalCompleted] = useState(0)
  const [timeLeftInMonth, setTimeLeftInMonth] = useState(0)

  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(
    'Info'
  )
  const [selectedUpdateId, setSelectedUpdateId] = useState<number | null>(null)

  // Utility Functions
  const isValidUsernames = (usernames: string | undefined): boolean => {
    return typeof usernames === 'string' && usernames.trim().length > 0
  }

  function closeModal() {
    setModalOpen(false)
    setThankYouModalOpen(false)
    // Remove query parameters related to modal
    if (router.query.modal || router.query.thankyou || router.query.name) {
      const { modal, thankyou, name, ...newQuery } = router.query
      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      )
    }
  }

  function openPaymentModal() {
    setSelectedProject(project)
    setModalOpen(true)

    dispatch({
      type: 'SET_PROJECT_DETAILS',
      payload: {
        slug: project.slug,
        title: project.title,
        image: project.coverImage,
      },
    })

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, modal: 'true' },
      },
      undefined,
      { shallow: true }
    )
  }

  function openThankYouModal() {
    setSelectedProject(project)
    setThankYouModalOpen(true)
  }

  function extractUsername(url: string) {
    const regex = /\/([^/]+)$/
    const match = url.match(regex)
    return match ? match[1] : url
  }

  // Format function for USD
  function formatUSD(value) {
    const num = Number(value)

    if (isNaN(num) || value === '' || value === null) {
      return '0.00'
    }

    if (num === 0) {
      return '0.00'
    }

    // Format the number with two decimal places
    let [whole, fraction] = num.toFixed(1).split('.')
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    fraction = fraction + 0

    // Return formatted value with the fraction part
    return `${whole}.${fraction}`
  }

  // Format function for Lits
  function formatLits(value: any) {
    const num = Number(value)

    if (isNaN(num) || value === '' || value === null) {
      return '0'
    }

    if (num === 0) {
      return '0'
    }

    let [whole, fraction] = num.toFixed(8).split('.')
    whole += ''

    if (fraction && /^0+$/.test(fraction)) {
      return whole
    }

    if (fraction) {
      fraction =
        fraction.slice(0, 2) +
        ' ' +
        fraction.slice(2, 5) +
        ' ' +
        fraction.slice(5)
    }

    return fraction ? `${whole}.${fraction}` : whole
  }

  // Load FAQ data
  useEffect(() => {
    async function loadFAQData() {
      setFaqCount(faqs.length)
      setFaq(faqs)
    }

    loadFAQData()
  }, [faqs])

  // Fetch donations, contributors, and supporters
  useEffect(() => {
    const fetchData = async () => {
      setAddressStats(undefined)
      const stats = await fetchGetJSON(`/api/getInfoTGB?slug=${slug}`)
      setAddressStats(stats)

      const matchingDonors = await fetchGetJSON(
        `/api/matching-donors-by-project?slug=${slug}`
      )
      // console.log('matching donors', matchingDonors)

      setMatchingDonors(matchingDonors)

      // Matching goal calculation
      if (
        isMatching &&
        typeof matchingMultiplier === 'number' &&
        isBitcoinOlympics2024
      ) {
        const matchingTotalCalc =
          stats.funded_txo_sum * matchingMultiplier - stats.funded_txo_sum
        setMatchingTotal(matchingTotalCalc)
      }

      // Monthly goal calculation
      if (isRecurring && recurringAmountGoal) {
        const currentDate = new Date()
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        )
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        )

        const monthlyDonations = stats.donatedCreatedTime.filter(
          (donation: any) => {
            const donationDate = new Date(donation.createdTime * 1000)
            return donationDate >= startOfMonth && donationDate <= endOfMonth
          }
        )

        setMonthlyDonorCount(monthlyDonations.length)
        const monthlyTotalCalc = monthlyDonations.reduce(
          (total: number, donation: any) => total + Number(donation.amount),
          0
        )
        const percentGoalCompletedCalc =
          (monthlyTotalCalc / recurringAmountGoal) * 100

        setMonthlyTotal(monthlyTotalCalc)
        setPercentGoalCompleted(percentGoalCompletedCalc)

        const timeLeft = endOfMonth.getTime() - currentDate.getTime()
        const daysLeft = Math.ceil(timeLeft / (1000 * 3600 * 24))
        setTimeLeftInMonth(daysLeft)
      }
    }

    fetchData().catch(console.error)
  }, [
    contributor,
    contributorsBitcoin,
    contributorsLitecoin,
    advocates,
    slug,
    isMatching,
    matchingMultiplier,
    isBitcoinOlympics2024,
    isRecurring,
    recurringAmountGoal,
  ])

  // Handle opening modals based on query parameters
  useEffect(() => {
    if (router.query.thankyou === 'true') {
      openThankYouModal()
    }
  }, [router.query.thankyou])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search)
      const modal = query.get('modal')
      if (modal === 'true') {
        setModalOpen(true)
      } else {
        setModalOpen(false)
      }
    }
  }, [])

  // Handle selected menu item based on query parameters
  useEffect(() => {
    const menu = router.query.menu
    const updateId = router.query.updateId

    const selectedMenu = Array.isArray(menu) ? menu[0] : menu

    if (selectedMenu) {
      setSelectedMenuItem(selectedMenu)
    } else {
      setSelectedMenuItem('Info')
    }

    if (updateId) {
      setSelectedUpdateId(Number(updateId))
      if (selectedMenu !== 'updates') {
        setSelectedMenuItem('updates')
      }
    }
  }, [router.query])

  // Scroll to selected update
  useEffect(() => {
    if (selectedUpdateId) {
      const element = document.getElementById(`update-${selectedUpdateId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [selectedUpdateId])

  // Global click handler to reset selectedUpdateId
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (updates) {
        let isOutside = true
        updates.forEach((post: any) => {
          const element = document.getElementById(`update-${post.id}`)
          if (element && element.contains(event.target as Node)) {
            isOutside = false
          }
        })

        if (isOutside) {
          setSelectedUpdateId(null)
        }
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [updates])

  // Handle modal opening based on query parameters
  useEffect(() => {
    if (!router.isReady) return

    const modalParam = router.query.modal
    if (modalParam === 'true') {
      setModalOpen(true)

      // Set the selected project
      setSelectedProject(project)

      // Dispatch the project details to DonationContext
      dispatch({
        type: 'SET_PROJECT_DETAILS',
        payload: {
          slug: project.slug,
          title: project.title,
          image: project.coverImage,
        },
      })
    } else {
      setModalOpen(false)
    }
  }, [router.isReady, router.query.modal, project, dispatch])

  // Handler for menu item changes
  const handleMenuItemChange = (
    newMenuItem: string,
    updateId: number | null = null
  ) => {
    setSelectedMenuItem(newMenuItem)

    const updatedURL = updateId
      ? `/projects/${slug}?menu=${newMenuItem}&updateId=${updateId}`
      : `/projects/${slug}?menu=${newMenuItem}`

    router.push(updatedURL, undefined, { shallow: true })
  }

  if (!router.isFallback && !slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <>
      <SEOHead title={title} summary={summary} coverImage={coverImage} />
      <div
        className="flex h-full w-screen max-w-none items-center bg-[#f2f2f2] bg-cover bg-center pb-8"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <article className="relative mx-auto mt-32 flex min-h-screen w-[1300px] max-w-[90%] flex-col-reverse pb-16 lg:flex-row lg:items-start">
          <div className="content w-full leading-relaxed text-gray-800 lg:mr-5">
            {/* Project Header */}
            <ProjectHeader title={title} summary={summary} />

            {/* Project Menu */}
            <ProjectMenu
              onMenuItemChange={handleMenuItemChange}
              activeMenu={selectedMenuItem}
              commentCount={posts.length || 0}
              faqCount={faqCount || 0}
              updatesCount={(updates && updates.length) || 0}
            />

            {/* Menu Sections */}
            <MenuSections
              selectedMenuItem={selectedMenuItem || 'Info'}
              title={title}
              content={content || ''}
              socialSummary={socialSummary || ''}
              faq={faq}
              faqCount={faqCount}
              updates={updates || []}
              selectedUpdateId={selectedUpdateId}
              setSelectedUpdateId={setSelectedUpdateId}
              hashtag={hashtag || ''}
              tweetsData={posts} // WIP
              twitterContributors={twitterContributors}
              twitterContributorsBitcoin={twitterContributorsBitcoin}
              twitterContributorsLitecoin={twitterContributorsLitecoin}
              twitterAdvocates={twitterAdvocates}
              twitterUsers={twitterUsers} // donors
              isBitcoinOlympics2024={isBitcoinOlympics2024 || false}
              formatLits={formatLits}
              formatUSD={formatUSD}
              website={website || ''}
              gitRepository={gitRepository || ''}
              twitterHandle={twitterHandle || ''}
              discordLink={discordLink || ''}
              telegramLink={telegramLink}
              facebookLink={facebookLink}
              redditLink={redditLink}
            />
          </div>

          {/* Aside Section */}
          <AsideSection
            title={title}
            coverImage={coverImage}
            addressStats={addressStats as AddressStats}
            isMatching={isMatching || true}
            isBitcoinOlympics2024={isBitcoinOlympics2024 || false}
            isRecurring={isRecurring}
            matchingDonors={matchingDonors}
            matchingTotal={matchingTotal}
            serviceFeeCollected={serviceFeesCollected || 0}
            totalPaid={totalPaid || 0}
            // formatLits={formatLits}
            formatUSD={formatUSD}
            monthlyTotal={monthlyTotal}
            recurringAmountGoal={recurringAmountGoal}
            monthlyDonorCount={monthlyDonorCount}
            timeLeftInMonth={timeLeftInMonth}
            bountyStatus={bountyStatus as BountyStatus}
            openPaymentModal={openPaymentModal}
          />
        </article>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
      <ThankYouModal
        isOpen={isThankYouModalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default Project

type ParamsType = {
  slug: string
}

import {
  determineProjectType,
  determineBountyStatus,
} from '../../utils/statusHelpers'

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context
  const slug = params?.slug as string

  // Fetch project data from the API
  const project = await getProjectBySlug(slug)
  // console.log('Project: ', project)

  // Handle the case where the project is not found
  if (!project) {
    return {
      notFound: true,
      revalidate: 60, // Revalidate after 60 seconds
    }
  }

  // Fetch project updates
  const updates = await getProjectUpdatesBySlug(slug)
  // console.log('Updates: ', updates);

  // Fetch project FAQs
  const faqs = await getFAQsByProjectSlug(slug)
  // console.log('FAQs: ', faqs)

  const posts = await getPostsBySlug(slug)
  // console.log('Projects posts: ', posts);

  // Fetch all contributors once
  const allContributors = await getAllActiveContributors()

  // Extract contributor IDs from project field data
  const contributorsBitcoinIds = project.fieldData['bitcoin-contributors'] || []
  const contributorsLitecoinIds =
    project.fieldData['litecoin-contributors'] || []
  const advocateIds = project.fieldData['advocates'] || []

  // Filter contributors for each type
  const contributorsBitcoin = allContributors.filter((contributor) =>
    contributorsBitcoinIds.includes(contributor.id)
  )

  const contributorsLitecoin = allContributors.filter((contributor) =>
    contributorsLitecoinIds.includes(contributor.id)
  )

  const advocates = allContributors.filter((contributor) =>
    advocateIds.includes(contributor.id)
  )
  const status = project.fieldData.status || ''

  // console.log('Project status: ', status)

  // Adjust the project object to match your component's expectations
  const projectType = determineProjectType(status)
  const bountyStatus = determineBountyStatus(status) ?? null

  const projectData = {
    ...project.fieldData,
    title: project.fieldData.name || null,
    slug: project.fieldData.slug,
    content: project.fieldData['content'] || null,
    coverImage: project.fieldData['cover-image'].url || null,
    gitRepository: project.fieldData['github-link'] || null,
    twitterHandle: project.fieldData['twitter-link'] || null,
    discordLink: project.fieldData['discord-link'] || null,
    telegramLink: project.fieldData['telegram-link'] || null,
    redditLink: project.fieldData['reddit-link'] || null,
    facebookLink: project.fieldData['facebook-link'] || null,
    website: project.fieldData['website-link'] || null,
    hidden: project.fieldData.hidden || null,
    isRecurring: project.fieldData.recurring || null,
    totalPaid: project.fieldData['total-paid'] || null,
    serviceFeesCollected: project.fieldData['service-fees-collected'] || null,
    type: projectType,
    bountyStatus: bountyStatus,
    contributorsBitcoin:
      contributorsBitcoin
        .map((c) =>
          c.fieldData['twitter-link'].replace(
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
            ''
          )
        )
        .join(',') || null,
    contributorsLitecoin:
      contributorsLitecoin
        .map((c) =>
          c.fieldData['twitter-link'].replace(
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
            ''
          )
        )
        .join(',') || null,
    advocates:
      advocates
        .map((c) =>
          c.fieldData['twitter-link'].replace(
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
            ''
          )
        )
        .join(',') || null,
    // You can include other fields here, ensuring none are undefined
  }

  // console.log('Project Data: ', projectData)

  return {
    props: {
      project: projectData,
      updates,
      faqs,
      posts,
    },
    revalidate: 600, // Revalidate every 600 seconds
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch all projects to get their slugs
  const projects = await getAllProjects()

  // Generate paths for each project slug
  const paths = projects.map((project) => ({
    params: { slug: project.fieldData.slug },
  }))

  return {
    paths,
    fallback: 'blocking', // or 'true' depending on your preference
  }
}
