//utils/types.ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      username: string
      name: string
      id: string
      image: string
    }
  }
}

// Enums for clarity and cleaner codebase
export enum ProjectCategory {
  PROJECT = 'PROJECT',
  BOUNTY = 'BOUNTY',
  DEVELOPMENT = 'DEVELOPMENT',
  OTHER = 'OTHER',
}

export enum BountyStatus {
  OPEN = 'Bounty Open',
  CLOSED = 'Closed',
  BOUNTY_CLOSED = 'Bounty Closed',
  COMPLETED = 'Completed',
  BOUNTY_COMPLETED = 'Bounty Completed',
}

export enum BugSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BugStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum RecurringPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum FundingStatus {
  ONGOING = 'ongoing',
  MET = 'met',
  FAILED = 'failed',
}

export type ProjectItem = {
  // Main Info
  slug: string
  title: string
  summary: string
  socialSummary?: string
  coverImage: string
  content?: string

  // Community Interaction
  contributor?: string
  contributorsBitcoin?: string
  contributorsLitecoin?: string
  advocates?: string
  hashtag?: string
  comments?: string[]

  // Resources and Metadata
  hidden?: boolean
  nym?: string
  website?: string
  tutorials?: string[]
  gitRepository?: string // Renamed from 'git' for clarity
  twitterHandle?: string // Renamed for clarity
  discordLink?: string
  telegramLink: string
  redditLink: string
  facebookLink: string
  owner?: string

  // Categorization and Status
  type: ProjectCategory
  bugSeverity?: BugSeverity
  bugStatus?: BugStatus

  // Timelines
  expectedCompletion?: Date
  updates?: ProjectUpdate[]

  // Funding
  bountyAmount?: number
  bountyStatus?: BountyStatus
  status?: string
  targetFunding?: number // The one-time funding goal
  fundingDeadline?: Date // Date by which target funding should be met
  isRecurring: boolean
  matchingTotal?: number
  isMatching?: boolean
  isBitcoinOlympics2024?: boolean
  matchingMultiplier?: number
  recurringAmountGoal?: number
  recurringPeriod?: RecurringPeriod
  recurringStatus?: FundingStatus
  totalPaid?: number | undefined
  serviceFeesCollected?: number
  litecoinRaised?: number
  litecoinPaid?: number

  // // Technical Details
  // techStack?: string[]
  // dependencies?: string[]

  // // Documentation
  // documentationLink?: string
  // APIReference?: string
}

export type ProjectUpdate = {
  content: string
  title: string
  summary: string
  tags?: string[]
  date: string
  authorTwitterHandle: string
  id: number
}

export type PayReq = {
  amount: number
  project_slug: string
  project_name: string
  email?: string
  twitter?: string
  name?: string
}

export type InfoReq = {
  slug: string
}

export type Stats = {
  usd: {
    donations: number
    total: number
  }
  btc: {
    donations: number
    total: number
  }
}

export type AddressStats = {
  tx_count: number
  funded_txo_sum: number
  supporters: Array<string>
}

export type TwitterUser = {
  name: string
  screen_name: string
  profile_image_url_https: string
}

export type Donation = {
  amount: number
  createdTime: number
}

export type TwitterUsers = [TwitterUser]

export type CMSFAQItem = {
  id: string
  cmsLocaleId: string
  lastPublished: string
  lastUpdated: string
  createdOn: string
  isArchived: boolean
  isDraft: boolean
  fieldData: {
    order: number
    slug: string
    name: string
    answer: string
    category?: string // Make category optional
    project: string
  }
}

export type FAQItem = {
  question: string
  answer: string
}

export type FAQCategory = {
  category: string
  items: FAQItem[]
}
