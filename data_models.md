# Data Models

This document outlines the data models used in the Litecoin OpenSource Fund project, as defined in the `prisma/schema.prisma` file.

## Models

### Token

Stores OAuth tokens for authentication.

| Field          | Type     | Description                              |
| :------------- | :------- | :--------------------------------------- |
| `id`           | Int      | Primary key.                             |
| `accessToken`  | String   | The access token.                        |
| `refreshToken` | String   | The refresh token.                       |
| `expiresAt`    | DateTime | The expiration date of the access token. |
| `refreshedAt`  | DateTime | The date the token was last refreshed.   |

### Donation

Represents a donation to a project.

| Field                    | Type         | Description                                               |
| :----------------------- | :----------- | :-------------------------------------------------------- |
| `id`                     | Int          | Primary key.                                              |
| `createdAt`              | DateTime     | Timestamp of when the donation was created.               |
| `updatedAt`              | DateTime     | Timestamp of when the donation was last updated.          |
| `projectSlug`            | String       | The slug of the project the donation is for.              |
| `organizationId`         | Int          | The ID of the organization associated with the project.   |
| `donationType`           | DonationType | The type of donation (fiat, crypto, or stock).            |
| `pledgeAmount`           | Decimal      | The amount of the pledge.                                 |
| `assetSymbol`            | String?      | The symbol of the asset donated (e.g., LTC).              |
| `assetDescription`       | String?      | A description of the asset.                               |
| `firstName`              | String?      | The first name of the donor.                              |
| `lastName`               | String?      | The last name of the donor.                               |
| `donorEmail`             | String?      | The email address of the donor.                           |
| `isAnonymous`            | Boolean      | Whether the donor wishes to remain anonymous.             |
| `taxReceipt`             | Boolean      | Whether the donor requested a tax receipt.                |
| `joinMailingList`        | Boolean      | Whether the donor wants to join the mailing list.         |
| `socialX`                | String?      | The donor's X (Twitter) profile URL.                      |
| `socialXimageSrc`        | String?      | The URL of the donor's X (Twitter) profile image.         |
| `socialFacebook`         | String?      | The donor's Facebook profile URL.                         |
| `socialFacebookimageSrc` | String?      | The URL of the donor's Facebook profile image.            |
| `socialLinkedIn`         | String?      | The donor's LinkedIn profile URL.                         |
| `socialLinkedInimageSrc` | String?      | The URL of the donor's LinkedIn profile image.            |
| `donationUuid`           | String?      | The UUID of the donation (for stock donations).           |
| `pledgeId`               | String?      | The ID of the pledge (for crypto/fiat donations).         |
| `depositAddress`         | String?      | The deposit address for crypto donations.                 |
| `success`                | Boolean      | Whether the donation was successful.                      |
| `processed`              | Boolean      | Whether the donation has been processed for matching.     |
| `transactionHash`        | String?      | The transaction hash of the donation.                     |
| `convertedAt`            | DateTime?    | The timestamp of when the donation was converted.         |
| `netValueAmount`         | Decimal?     | The net value amount of the donation.                     |
| `netValueCurrency`       | String?      | The currency of the net value amount.                     |
| `grossAmount`            | Decimal?     | The gross amount of the donation.                         |
| `payoutAmount`           | Decimal?     | The payout amount of the donation.                        |
| `payoutCurrency`         | String?      | The currency of the payout amount.                        |
| `externalId`             | String?      | The external ID of the donation.                          |
| `campaignId`             | String?      | The campaign ID associated with the donation.             |
| `valueAtDonationTimeUSD` | Decimal?     | The value of the donation in USD at the time of donation. |
| `currency`               | String?      | The currency of the donation.                             |
| `amount`                 | Decimal?     | The amount of the donation.                               |
| `status`                 | String?      | The status of the donation.                               |
| `timestampms`            | DateTime?    | The timestamp of the donation in milliseconds.            |
| `eid`                    | String?      | The event ID of the donation.                             |
| `paymentMethod`          | String?      | The payment method used for the donation.                 |
| `eventData`              | Json?        | Additional event data.                                    |

### MatchingDonationLog

Logs matching donations.

| Field           | Type     | Description                                   |
| :-------------- | :------- | :-------------------------------------------- |
| `id`            | Int      | Primary key.                                  |
| `donorId`       | String   | The ID of the donor.                          |
| `donationId`    | Int      | The ID of the donation being matched.         |
| `matchedAmount` | Decimal  | The amount that was matched.                  |
| `date`          | DateTime | The date of the matching donation.            |
| `projectSlug`   | String   | The slug of the project the donation was for. |

### WebhookEvent

Stores individual webhook events.

| Field        | Type     | Description                                           |
| :----------- | :------- | :---------------------------------------------------- |
| `id`         | Int      | Primary key.                                          |
| `eventType`  | String   | The type of the webhook event.                        |
| `payload`    | Json     | The decrypted payload of the webhook event.           |
| `receivedAt` | DateTime | The timestamp of when the webhook event was received. |
| `processed`  | Boolean  | Whether the webhook event has been processed.         |
| `donationId` | Int      | The ID of the donation associated with the event.     |
| `eid`        | String?  | The unique event ID.                                  |

### Log

Stores logs for debugging and monitoring.

| Field       | Type     | Description                              |
| :---------- | :------- | :--------------------------------------- |
| `id`        | Int      | Primary key.                             |
| `level`     | String   | The log level (e.g., info, warn, error). |
| `message`   | String   | The log message.                         |
| `meta`      | Json?    | Additional metadata.                     |
| `timestamp` | DateTime | The timestamp of the log.                |

## Enums

### DonationType

| Value    | Description                          |
| :------- | :----------------------------------- |
| `fiat`   | A donation made with fiat currency.  |
| `crypto` | A donation made with cryptocurrency. |
| `stock`  | A donation made with stock.          |
