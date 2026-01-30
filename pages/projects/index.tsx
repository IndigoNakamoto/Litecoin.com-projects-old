// pages/projects/index.tsx
import type { NextPage } from 'next'

import Head from 'next/head'
import PaymentModal from '@/components/PaymentModal'
import ProjectCard from '@/components/ProjectCard'
import { ProjectItem, ProjectCategory, BountyStatus } from '../../utils/types'
import VerticalSocialIcons from '@/components/VerticalSocialIcons'
// import faqData from '../../data/pages/faq.json'
import { FAQSection } from '@/components/FAQSection'
import React, { useEffect, useState, useRef } from 'react'
import { useDonation } from '../../contexts/DonationContext'
import Link from 'next/link'
import TypingScroll from '@/components/TypingScroll'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useCallback, useMemo } from 'react'
import SectionProjects from '@/components/SectionProjects'
import SectionGrey from '@/components/SectionGrey'
import SectionWhite from '@/components/SectionWhite'
import SectionOrange from '@/components/SectionOrange'
import SectionBlue from '@/components/SectionBlue'
import SectionMatchingDonations from '@/components/SectionMatchingDonations'
import SectionStats from '@/components/SectionStats'
import SectionContributors from '@/components/SectionContributors'
import SectionDonors from '@/components/SectionDonors'
import Button from '@/components/Button'
import { PageSEO } from '@/components/SEO'

// TODO: Fix scroll bar. Return to default

const project = {
  slug: 'litecoin-foundation',
  title: 'Litecoin Foundation',
  summary: '',
  coverImage: '/static/images/projects/Litecoin_Foundation_Project.png',
  telegramLink: '',
  redditLink: '',
  facebookLink: '',
  type: ProjectCategory.BOUNTY,
  isRecurring: false,
}

