// /utils/webflow.ts
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
// import { Controller } from 'react-hook-form'
import { kv } from '@vercel/kv'
import { prisma } from '../lib/prisma' // Adjust the path to your prisma client

// Load environment variables from .env file
dotenv.config({ path: '.env.local' })

// Type Definitions
interface WebflowResponse<T> {
  items: T[]
  count: number
  total: number
  limit: number
  offset: number
}

export interface Contributor {
  id: string
  name: string
  slug: string
  isDraft: boolean
  isArchived: boolean
  fieldData: ContributorFieldData
}

interface ProjectWithUpdatesAndContributors extends ProjectWithUpdates {
  litecoinContributors: Contributor[]
  bitcoinContributors: Contributor[]
  advocates: Contributor[]
}

interface ContributorFieldData {
  'profile-picture': string
  'project-as-contributor': string[] // Should be array if multiple projects
  'projects-as-litecoin-contributor': string[] // Should be array if multiple projects
  'projects-as-bitcoin-contributor': string[] // Should be array if multiple projects
  'twitter-link': string
  'discord-link': string
  'github-link': string
  'youtube-link': string
  'linkedin-link': string
  email: string
}

interface Project {
  id: string
  cmsLocaleId: string
  lastPublished: string
  lastUpdated: string
  createdOn: string
  isArchived: boolean
  isDraft: boolean
  fieldData: ProjectFieldData
}

interface ProjectFieldData {
  'github-link': string
  'telegram-link': string
  'facebook-link': string
  'discord-link': string
  'reddit-link': string
  'website-link': string
  hidden: boolean
  recurring: boolean
  'service-fees-collected': number
  'total-paid': number
  summary: string
  name: string
  slug: string
  content: string
  'bitcoin-contributors': string[]
  'litecoin-contributors': string[]
  advocates: string[]
  hashtags: string[]
  status: string
}

export interface Post {
  _id: string
  title: string
  slug: string
  fieldData: {
    'x-post-link': string
    'youtube-link': string
    'reddit-link': string
    // Add a reference to the project ID
    projects?: string[] // Assuming you have this field as an array
  }
  // Add other relevant fields
}
export interface MatchingDonorWithRemainingAmount extends MatchingDonor {
  remainingAmount: number
}

export interface Update {
  id: string
  slug: string
  isArchived: boolean
  isDraft: boolean
  fieldData: UpdateFieldData
}

interface UpdateFieldData {
  content: string
  summary: string
  name: string
  slug: string
  author: string
  project: string
}

// Extended Type for Project with Updates
interface ProjectWithUpdates extends Project {
  updates: Update[]
}

interface MatchingDonor {
  id: string
  slug: string
  isDraft: boolean
  isArchived: boolean
  fieldData: MatchingDonorFieldData
}

interface MatchingDonorFieldData {
  name: string
  'matching-type': string // Option field, returns option ID
  'total-matching-amount': number | string
  'remaining-matching-amount': number
  'supported-projects'?: string[]
  'start-date': string
  'end-date': string
  multiplier?: number
  status: string // Option field, returns option ID
  contributor?: string
  // other fields...
}

// Additional Interfaces for Collection Schema
interface CollectionSchemaField {
  id: string
  isEditable: boolean
  isRequired: boolean
  type: string // e.g., "Option", "PlainText"
  slug: string // e.g., "status", "matching-type"
  displayName: string // e.g., "Status", "Matching Type"
  helpText: string | null
  validations?: {
    options?: Array<{
      id: string
      name: string
    }>
    // other validations...
  }
}

interface CollectionSchema {
  id: string
  displayName: string
  singularName: string
  slug: string
  createdOn: string
  lastUpdated: string
  fields: CollectionSchemaField[]
}

interface ProjectSummaryLiteFieldData {
  summary: string
  name: string
  slug: string
  'cover-image': {
    fileId: string
    url: string
    alt: string | null
  }
  'total-paid': number
  status: string // Mapped label
}

