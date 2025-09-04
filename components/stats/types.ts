import { AddressStats } from '../../utils/types'

export type GeneralStats = {
  addressStats: AddressStats
  litecoinRaised: number
  litecoinPaid: number
  totalPaid: number
}

export type MatchingData = {
  isMatching: boolean
  matchingDonors: any[]
  matchingTotal: number
}
