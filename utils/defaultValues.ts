// utils/defaultValues.ts

import { AddressStats, BountyStatus } from './types' // Adjust the path if necessary

/**
 * Default values for AddressStats.
 * Ensure that all required fields in AddressStats are provided.
 */
export const defaultAddressStats: AddressStats = {
  tx_count: 0,
  funded_txo_sum: 0,
  supporters: [], // Default to an empty array
}

/**
 * Default value for BountyStatus.
 * Replace 'active' with the appropriate default status based on your application's logic.
 */
export const defaultBountyStatus: BountyStatus = BountyStatus.OPEN // Using the enum value

/**
 * Additional default values can be defined here if needed.
 * For example, if you have default values for other types or configurations.
 */