interface ProjectSummaryLite {
  isDraft: boolean
  id: string
  lastUpdated: string
  createdOn: string
  fieldData: ProjectSummaryLiteFieldData
}

export interface FAQItem {
  id: string
  slug: string
  isArchived: boolean
  isDraft: boolean
  fieldData: FAQFieldData
}

interface FAQFieldData {
  question: string
  answer: string
  category: string
  project: string // Reference to the Project ID
  order?: number
}

interface MatchingDonor {
  id: string
  slug: string
  isDraft: boolean
  isArchived: boolean
  fieldData: MatchingDonorFieldData
}

interface MatchingDonorFieldData {
  name: string
  'matching-type': string
  'total-matching-amount': number | string
  'remaining-matching-amount': number
  'supported-projects'?: string[]
  'start-date': string
  'end-date': string
  multiplier?: number
  status: string
  contributor?: string
  // other fields...
}

// Environment Variables
const API_TOKEN = process.env.WEBFLOW_API_TOKEN_TEST_REDESIGN_LITE_SPACE
const COLLECTION_ID_PROJECTS = process.env.WEBFLOW_COLLECTION_ID_PROJECTS
const COLLECTION_ID_POSTS = process.env.WEBFLOW_COLLECTION_ID_POSTS
const COLLECTION_ID_UPDATES = process.env.WEBFLOW_COLLECTION_ID_PROJECT_UPDATES
const COLLECTION_ID_CONTRIBUTORS =
  process.env.WEBFLOW_COLLECTION_ID_CONTRIBUTORS
const COLLECTION_ID_MATCHING_DONORS =
  process.env.WEBFLOW_COLLECTION_ID_MATCHING_DONORS
const COLLECTION_ID_FAQS = process.env.WEBFLOW_COLLECTION_ID_FAQS

if (
  !API_TOKEN ||
  !COLLECTION_ID_PROJECTS ||
  !COLLECTION_ID_POSTS ||
  !COLLECTION_ID_UPDATES ||
  !COLLECTION_ID_CONTRIBUTORS ||
  !COLLECTION_ID_MATCHING_DONORS ||
  !COLLECTION_ID_FAQS
) {
  throw new Error('Missing one or more required environment variables.')
}

// Axios Client Setup
const webflowClient: AxiosInstance = axios.create({
  baseURL: 'https://api.webflow.com/v2',
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'accept-version': '1.0.0',
    'Content-Type': 'application/json',
  },
})

export const getMatchingDonorsByProjectSlug = async (
  slug: string
): Promise<object[]> => {
  try {
    // First, get the project by its slug
    const project = await getProjectBySlug(slug)
    if (!project) {
      console.warn(`No project found with slug "${slug}".`)
      return []
    }

    // Fetch all matching donors
    const allDonors = await listCollectionItems<MatchingDonor>(
      COLLECTION_ID_MATCHING_DONORS
    )

    // Get donor IDs who have made matching donations to this project
    const matchingDonations = await prisma.matchingDonationLog.findMany({
      where: {
        projectSlug: slug,
      },
      select: {
        donorId: true,
      },
    })

    const donorIdsWhoMatchedProject = Array.from(
      new Set(matchingDonations.map((donation) => donation.donorId))
    )

    // Filter donors to those who have matched donations for this project
    const donorsWhoMatchedProject = allDonors.filter((donor) =>
      donorIdsWhoMatchedProject.includes(donor.id)
    )

    // Get total matched amounts for donors for this project
    const totalMatchedAmounts = await prisma.matchingDonationLog.groupBy({
      by: ['donorId'],
      where: {
        projectSlug: slug,
      },
      _sum: {
        matchedAmount: true,
      },
    })

    // Create a map of donorId to totalMatchedAmount
    const totalMatchedAmountMap: { [donorId: string]: number } = {}
    totalMatchedAmounts.forEach((item) => {
      totalMatchedAmountMap[item.donorId] =
        item._sum.matchedAmount?.toNumber() ?? 0
    })

    // For each donor, retrieve the total matched amount from the map
    const donorsWithMatchedAmounts = await Promise.all(
      donorsWhoMatchedProject.map(async (donor) => {
        const donorId = donor.id
        const totalMatchedAmount = totalMatchedAmountMap[donorId] || 0

        // Map the 'status' option ID to its label
        const statusLabel = await getStatusLabel(donor.fieldData.status)

        // Map the 'matching-type' option ID to its label
        const matchingTypeLabel = await getMatchingTypeLabel(
          donor.fieldData['matching-type']
        )

        // Map the 'supported-projects' IDs to their corresponding project slugs
        const supportedProjectSlugs = await getSupportedProjectsForDonor(donor)

        return {
          donorId,
          donorFieldData: {
            ...donor.fieldData,
            statusLabel,
            matchingTypeLabel,
            supportedProjectSlugs,
          },
          totalMatchedAmount,
        }
      })
    )

    return donorsWithMatchedAmounts
  } catch (error) {
    console.error('Error fetching matching donors by project slug:', error)
    return []
  }
}

