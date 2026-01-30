// components/MenuSections.tsx
import React from 'react'
import { FAQSection } from '@/components/FAQSection'
import ProjectUpdate from '@/components/ProjectUpdate'
import ProjectContent from '@/components/ProjectContent'
import { TwitterUser } from '../utils/types' // Adjust the path as necessary
import PostsList from './PostsList'

type MenuSectionsProps = {
  selectedMenuItem: string
  title: string
  content: string
  socialSummary: string
  faq: any
  faqCount: number
  updates: any[]
  selectedUpdateId: number | null
  setSelectedUpdateId: (id: number | null) => void
  hashtag: string
  tweetsData: any
  twitterContributors: TwitterUser[]
  twitterContributorsBitcoin: TwitterUser[]
  twitterContributorsLitecoin: TwitterUser[]
  twitterAdvocates: TwitterUser[]
  twitterUsers: TwitterUser[]
  isBitcoinOlympics2024: boolean
  formatLits: (value: any) => string
  formatUSD: (value: any) => string
  website: string
  gitRepository: string
  twitterHandle: string
  discordLink: string
  telegramLink: string
  facebookLink: string
  redditLink: string
}

const MenuSections: React.FC<MenuSectionsProps> = ({
  selectedMenuItem,
  title,
  content,
  socialSummary,
  faq,
  faqCount,
  updates,
  selectedUpdateId,
  setSelectedUpdateId,
  hashtag,
  tweetsData,
  twitterContributors,
  twitterContributorsBitcoin,
  twitterContributorsLitecoin,
  twitterAdvocates,
  twitterUsers,
  isBitcoinOlympics2024,
  formatLits,
  website,
  gitRepository,
  twitterHandle,
  discordLink,
  telegramLink,
  facebookLink,
  redditLink,
}) => {
  switch (selectedMenuItem) {
    case 'Info':
      return (
        <div>
          <div className="markdown">
            <ProjectContent
              title={title}
              content={content}
              socialSummary={socialSummary}
              website={website}
              gitRepository={gitRepository}
              twitterHandle={twitterHandle}
              discordLink={discordLink}
              telegramLink={telegramLink}
              facebookLink={facebookLink}
              redditLink={redditLink}
              twitterContributors={twitterContributors}
              twitterContributorsBitcoin={twitterContributorsBitcoin}
              twitterContributorsLitecoin={twitterContributorsLitecoin}
              twitterAdvocates={twitterAdvocates}
              twitterUsers={twitterUsers}
              isBitcoinOlympics2024={isBitcoinOlympics2024}
            />
          </div>
        </div>
      )
    case 'posts':
      return (
        <div className="markdown">
          <PostsList posts={tweetsData} />
        </div>
      )
    case 'faq':
      return (
        <div className="markdown">
          <FAQSection faqs={faq} bg={'#c6d3d6'} />
        </div>
      )
    case 'updates':
      // console.log('updates: ', updates)
      return (
        <div className="markdown min-h-full">
          <div>
            {updates ? (
              updates.map((post, index) => (
                <div key={index} id={`update-${post.id}`}>
                  <ProjectUpdate
                    title={post.fieldData.name}
                    summary={post.fieldData.summary}
                    authorTwitterHandle={post.authorTwitterHandle}
                    date={post.fieldData.createdOn}
                    tags={post.tags || []}
                    content={post.fieldData.content}
                    id={index}
                    highlight={selectedUpdateId === post.id}
                  />
                </div>
              ))
            ) : (
              <h1>No updates available for this project.</h1>
            )}
          </div>
        </div>
      )
    // case 'community':
    //   return (
    //     <div className="markdown">
    //       <h1>
    //         {twitterContributors.length > 1 ? 'Contributors' : 'Contributor'}
    //       </h1>
    //     </div>
    //   )
    default:
      return null
  }
}

export default MenuSections
