// components/ProjectContent.tsx
import React, { useState } from 'react'
import DonationInfoModal from '@/components/DonationInfoModal'
import SocialMediaShare from '@/components/SocialMediaShare'
import ProjectSocialLinks from '@/components/ProjectSocialLinks'
import CommunitySection from '@/components/CommunitySection'
import { TwitterUser } from '../utils/types' // Adjust the path as necessary

type ProjectContentProps = {
  title: string
  content: string
  socialSummary: string
  website: string
  gitRepository: string
  twitterHandle: string
  discordLink: string
  telegramLink: string
  facebookLink: string
  redditLink: string
  twitterContributors: TwitterUser[]
  twitterContributorsBitcoin: TwitterUser[]
  twitterContributorsLitecoin: TwitterUser[]
  twitterAdvocates: TwitterUser[]
  twitterUsers: TwitterUser[]
  isBitcoinOlympics2024: boolean
}

const ProjectContent: React.FC<ProjectContentProps> = ({
  title,
  content,
  socialSummary,
  website,
  gitRepository,
  twitterHandle,
  discordLink,
  telegramLink,
  facebookLink,
  redditLink,
  twitterContributors,
  twitterContributorsBitcoin,
  twitterContributorsLitecoin,
  twitterAdvocates,
  twitterUsers,
  isBitcoinOlympics2024,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div>
      <DonationInfoModal isOpen={isModalOpen} onRequestClose={closeModal} />
      <h2>Info</h2>
      <div className="flex w-full flex-col items-start rounded-md bg-[#c6d3d6] lg:flex-row">
        <div className="flex w-full flex-col rounded-md bg-[#c6d3d6] lg:flex-row">
          {/* First Column */}
          <div className="w-full p-4 lg:w-1/2">
            <ProjectSocialLinks
              website={website}
              gitRepository={gitRepository}
              twitterHandle={twitterHandle}
              discordLink={discordLink}
              telegramLink={telegramLink}
              facebookLink={facebookLink}
              redditLink={redditLink}
              onHowDonationsWorkClick={openModal}
            />
          </div>

          {/* Second Column */}
          <div className="w-full p-4 lg:w-1/2">
            <SocialMediaShare
              className="flex w-full space-x-1 rounded-xl p-2 px-6"
              title={title}
              summary={socialSummary}
            />
          </div>
        </div>
      </div>
      <div className="markdown" dangerouslySetInnerHTML={{ __html: content }} />
      <CommunitySection
        twitterContributors={twitterContributors}
        twitterContributorsBitcoin={twitterContributorsBitcoin}
        twitterContributorsLitecoin={twitterContributorsLitecoin}
        twitterAdvocates={twitterAdvocates}
        twitterUsers={twitterUsers}
        isBitcoinOlympics2024={isBitcoinOlympics2024}
      />
    </div>
  )
}

export default ProjectContent