export interface MappedMatchingDonor {
  id: string
  cmsLocaleId: string
  lastPublished: string
  lastUpdated: string
  createdOn: string
  isArchived: boolean
  isDraft: boolean
  fieldData: {
    'end-date': string
    'start-date': string
    multiplier?: number
    'matching-type': string // Original ID
    status: string // Original ID
    'total-matching-amount': number
    name: string
    slug: string
    'supported-projects': string[] // Original IDs
    contributor?: string
    // Mapped fields
    statusLabel: string
    matchingTypeLabel: string
    // supportedProjectSlugs: string[]
  }
}

export const getMatchingDonorById = async (
  donorId: string
): Promise<MappedMatchingDonor | null> => {
  try {
    // Fetch the donor data from Webflow by donorId
    const response = await webflowClient.get(
      `/collections/${COLLECTION_ID_MATCHING_DONORS}/items/${donorId}`
    )

    // Ensure that the response contains at least one item
    if (response.data) {
      const donor = response.data

      // Map the 'status' option ID to its label
      const statusLabel = await getStatusLabel(donor.fieldData.status)

      // Map the 'matching-type' option ID to its label
      const matchingTypeLabel = await getMatchingTypeLabel(
        donor.fieldData['matching-type']
      )

      // Map the 'supported-projects' IDs to their corresponding project slugs
      // const supportedProjects = await getSupportedProjectsForDonor(donor)

      const mappedDonor: MappedMatchingDonor = {
        id: donor.id,
        cmsLocaleId: donor.cmsLocaleId,
        lastPublished: donor.lastPublished,
        lastUpdated: donor.lastUpdated,
        createdOn: donor.createdOn,
        isDraft: donor.isDraft,
        isArchived: donor.isArchived,
        fieldData: {
          ['end-date']: donor.fieldData['end-date'],
          ['start-date']: donor.fieldData['start-date'],
          multiplier: donor.fieldData['multiplier'],
          ['matching-type']: donor.fieldData['matching-type'],
          status: donor.fieldData['status'],
          ['total-matching-amount']: donor.fieldData['total-matching-amount'],
          name: donor.fieldData['name'],
          slug: donor.fieldData['slug'],
          ['supported-projects']: donor.fieldData['supported-projects'],
          contributor: donor.fieldData['contributor'],
          // Mapped fields
          statusLabel: statusLabel,
          matchingTypeLabel: matchingTypeLabel,
          // supportedProjectSlugs: supportedProjectSlugs,
          // Include any other necessary fields
        },
      }

      return mappedDonor
    } else {
      // Return null if no donor is found
      return null
    }
  } catch (error) {
    console.error('Error fetching donor data from Webflow:', error)
    return null
  }
}

// Helper function to get or set cached data in kv
const getOrSetCache = async <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl = 600
): Promise<T> => {
  const cachedData = await kv.get<T>(key)
  if (cachedData) {
    return cachedData
  }
  const data = await fetchFunction()
  await kv.set(key, data, { ex: ttl })
  return data
}

