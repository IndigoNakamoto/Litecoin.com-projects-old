// utils/md.ts
import fs, { existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { ProjectItem, ProjectUpdate } from './types'
const postsDirectory = join(process.cwd(), 'data/projects')

const FIELDS = [
  'title',
  'slug',
  'coverImage',
  'summary',
  'content',
  'gitRepository',
  'telegramLink',
  'website',
  'twitterHandle',
  'discordLink',
  'facebookLink',
  'redditLink',
  'nym',
  'hidden',
  'type',
  'contributor',
  'contributorsBitcoin',
  'contributorsLitecoin',
  'advocates',
  'owner',
  'hashtag',
  'socialSummary',
  'bountyAmount',
  'bountyStatus',
  'targetFunding',
  'fundingDeadline',
  'serviceFeesCollected',
  'isRecurring',
  'matchingTotal',
  'isMatching',
  'isBitcoinOlympics2024',
  'matchingMultiplier',
  'recurringAmountGoal',
  'recurringPeriod',
  'recurringStatus',
  'totalPaid',
]

const UPDATE_FIELDS = [
  'title',
  'date',
  'summary',
  'tags',
  'id',
  'authorTwitterHandle',
]

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory)
}

export function getSingleFile(path: string) {
  const fullPath = join(process.cwd(), path)
  return fs.readFileSync(fullPath, 'utf8')
}

export function getPostBySlug(
  slug: string,
  includeHidden = false
): ProjectItem {
  const fields = FIELDS
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}/${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: any = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }
    if (field === 'contributor') {
      items[field] = content
    }
    if (field === 'contributorsBitcoin') {
      items[field] = content
    }
    if (field === 'contributorsLitecoin') {
      items[field] = content
    }
    if (field === 'advocates') {
      items[field] = content
    }
    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })
  if (items.hidden && !includeHidden) {
    throw new Error('Hidden project')
  }
  return items
}

export function getAllPostUpdates(slug: string): ProjectUpdate[] {
  const realSlug = slug.replace(/\.md$/, '')
  const postUpdatesDirectory = join(
    process.cwd(),
    `data/projects/${realSlug}/updates/`
  )

  const updates = fs.readdirSync(postUpdatesDirectory)

  const updatesModified = updates.map((update) => {
    try {
      const fields = UPDATE_FIELDS
      const realSlug = update.replace(/\.md$/, '')
      const fullPath = join(postUpdatesDirectory, `/${realSlug}.md`)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      const items: ProjectUpdate = {
        content: '',
        title: '',
        summary: '',
        date: '',
        authorTwitterHandle: '',
        id: 0,
      }

      fields.forEach((field) => {
        if (field === 'title') {
          items[field] = realSlug
        }
        if (field === 'summary') {
          items[field] = content
        }
        if (field === 'date') {
          items[field] = content
        }
        if (field === 'content') {
          items[field] = content
        }
        if (field === 'authorTwitterHandle') {
          items['authorTwitterHandle'] = data['authorTwitterHandle']
        }
        if (typeof data[field] !== 'undefined') {
          items[field] = data[field]
        }
        items['content'] = content
        items['id'] = data['id']
      })
      return items
    } catch {
      return {
        content: '',
        title: '',
        summary: '',
        date: '',
        authorTwitterHandle: '',
        id: 0,
      }
    }
  })

  return updatesModified.sort((a, b) => b.id - a.id)
}

export function getAllPosts(): ProjectItem[] {
  const slugs = getPostSlugs()
  //get all posts & return them but make sure to catch errors from getPostBySlug and filter them out
  return slugs
    .map((slug) => {
      try {
        return getPostBySlug(slug)
      } catch {
        return null
      }
    })
    .filter((a) => a != null) as ProjectItem[]
}