function useIsLgScreen() {
  const [isLgScreen, setIsLgScreen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleResize = () => {
      setIsLgScreen(mediaQuery.matches)
    }

    handleResize() // Set initial value
    mediaQuery.addEventListener('change', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  return isLgScreen
}

const AllProjects: NextPage = () => {
  const router = useRouter()
  const { dispatch } = useDonation()
  const [modalOpen, setModalOpen] = useState(false)
  const [openSourceProjects, setOpenSourceProjects] = useState<ProjectItem[]>()
  const [completedProjects, setCompletedProjects] = useState<ProjectItem[]>()
  const [openBounties, setOpenBounties] = useState<ProjectItem[]>()

  const outerSpinnerRef = useRef(null)
  const innerSpinnerRef = useRef(null)
  const isLgScreen = useIsLgScreen()

  useEffect(() => {
    // Open modal if 'modal=true' is in the URL
    if (router.query.modal === 'true') {
      setModalOpen(true)
    } else {
      setModalOpen(false)
    }
  }, [router.query])

  useEffect(() => {
    let previousScrollY = window.scrollY
    let rotationAngle = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - previousScrollY

      rotationAngle += scrollDelta * 0.08 // Adjust factor for desired speed
      if (outerSpinnerRef.current) {
        ;(
          outerSpinnerRef.current as HTMLElement
        ).style.transform = `rotate(${rotationAngle}deg)`
      }

      previousScrollY = currentScrollY
    }

    let requestId: number

    const animate = () => {
      requestId = requestAnimationFrame(animate)
      handleScroll()
    }

    animate()
    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  useEffect(() => {
    if (innerSpinnerRef.current) {
      const element = innerSpinnerRef.current as HTMLElement
      element.style.width = '80%' // Reduce the size of the inner element
      element.style.height = '80%'
    }
  }, [])

  function determineProjectType(status: string): ProjectCategory {
    if (status === 'Open') {
      return ProjectCategory.PROJECT
    } else if (status === 'Bounty Open' || status === 'Bounty Closed') {
      return ProjectCategory.BOUNTY
    } else {
      return ProjectCategory.OTHER // You can define 'OTHER' in your enum or handle it accordingly
    }
  }

  function determineProjectStatus(status: string): BountyStatus | undefined {
    switch (status) {
      case 'Bounty Open':
        return BountyStatus.OPEN
      case 'Closed':
        return BountyStatus.CLOSED
      case 'Bounty Closed':
        return BountyStatus.BOUNTY_CLOSED
      case 'Completed':
        return BountyStatus.COMPLETED
      case 'Bounty Completed':
        return BountyStatus.BOUNTY_COMPLETED
      default:
        return undefined
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/webflow/projects')

        const projects = response.data.projects

        const transformedProjects: ProjectItem[] = projects.map(
          (project: any) => {
            const status = project.fieldData.status
            const projectType = determineProjectType(status)
            const bountyStatus = determineProjectStatus(status)

            return {
              slug: project.fieldData.slug,
              title: project.fieldData.name,
              summary: project.fieldData.summary,
              coverImage: project.fieldData['cover-image']?.url || '', // Fallback image
              telegramLink: project.fieldData['telegram-link'] || '',
              redditLink: project.fieldData['reddit-link'] || '',
              facebookLink: project.fieldData['facebook-link'] || '',
              type: projectType,
              bountyStatus: bountyStatus,
              status: status, // Add status here
              isRecurring: false,
              nym: 'Litecoin Foundation',
            }
          }
        )

        const desiredOrder = [
          'Litecoin Foundation',
          'Litecoin Core',
          'MWEB',
          'Ordinals Lite',
          'Litewallet',
          'Litecoin Development Kit',
          'Litecoin Mempool Explorer',
        ]

        setOpenSourceProjects(
          transformedProjects.filter(isProject).sort((a, b) => {
            const indexA = desiredOrder.indexOf(a.title)
            const indexB = desiredOrder.indexOf(b.title)

            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB
            }

            if (indexA !== -1) {
              return -1
            }
            if (indexB !== -1) {
              return 1
            }

            return a.title.localeCompare(b.title)
          })
        )

        setOpenBounties(transformedProjects.filter(isOpenBounty))

        setCompletedProjects(transformedProjects.filter(isPastProject))
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    fetchProjects()
  }, [])

  function closeModal() {
    setModalOpen(false)
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, modal: 'false' },
      },
      undefined,
      { shallow: true }
    )
  }

  const openPaymentModal = useCallback(() => {
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
  }, [project.slug, project.title, project.coverImage, dispatch, router])

  const projectsRef = useRef<HTMLDivElement>(null)
  const bountiesRef = useRef<HTMLDivElement>(null)

  const scrollToProjects = () => {
    const yOffset = -64 // Offset by the height of the sticky menu
    const yPosition =
      (projectsRef.current?.getBoundingClientRect().top ?? 0) +
      window.scrollY +
      yOffset
    window.scrollTo({ top: yPosition, behavior: 'smooth' })
  }

  const scrollToBounties = () => {
    const yOffset = -64 // Offset by the height of the sticky menu
    const yPosition =
      (bountiesRef.current?.getBoundingClientRect().top ?? 0) +
      window.scrollY +
      yOffset
    window.scrollTo({ top: yPosition, behavior: 'smooth' })
  }

  const bgColors = useMemo(() => ['bg-[#EEEEEE]', 'bg-[#c6d3d6]'], [])

  return (
    <div className="w-full overflow-x-hidden">
      <PageSEO
        title="Projects"
        description="Open Source Projects, Bounties, and Initiatives for the Litecoin Ecosystem. Explore and contribute to the future of Litecoin."
        // keywords="Litecoin, Donate, Cryptocurrency, Support, Foundation, Blockchain"
      />
      <Head>
        <title>Projects</title>
      </Head>
      <VerticalSocialIcons />
      <section
        className="relative flex max-h-fit min-h-[62vh] w-full items-center overflow-x-hidden bg-cover bg-center lg:py-24"
        style={{
          backgroundImage: "url('/static/images/design/Mask-Group-20.webp')",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="w-full items-center">
          <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center gap-y-40 lg:flex-row lg:items-center">
            <div className="lg:py-30 py-20 lg:w-1/2">
              <h1 className="font-space-grotesk text-[39px] font-semibold leading-[32px] tracking-tight text-black">
                Litecoin Projects
              </h1>
              <p className="w-11/12 pt-6 text-[18px]">
                The Litecoin Foundation is dedicated to consistently improving
                the Litecoin network, whilst supporting the development of
                exciting projects on the Litecoin blockchain. Below are a
                handful of initiatives that demonstrate Litecoin's commitment to
                innovation and improving the experience of its users.
              </p>
              <div className="my-8 flex w-11/12 max-w-[508px] flex-col gap-4">
                <div className="">
                  <Button
                    variant="primary"
                    onClick={openPaymentModal}
                    className="h-12 w-full px-6 py-1 !tracking-wide"
                  >
                    DONATE NOW
                  </Button>
                </div>

                <div className="flex w-full flex-row justify-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={scrollToProjects}
                    className="w-full px-6 py-3"
                  >
                    VIEW PROJECTS
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={scrollToBounties}
                    className="w-full px-6 py-3"
                  >
                    VIEW PAST PROJECTS
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-7/12 pt-80 lg:w-1/2 lg:pb-0 lg:pl-20 lg:pt-0">
              <div className="relative flex items-center justify-center">
                <img
                  src="/static/images/design/outline-litecoin-spinner-inner.svg"
                  alt="Litecoin Spinner Inner"
                  className="absolute w-1/2 max-w-[160px] pb-8 lg:max-w-[full]"
                />
                <img
                  src="/static/images/design/outline-litecoin-spinner-outer.svg"
                  alt="Litecoin Spinner Outer"
                  ref={outerSpinnerRef}
                  className="absolute w-full lg:w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionWhite>
        <div className="py-2">
          <SectionStats />
        </div>
      </SectionWhite>

      <SectionBlue>
        <SectionMatchingDonations />
      </SectionBlue>

      {/* OPEN SOURCE PROJECTS */}
      <SectionGrey>
        <div ref={projectsRef} className="flex flex-col items-center">
          <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
            Open-Source Projects
          </h1>
          <ul className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {openSourceProjects &&
              openSourceProjects.map((p, i) => {
                const bgColor = bgColors[i % bgColors.length]

                return (
                  <li key={i} className="flex">
                    <ProjectCard
                      project={p}
                      openPaymentModal={openPaymentModal}
                      bgColor={'bg-[white]'}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
      </SectionGrey>

      {/* COMPLETED PROJECTS */}
      <SectionGrey>
        <div ref={bountiesRef} className="flex flex-col items-center pb-8">
          <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
            Completed Projects
          </h1>
          <ul className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {completedProjects &&
              completedProjects.map((p, i) => (
                <li key={i} className="flex">
                  <ProjectCard
                    project={p}
                    openPaymentModal={openPaymentModal}
                    bgColor={'bg-[white]'}
                  />
                </li>
              ))}
          </ul>
        </div>
      </SectionGrey>

      {/* OPEN BOUNTIES */}
      {openBounties && openBounties.length > 0 ? (
        <SectionGrey>
          <div className="flex flex-col items-center">
            <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
              Open Bounties
            </h1>
            <ul className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {openBounties &&
                openBounties.map((p, i) => {
                  const bgColor = bgColors[i % bgColors.length]

                  return (
                    <li key={i} className="flex">
                      <ProjectCard
                        project={p}
                        openPaymentModal={openPaymentModal}
                        bgColor={bgColor}
                      />
                    </li>
                  )
                })}
            </ul>
          </div>
        </SectionGrey>
      ) : (
        <></>
      )}

      {/* SCROLLING TEXT  */}
      <SectionWhite>
        <div className="flex flex-col items-center pb-8  pt-4 text-center">
          <h1 className="font-space-grotesk text-[39px] font-[600] text-[black]">
            The Litecoin Project Development Portal
          </h1>
          <h2 className="pt-2 font-space-grotesk text-[30px] font-[600] text-[black]">
            We help advance
          </h2>
          <h3 className="font-space-grotesk text-[20px] font-semibold text-[black]">
            <TypingScroll />
          </h3>
        </div>
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center lg:flex-row lg:items-center">
          <div className="flex h-4/6 min-h-fit w-full flex-col justify-center border border-[black] p-8">
            <h1 className="m-auto py-4 font-space-grotesk !text-[30px] font-[600] leading-[32px] text-[black]">
              Submit a Project
            </h1>
            <p className="m-auto max-w-3xl text-center text-lg text-[black]">
              We are looking to support talented individuals and teams who share
              our commitment to decentralized open-source solutions and the
              future of Litecoin.
            </p>
            <Link href="/projects/submit" className="m-auto pt-4">
              <Button variant="primary" className="w-48">
                Submit Project
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center pt-16">
          <h1 className="w-full pb-8 pt-8 font-space-grotesk !text-[30px] font-semibold leading-tight tracking-tight text-black">
            Project Builders
          </h1>
          <SectionContributors />
        </div>
      </SectionWhite>

      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={project}
      />
    </div>
  )
}

export default AllProjects

export function isProject(project: ProjectItem): boolean {
  return ['Open'].includes(project.status || '')
}

export function isOpenBounty(project: ProjectItem): boolean {
  return ['Bounty Open'].includes(project.status || '')
}

export function isPastProject(project: ProjectItem): boolean {
  return ['Bounty Closed', 'Bounty Completed', 'Closed', 'Completed'].includes(
    project.status || ''
  )
}
