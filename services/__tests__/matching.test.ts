// services/__tests__/matching.test.ts

import { processDonationMatching } from '../matching'
import { Decimal } from 'decimal.js'

// Mock modules
jest.mock('../../utils/webflow', () => ({
  getActiveMatchingDonors: jest.fn(),
  updateMatchingDonor: jest.fn(),
  logMatchingDonation: jest.fn(),
  getMatchingTypeLabel: jest.fn(),
}))

jest.mock('../../lib/prisma', () => ({
  prisma: {
    donation: {
      update: jest.fn(),
    },
  },
  getUnprocessedDonations: jest.fn(),
}))

import * as webflow from '../../utils/webflow'
import { prisma, getUnprocessedDonations } from '../../lib/prisma'

describe('processDonationMatching', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process donations and match with eligible donors', async () => {
    // Mock donations
    const mockDonations = [
      {
        id: 1,
        amount: new Decimal(100),
        projectSlug: 'project-slug-1',
        processed: false,
      },
    ]

    // Mock matching donors
    const mockMatchingDonors = [
      {
        id: 'donor-1',
        slug: 'donor-slug-1',
        isDraft: false,
        isArchived: false,
        fieldData: {
          name: 'Donor One',
          'matching-type': 'matching-type-option-id',
          'total-matching-amount': 500,
          'remaining-matching-amount': 200,
          'supported-projects': null,
          'start-date': '2023-01-01',
          'end-date': '2024-01-01',
          multiplier: 1,
          status: 'status-option-id',
        },
      },
    ]

    // Mock implementations
    ;(getUnprocessedDonations as jest.Mock).mockResolvedValue(mockDonations)
    ;(webflow.getActiveMatchingDonors as jest.Mock).mockResolvedValue(
      mockMatchingDonors
    )
    ;(webflow.getMatchingTypeLabel as jest.Mock).mockImplementation(
      (optionId: string) => {
        if (optionId === 'matching-type-option-id') {
          return 'All Projects'
        }
        return 'Unknown'
      }
    )
    ;(webflow.updateMatchingDonor as jest.Mock).mockResolvedValue(true)
    ;(webflow.logMatchingDonation as jest.Mock).mockResolvedValue(true)
    ;(prisma.donation.update as jest.Mock).mockResolvedValue(true)

    // Execute the function
    await processDonationMatching()

    // Assertions
    expect(getUnprocessedDonations).toHaveBeenCalled()
    expect(webflow.getActiveMatchingDonors).toHaveBeenCalled()
    expect(webflow.getMatchingTypeLabel).toHaveBeenCalledWith(
      'matching-type-option-id'
    )
    expect(webflow.updateMatchingDonor).toHaveBeenCalledWith('donor-1', 100)
    expect(webflow.logMatchingDonation).toHaveBeenCalledWith({
      donorId: 'donor-1',
      donationId: 1,
      matchedAmount: 100,
      date: expect.any(String),
      projectId: 'project-slug-1',
    })
    expect(prisma.donation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { processed: true },
    })
  })
})