const initializeOptionMaps = async () => {
  if (!cachedStatusMap) {
    cachedStatusMap = await getOrSetCache<{ [key: string]: string }>(
      'matchingDonors:statusMap',
      async () =>
        await createOptionIdToLabelMap(COLLECTION_ID_MATCHING_DONORS, 'status')
    )
  }

  if (!cachedMatchingTypeMap) {
    cachedMatchingTypeMap = await getOrSetCache<{ [key: string]: string }>(
      'matchingDonors:matchingTypeMap',
      async () =>
        await createOptionIdToLabelMap(
          COLLECTION_ID_MATCHING_DONORS,
          'matching-type'
        )
    )
  }

  if (!cachedProjectStatusMap) {
    cachedProjectStatusMap = await getOrSetCache<{ [key: string]: string }>(
      'projects:statusMap',
      async () =>
        await createOptionIdToLabelMap(COLLECTION_ID_PROJECTS, 'status')
    )
  }
}

/**
 * Get the label for a given field ID from a specified collection.
 * @param collectionId - The ID of the collection.
 * @param fieldSlug - The slug of the field.
 * @param fieldId - The option ID for the field.
 * @returns The label corresponding to the field ID.
 */
export const getLabel = async (
  collectionId: string,
  fieldSlug: string,
  fieldId: string
): Promise<string> => {
  // Ensure all necessary option maps are initialized
  await initializeOptionMaps()

  let label = 'Unknown'

  if (
    collectionId === COLLECTION_ID_MATCHING_DONORS &&
    fieldSlug === 'status'
  ) {
    label = cachedStatusMap?.[fieldId] || 'Unknown Status'
  } else if (
    collectionId === COLLECTION_ID_MATCHING_DONORS &&
    fieldSlug === 'matching-type'
  ) {
    label = cachedMatchingTypeMap?.[fieldId] || 'Unknown Matching Type'
  } else if (
    collectionId === COLLECTION_ID_PROJECTS &&
    fieldSlug === 'status'
  ) {
    label = cachedProjectStatusMap?.[fieldId] || 'Unknown Status'
  }

  return label
}

/**
 * Get the label for a given status ID.
 * @param statusId - The option ID for status.
 * @returns The label corresponding to the status ID.
 */
export const getStatusLabel = async (statusId: string): Promise<string> => {
  await initializeOptionMaps()
  return cachedStatusMap?.[statusId] || 'Unknown Status'
}

/**
 * Get the label for a given matching type ID.
 * @param matchingTypeId - The option ID for matching type.
 * @returns The label corresponding to the matching type ID.
 */
export const getMatchingTypeLabel = async (
  matchingTypeId: string
): Promise<string> => {
  await initializeOptionMaps()
  return cachedMatchingTypeMap?.[matchingTypeId] || 'Unknown Matching Type'
}

/**
 * Fetch the collection schema for a given collection ID.
 * @param collectionId - The ID of the collection.
 * @returns The collection schema.
 */
