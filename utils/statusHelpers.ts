// utils/statusHelpers.ts
import { ProjectCategory, BountyStatus } from './types'

export function determineProjectType(status: string): ProjectCategory {
  if (status === 'Open') {
    return ProjectCategory.PROJECT
  } else if (
    status === 'Bounty Open' ||
    status === 'Bounty Closed' ||
    status === 'Completed' ||
    status === 'Closed' ||
    status === 'Bounty Completed'
  ) {
    return ProjectCategory.BOUNTY
  } else {
    return ProjectCategory.OTHER // Handle other cases accordingly
  }
}

export function determineBountyStatus(
  status: string
): BountyStatus | undefined {
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

export function isButtonDisabled(bountyStatus?: BountyStatus): boolean {
  return (
    bountyStatus === BountyStatus.COMPLETED ||
    bountyStatus === BountyStatus.BOUNTY_COMPLETED ||
    bountyStatus === BountyStatus.CLOSED ||
    bountyStatus === BountyStatus.BOUNTY_CLOSED
  )
}

export function getButtonText(bountyStatus?: BountyStatus): string {
  if (
    bountyStatus === BountyStatus.COMPLETED ||
    bountyStatus === BountyStatus.BOUNTY_COMPLETED
  ) {
    return 'PROJECT COMPLETED'
  } else if (
    bountyStatus === BountyStatus.CLOSED ||
    bountyStatus === BountyStatus.BOUNTY_CLOSED
  ) {
    return 'PROJECT CLOSED'
  } else {
    return 'DONATE'
  }
}
