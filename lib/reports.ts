import PDFDocument from 'pdfkit'
import prisma from './prisma'
import { Prisma } from '@prisma/client'

type DonationWithMatch = {
  id: number
  donorEmail: string | null
  firstName: string | null
  lastName: string | null
  valueAtDonationTimeUSD: Prisma.Decimal | null
  matchedAmount: Prisma.Decimal
}

export async function generateReport(
  timeInMs: number,
  reportType: 'Daily' | 'Monthly'
): Promise<Buffer> {
  const since = new Date(Date.now() - timeInMs)

  const donations = await prisma.donation.findMany({
    where: {
      createdAt: {
        gte: since,
      },
      status: {
        in: ['Complete', 'Advanced'],
      },
      valueAtDonationTimeUSD: {
        gte: 2,
      },
    },
    select: {
      id: true,
      projectSlug: true,
      valueAtDonationTimeUSD: true,
      donorEmail: true,
      firstName: true,
      lastName: true,
    },
  })

  const matchingDonations = await prisma.matchingDonationLog.findMany({
    where: {
      date: {
        gte: since,
      },
    },
    select: {
      donationId: true,
      matchedAmount: true,
    },
  })

  const donationsById: { [key: number]: DonationWithMatch } = {}
  donations.forEach((d) => {
    if (d.valueAtDonationTimeUSD) {
      donationsById[d.id] = {
        ...d,
        matchedAmount: new Prisma.Decimal(0),
      }
    }
  })

  matchingDonations.forEach((md) => {
    if (donationsById[md.donationId]) {
      donationsById[md.donationId].matchedAmount = md.matchedAmount
    }
  })

  const projects: {
    [key: string]: {
      donations: DonationWithMatch[]
      total: Prisma.Decimal
      matchTotal: Prisma.Decimal
    }
  } = {}

  Object.values(donationsById).forEach((d) => {
    const projectSlug = (d as any).projectSlug
    if (!projects[projectSlug]) {
      projects[projectSlug] = {
        donations: [],
        total: new Prisma.Decimal(0),
        matchTotal: new Prisma.Decimal(0),
      }
    }
    projects[projectSlug].donations.push(d)
    projects[projectSlug].total = projects[projectSlug].total.plus(
      d.valueAtDonationTimeUSD ?? 0
    )
    projects[projectSlug].matchTotal = projects[projectSlug].matchTotal.plus(
      d.matchedAmount
    )
  })

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument()
    const buffers: any[] = []

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })
    doc.on('error', reject)

    doc.fontSize(16).text(`${reportType} Donation Summary`, { align: 'center' })
    doc.moveDown()

    if (donations.length === 0 && matchingDonations.length === 0) {
      doc
        .fontSize(12)
        .text(
          `No donations in the last ${timeInMs / (1000 * 60 * 60 * 24)} days.`,
          { align: 'center' }
        )
      doc.end()
      return
    }

    for (const slug in projects) {
      const p = projects[slug]
      doc
        .fontSize(14)
        .text(`Project: ${slug}`, { underline: true })
        .moveDown(0.5)
      doc
        .fontSize(12)
        .text(
          `Total Donations: ${p.total.toFixed(
            2
          )} USD | Total Matched: ${p.matchTotal.toFixed(2)} USD`
        )
      doc.moveDown()

      for (const d of p.donations) {
        const donationLine = `- ${d.firstName ?? ''} ${d.lastName ?? ''} (${
          d.donorEmail ?? 'no-email'
        }): ${d.valueAtDonationTimeUSD?.toFixed(
          2
        )} USD (Matched: ${d.matchedAmount.toFixed(2)} USD)\n`
        doc.fontSize(10).text(donationLine)
      }
      doc.moveDown()
    }

    doc.end()
  })
}

export async function getMatchedDonations(): Promise<number> {
  const donationsMatchedResult = await prisma.matchingDonationLog.aggregate({
    _sum: {
      matchedAmount: true,
    },
  })

  return donationsMatchedResult._sum.matchedAmount?.toNumber() ?? 0
}