export const getCollectionSchema = async (
  collectionId: string
): Promise<CollectionSchema> => {
  try {
    const response = await webflowClient.get<CollectionSchema>(
      `/collections/${collectionId}`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error fetching collection schema for ${collectionId}:`,
      error
    )
    throw error
  }
}

// Update createOptionIdToLabelMap to return plain objects that can be cached
export const createOptionIdToLabelMap = async (
  collectionId: string,
  fieldSlug: string
): Promise<{ [key: string]: string }> => {
  const schema = await getCollectionSchema(collectionId)
  const field = schema.fields.find((f) => f.slug === fieldSlug)

  if (!field) {
    const availableFields = schema.fields
      .map((f) => f.slug || f.displayName || f.type)
      .join(', ')
    throw new Error(
      `Field "${fieldSlug}" not found in collection ${collectionId}. Available fields: ${availableFields}`
    )
  }

  if (!field.validations || !field.validations.options) {
    throw new Error(
      `Field "${fieldSlug}" is not an Option field in collection ${collectionId}. Field type: ${field.type}`
    )
  }

  const map: { [key: string]: string } = {}
  field.validations.options.forEach((option) => {
    map[option.id] = option.name.trim()
  })

  return map
}

// Since Map objects can't be directly cached, we'll use plain objects
let cachedStatusMap: { [key: string]: string } | null = null
let cachedMatchingTypeMap: { [key: string]: string } | null = null
let cachedProjectStatusMap: { [key: string]: string } | null = null

/**
 * Function to list collection items with pagination.
 * @param collectionId - The ID of the collection.
 * @param params - Additional query parameters.
 * @returns An array of collection items.
 */
const listCollectionItems = async <T>(
  collectionId: string,
  params: Record<string, any> = {}
): Promise<T[]> => {
  let items: T[] = []
  let offset = 0
  let total = 0
  const limit = 100

  try {
    do {
      const response = await webflowClient.get<WebflowResponse<T>>(
        `/collections/${collectionId}/items`,
        {
          params: {
            limit,
            offset,
            ...params,
          },
        }
      )
      items = items.concat(response.data.items)
      total = response.data.total
      offset += limit
    } while (items.length < total)

    return items
  } catch (error: any) {
    console.error(
      `Error fetching items from collection ${collectionId}:`,
      error.response?.data || error.message
    )
    throw error
  }
}

export const getFAQsByProjectId = async (
  projectId: string
): Promise<FAQItem[]> => {
  const cacheKey = `faqs:project:${projectId}`
  const cachedFAQs = await kv.get<FAQItem[]>(cacheKey)

  if (cachedFAQs) {
    return cachedFAQs
  }

  const faqs = await listCollectionItems<FAQItem>(COLLECTION_ID_FAQS)

  // Filter FAQs by project ID and exclude drafts and archived items
  const projectFAQs = faqs
    .filter(
      (faq) =>
        faq.fieldData.project === projectId && !faq.isDraft && !faq.isArchived
    )
    .sort((a, b) => (a.fieldData.order || 0) - (b.fieldData.order || 0)) // Optional sorting

  // Cache the FAQs
  await kv.set(cacheKey, projectFAQs, { ex: 259200 })

  return projectFAQs
}

/**
 * Get FAQs for a specific project by its slug.
 * @param slug - The slug of the project.
 * @returns An array of FAQItems related to the project or an empty array if the project is not found.
 */
export const getFAQsByProjectSlug = async (
  slug: string
): Promise<FAQItem[]> => {
  // Fetch the project using its slug
  const project = await getProjectBySlug(slug)

  if (!project) {
    console.warn(`No project found with slug "${slug}".`)
    return []
  }

  // Use the existing function to get FAQs by project ID
  const faqs = await getFAQsByProjectId(project.id)

  return faqs
}

const calculateRemainingAmount = async (
  donor: MatchingDonor
): Promise<number> => {
  const donorId = donor.id
  // Aggregate the total matched amount for this donor
  const totalMatched = await prisma.matchingDonationLog.aggregate({
    where: {
      donorId,
    },
    _sum: {
      matchedAmount: true,
    },
  })

  const totalMatchedAmount: number =
    totalMatched._sum.matchedAmount?.toNumber() ?? 0

  const totalMatchingAmount: number =
    Number(donor.fieldData['total-matching-amount']) || 0
  const remainingAmount = totalMatchingAmount - totalMatchedAmount
  return remainingAmount
}

export const getActiveMatchingDonors = async (): Promise<
  MatchingDonorWithRemainingAmount[]
> => {
  console.log('webflow get active matching donors')

  // Directly fetch donors without cache
  const donors = await listCollectionItems<MatchingDonor>(
    COLLECTION_ID_MATCHING_DONORS
  )

  const now = new Date()

  // Use field slugs to get the option maps
  const statusMap = await createOptionIdToLabelMap(
    COLLECTION_ID_MATCHING_DONORS,
    'status'
  )

  // Initialize the activeDonors array with explicit type annotation
  const activeDonors: MatchingDonorWithRemainingAmount[] = []

  // Filter active donors within the date range and with remaining matching amount
  for (const donor of donors) {
    const startDate = new Date(donor.fieldData['start-date'])
    const endDate = new Date(donor.fieldData['end-date'])

    const statusId = donor.fieldData['status']
    const statusLabel = statusMap[statusId] || 'Unknown Status'

    const isActive = statusLabel === 'Active'
    const withinDateRange = now >= startDate && now <= endDate
    const notDraftOrArchived = !donor.isDraft && !donor.isArchived

    if (isActive && withinDateRange && notDraftOrArchived) {
      const remainingAmount = await calculateRemainingAmount(donor)
      const hasRemainingAmount = remainingAmount > 0

      if (hasRemainingAmount) {
        // Include the remainingAmount in the donor object
        const donorWithRemaining: MatchingDonorWithRemainingAmount = {
          ...donor,
          remainingAmount, // add the remainingAmount
        }
        activeDonors.push(donorWithRemaining)
      }
    }
  }

  return activeDonors
}

export const getMatchingTypeLabelForDonor = async (
  donor: MatchingDonor
): Promise<string> => {
  // Use field slugs to get the option map for matching-type
  const matchingTypeMap = await createOptionIdToLabelMap(
    COLLECTION_ID_MATCHING_DONORS,
    'matching-type'
  )

  // Retrieve the matching type ID from the donor's fieldData
  const matchingTypeId = donor.fieldData['matching-type']

  // Find the corresponding label from the matching type map
  const matchingTypeLabel =
    matchingTypeMap[donor.fieldData['matching-type']] || 'Unknown Matching Type'

  return matchingTypeLabel
}

/**
 * Get a single project by its slug along with its related updates and contributors.
 * @param slug - The slug of the project.
 * @returns The project object with associated updates and contributors or undefined if not found.
 */
export const getProjectBySlug = async (
  slug: string
): Promise<ProjectWithUpdatesAndContributors | undefined> => {
  const cacheKey = `project:${slug}2`
  const cachedProject = await kv.get<ProjectWithUpdatesAndContributors>(
    cacheKey
  )

  if (cachedProject) {
    return cachedProject
  }

  // Fetch the project from Webflow
  const projectResponse = await webflowClient.get<WebflowResponse<Project>>(
    `/collections/${COLLECTION_ID_PROJECTS}/items`,
    {
      params: { slug },
    }
  )

  const project = projectResponse.data.items[0]

  if (!project || project.isDraft) {
    return undefined // Exclude draft or archived projects
  }

  // Fetch the status label by mapping the ID
  const statusLabel = await getLabel(
    COLLECTION_ID_PROJECTS,
    'status',
    project.fieldData.status
  )

  // Fetch updates and contributors as before
  const [updates, allContributors] = await Promise.all([
    getAllUpdates(),
    getAllActiveContributors(),
  ])

  // Filter updates related to the fetched project
  const projectUpdates = updates.filter(
    (update) => update.fieldData.project === project.id
  )

  // Helper function to fetch contributor details by IDs
  const getContributorsByIds = (ids: string[]): Contributor[] => {
    return allContributors.filter((contributor) => ids.includes(contributor.id))
  }

  // Get contributors for each category
  const litecoinContributors = getContributorsByIds(
    project.fieldData['litecoin-contributors-2'] || []
  )

  const bitcoinContributors = getContributorsByIds(
    project.fieldData['bitcoin-contributors-2'] || []
  )

  const advocates = getContributorsByIds(project.fieldData['advocates-2'] || [])

  // Combine data into projectWithContributors
  const projectWithContributors: ProjectWithUpdatesAndContributors = {
    ...project,
    updates: projectUpdates,
    litecoinContributors,
    bitcoinContributors,
    advocates,
    // Update status label here
    fieldData: {
      ...project.fieldData,
      status: statusLabel, // Ensure the status is now a human-readable label
    },
  }

  // Cache the result with an appropriate TTL (e.g., 1 hour)
  await kv.set(cacheKey, projectWithContributors, { ex: 259200 })

  return projectWithContributors
}

export const getContributorsByIds = async (
  contributorIds: string[]
): Promise<string> => {
  // Fetch all active contributors
  const allContributors = await getAllActiveContributors()

  // Ensure contributors is an array and is not null/undefined
  if (!Array.isArray(contributorIds)) {
    throw new Error('Contributors must be an array')
  }

  // Helper function to fetch contributor details by IDs
  const fetchContributorsByIds = (ids: string[]): string[] => {
    return allContributors
      .filter((contributor) => ids.includes(contributor.id))
      .map((contributor) => {
        const twitterLink = contributor.fieldData['twitter-link'] || ''
        // Extract the Twitter handle from the link (removes the URL part)
        return twitterLink
          .replace('http://x.com/', '')
          .replace('https://x.com/', '')
      })
  }

  return fetchContributorsByIds(contributorIds).join(',')
}

/**
 * Get all contributors.
 * @returns An array of all contributors.
 */
// Modify your data fetching functions to use the cache
export const getAllContributors = async (): Promise<Contributor[]> => {
  const cacheKey = 'contributors:all'
  const cachedContributors = await kv.get<Contributor[]>(cacheKey)

  if (cachedContributors) {
    return cachedContributors
  }

  const contributors = await listCollectionItems<Contributor>(
    COLLECTION_ID_CONTRIBUTORS
  )

  // Cache the result with an appropriate TTL (e.g., 10 minutes)
  await kv.set(cacheKey, contributors, { ex: 259200 })

  return contributors
}

/**
 * Get all active contributors.
 * @returns An array of active contributors.
 */
export const getAllActiveContributors = async (): Promise<Contributor[]> => {
  const contributors = await getAllContributors()
  // Filter out draft and archived contributors
  return contributors.filter(
    (contributor) => !contributor.isDraft && !contributor.isArchived
  )
}

/**
 * Get all active (non-archived and non-draft) projects with selected fields.
 * @returns An array of ProjectSummaryLite objects.
 */
export const getAllProjects = async (): Promise<ProjectSummaryLite[]> => {
  const cacheKey = 'projects:all'
  const cachedProjects = await kv.get<ProjectSummaryLite[]>(cacheKey)

  if (cachedProjects) {
    return cachedProjects
  }

  // Fetch projects from Webflow API
  const projects = await listCollectionItems<Project>(COLLECTION_ID_PROJECTS)
  const filteredProjects = projects.filter((project) => !project.isDraft)
  // console.log('utils/webflow/gtAllProjects: ', projects)

  // Process projects
  const projectSummaries = await Promise.all(
    filteredProjects.map(async (project) => {
      // Map status ID to label
      const statusLabel = await getLabel(
        COLLECTION_ID_PROJECTS,
        'status',
        project.fieldData.status
      )

      return {
        id: project.id,
        lastUpdated: project.lastUpdated,
        createdOn: project.createdOn,
        isDraft: project.isDraft,
        fieldData: {
          summary: project.fieldData.summary,
          name: project.fieldData.name,
          slug: project.fieldData.slug,
          'cover-image': project.fieldData['cover-image'],
          'total-paid': project.fieldData['total-paid'],
          status: statusLabel,
        },
      }
    })
  )

  // Cache the result
  await kv.set(cacheKey, projectSummaries, { ex: 259200 }) // 1 hour cache

  return projectSummaries
}

/**
 * Get all posts.
 * @returns An array of all posts.
 */
export const getAllPosts = async (): Promise<Post[]> => {
  const cacheKey = 'posts:all'
  const cachedPosts = await kv.get<Post[]>(cacheKey)

  if (cachedPosts) {
    return cachedPosts
  }

  const posts = await listCollectionItems<Post>(COLLECTION_ID_POSTS)

  // Cache the posts
  await kv.set(cacheKey, posts, { ex: 259200 })

  return posts
}

/**
 * Get all updates.
 * @returns An array of all updates.
 */
export const getAllUpdates = async (): Promise<Update[]> => {
  const cacheKey = 'updates:all'
  const cachedUpdates = await kv.get<Update[]>(cacheKey)

  if (cachedUpdates) {
    return cachedUpdates
  }

  const updates = await listCollectionItems<Update>(COLLECTION_ID_UPDATES)

  // Cache the updates
  await kv.set(cacheKey, updates, { ex: 259200 })

  return updates
}

export const getProjectUpdates = async (): Promise<Update[]> => {
  const updates = await getAllUpdates()
  return updates
}

/**
 * Get updates for a specific project by slug.
 * @param slug - The slug of the project.
 * @returns An array of updates related to the project.
 */
export const getProjectUpdatesBySlug = async (
  slug: string
): Promise<Update[]> => {
  const project = await getProjectBySlug(slug)
  if (!project) return []
  const allUpdates = await getAllUpdates()

  // Filter out archived and draft updates
  return allUpdates.filter(
    (update) =>
      update.fieldData.project === project.id &&
      !update.isArchived &&
      !update.isDraft
  )
}

/**
 * Get posts matching a given slug.
 * @param slug - The slug to match.
 * @returns An array of posts matching the slug.
 */
export const getPostsBySlug = async (slug: string): Promise<Post[]> => {
  try {
    const project = await getProjectBySlug(slug)
    const filteredPosts = await getPostsByProjectIdLocal(project?.id || '')
    return filteredPosts
  } catch (error) {
    console.error(`Error fetching posts with slug ${slug}:`, error)
    return []
  }
}

/**
 * Get all posts associated with a specific project ID.
 * TODO: return only posts where isArhived = false
 * @param projectId - The ID of the project.
 * @returns An array of posts related to the project.
 */
export const getPostsByProjectIdLocal = async (
  projectId: string
): Promise<Post[]> => {
  const allPosts = await getAllPosts()
  //
  const filteredPosts = allPosts.filter((post) => {
    const projects = post.fieldData['projects']

    return Array.isArray(projects) && projects.includes(projectId)
  })
  return filteredPosts
}

// Add a new cache for projects by ID
let cachedProjectsMap: { [key: string]: ProjectSummaryLite } = {}

/**
 * Initialize and cache all projects in a Map for quick lookup by ID.
 */
const initializeProjectsMap = async () => {
  const cacheKey = 'projects1:map'
  const cachedMap = await kv.get<{ [key: string]: ProjectSummaryLite }>(
    cacheKey
  )

  if (cachedMap) {
    cachedProjectsMap = cachedMap
    return
  }

  const projects = await getAllProjects()
  const projectsMap: { [key: string]: ProjectSummaryLite } = {}
  projects.forEach((project) => {
    projectsMap[project.id] = project
  })

  // Cache the map
  await kv.set(cacheKey, projectsMap, { ex: 259200 })
  cachedProjectsMap = projectsMap
}

/**
 * Get the list of supported projects for a given MatchingDonor.
 * @param donor - The MatchingDonor object.
 * @returns An array of Project slugs that the donor supports.
 */
export const getSupportedProjectsForDonor = async (
  donor: MatchingDonor
): Promise<string[]> => {
  // Ensure the projects map is initialized and cached
  await initializeProjectsMap()

  // Extract supported project IDs from the donor
  const supportedProjectIds = donor.fieldData['supported-projects']

  if (!supportedProjectIds || supportedProjectIds.length === 0) {
    return []
  }

  // Retrieve the corresponding Project objects from the cached map
  const supportedProjects: string[] = supportedProjectIds
    .map((projectId) => {
      const project = cachedProjectsMap[projectId]
      if (!project) {
        console.warn(
          `Project with ID "${projectId}" not found for donor "${donor.fieldData['name']}".`
        )
      }
      return project?.fieldData.slug
    })
    .filter((projectSlug): projectSlug is string => projectSlug !== undefined)

  return supportedProjects
}
