# API Specification Sheet

This document provides a specification for the API endpoints used in the Litecoin OpenSource Fund project.

## Endpoints

### POST /api/send-report

**Description:** Manually triggers the generation and sending of a daily or monthly report to a Discord webhook.

**Request Method:** POST

**Request Body:**

```json
{
  "reportType": "Daily"
}
```

or

```json
{
  "reportType": "Monthly"
}
```

**Response Body:**

```json
{
  "message": "Daily summary sent successfully."
}
```

or

```json
{
  "message": "Monthly summary sent successfully."
}
```

### GET /api/stats

**Description:** Retrieves key statistics about the projects, donations, and matching funds.

**Request Method:** GET

**Response Body:**

```json
{
  "projectsSupported": "integer",
  "totalPaid": "number",
  "donationsRaised": "number",
  "donationsMatched": "number"
}
```

### POST /api/btcpay

**Description:** Creates a BTCPay Server invoice for a donation.

**Request Method:** POST

**Request Body:**

```json
{
  "amount": "number",
  "project_slug": "string",
  "email": "string",
  "name": "string",
  "twitter": "string"
}
```

**Response Body:**

```json
{
  "id": "string",
  "checkoutLink": "string"
}
```

### POST /api/webhookGivingBlock

**Description:** Handles webhooks from The Giving Block. (Implementation is currently commented out).

**Request Method:** POST

### GET /api/twitterUsers

**Description:** Fetches user data from Twitter for a list of usernames.

**Request Method:** GET

**Query Parameters:**

```
usernames: string (comma-separated)
clearCache: boolean (optional)
```

**Response Body:**

```json
[
  {
    "name": "string",
    "screen_name": "string",
    "profile_image_url_https": "string"
  }
]
```

### POST /api/submitStockDonation

**Description:** Submits a stock donation.

**Request Method:** POST

**Request Body:**

```json
{
  "donationUuid": "string",
  "brokerName": "string",
  "brokerageAccountNumber": "string",
  "brokerContactName": "string",
  "brokerEmail": "string",
  "brokerPhone": "string"
}
```

**Response Body:**

```json
{
  "isSuccess": "boolean"
}
```

### POST /api/signStockDonation

**Description:** Signs a stock donation.

**Request Method:** POST

**Request Body:**

```json
{
  "donationUuid": "string",
  "date": "string",
  "signature": "string"
}
```

**Response Body:**

```json
{
  "isSuccess": "boolean"
}
```

### POST /api/sendgrid

**Description:** Sends an application confirmation email to the applicant and the application details to the organization.

**Request Method:** POST

**Request Body:**

```json
{
  "email": "string",
  "project_name": "string"
  // ... other form fields
}
```

**Response Body:**

```json
{
  "message": "success"
}
```

### POST /api/process-matching

**Description:** Triggers the donation matching process.

**Request Method:** POST

**Response Body:**

```json
{
  "message": "string"
}
```

### POST /api/postCurrenciesList

**Description:** Retrieves a list of supported currencies from The Giving Block.

**Request Method:** POST

**Response Body:**

```json
[
  {
    "currency": "string",
    "name": "string",
    "image": "string"
  }
]
```

### POST /api/newsletter

**Description:** Subscribes a user to the newsletter. The exact request and response depend on the configured provider in `siteMetadata.js`.

**Request Method:** POST

### GET /api/matching-donors-by-project

**Description:** Retrieves matching donors for a specific project.

**Request Method:** GET

**Query Parameters:**

```
slug: string
```

**Response Body:**

```json
[
  {
    "id": "string",
    "name": "string"
    // ... other donor fields
  }
]
```

### POST /api/github

**Description:** Creates a GitHub issue for a new project submission.

**Request Method:** POST

**Request Body:**

```json
{
  "project_overview": {
    "project_name": "string",
    "project_description": "string",
    "main_focus": "string",
    "potential_impact": "string",
    "project_repository": "string",
    "social_media_links": "string",
    "open_source": "string",
    "open_source_license": "string",
    "partially_open_source": "string"
  },
  "project_budget": {
    "proposed_budget": "string",
    "received_funding": "boolean",
    "prior_funding_details": "string"
  },
  "applicant_information": {
    "your_name": "string",
    "email": "string",
    "is_lead_contributor": "boolean",
    "other_lead": "string",
    "personal_github": "string",
    "other_contact_details": "string",
    "prior_contributions": "string",
    "references": "string"
  }
}
```

**Response Body:**

```json
{
  "message": "success"
}
```

### GET /api/getWidgetSnippet

**Description:** Retrieves a widget snippet from The Giving Block.

**Request Method:** GET

**Response Body:**

```json
{
  "snippet": "string"
}
```

### GET /api/getTweets

**Description:** Fetches recent tweets with a specific hashtag.

**Request Method:** GET

**Query Parameters:**

```
hashtag: string
```

**Response Body:**

```json
["string"]
```

### POST /api/getTickerList

**Description:** Retrieves a list of stock tickers based on filters and pagination.

**Request Method:** POST

**Request Body:**

```json
{
  "filters": {
    "name": "string",
    "ticker": "string"
  },
  "pagination": {
    "page": "number",
    "itemsPerPage": "number"
  }
}
```

**Response Body:**

```json
{
  "data": {
    "tickers": [
      {
        "name": "string",
        "ticker": "string"
      }
    ],
    "pagination": {
      "count": "number",
      "page": "number",
      "itemsPerPage": "number"
    }
  }
}
```

### GET /api/getTickerCost

**Description:** Retrieves the cost of a stock ticker.

**Request Method:** GET

**Query Parameters:**

```
ticker: string
```

**Response Body:**

```json
{
  "cost": "number"
}
```

### GET /api/getProcessedDonations

**Description:** Retrieves a list of processed donations.

**Request Method:** GET

**Response Body:**

```json
[
  {
    "id": "number",
    "createdAt": "string",
    "updatedAt": "string",
    "projectSlug": "string",
    "organizationId": "number",
    "donationType": "string",
    "pledgeAmount": "number",
    "assetSymbol": "string",
    "assetDescription": "string",
    "firstName": "string",
    "lastName": "string",
    "donorEmail": "string",
    "isAnonymous": "boolean",
    "taxReceipt": "boolean",
    "joinMailingList": "boolean",
    "socialX": "string",
    "socialXimageSrc": "string",
    "socialFacebook": "string",
    "socialFacebookimageSrc": "string",
    "socialLinkedIn": "string",
    "socialLinkedInimageSrc": "string",
    "donationUuid": "string",
    "pledgeId": "string",
    "depositAddress": "string",
    "success": "boolean",
    "processed": "boolean",
    "transactionHash": "string",
    "convertedAt": "string",
    "netValueAmount": "number",
    "netValueCurrency": "string",
    "grossAmount": "number",
    "payoutAmount": "number",
    "payoutCurrency": "string",
    "externalId": "string",
    "campaignId": "string",
    "valueAtDonationTimeUSD": "number",
    "currency": "string",
    "amount": "number",
    "status": "string",
    "timestampms": "string",
    "eid": "string",
    "paymentMethod": "string",
    "eventData": {}
  }
]
```

### GET /api/getInfoTGB

**Description:** Retrieves donation information for a project from The Giving Block.

**Request Method:** GET

**Query Parameters:**

```
slug: string
```

**Response Body:**

```json
{
  "funded_txo_sum": "number",
  "tx_count": "number",
  "supporters": ["string"],
  "donatedCreatedTime": [
    {
      "valueAtDonationTimeUSD": "number",
      "createdTime": "string"
    }
  ]
}
```

### GET /api/getInfo

**Description:** Retrieves invoice information for a project from BTCPay Server.

**Request Method:** GET

**Query Parameters:**

```
slug: string
```

**Response Body:**

```json
{
  "funded_txo_sum": "number",
  "tx_count": "number",
  "supporters": ["string"],
  "donatedCreatedTime": [
    {
      "amount": "number",
      "createdTime": "number"
    }
  ]
}
```

### GET /api/getCryptoRate

**Description:** Retrieves the USD exchange rate for a given cryptocurrency.

**Request Method:** GET

**Query Parameters:**

```
currency: string
```

**Response Body:**

```json
{
  "rate": "number"
}
```

### GET /api/getBrokersList

**Description:** Retrieves a list of stockbrokers.

**Request Method:** GET

**Response Body:**

```json
{
  "data": [
    {
      "name": "string",
      "value": "string"
    }
  ]
}
```

### GET /api/donor-matched-amounts

**Description:** Retrieves the matched donation amounts for a specific donor, grouped by project.

**Request Method:** GET

**Query Parameters:**

```
donorId: string
```

**Response Body:**

```json
{
  "donorId": "string",
  "donorFieldData": {
    // ... fields from Webflow CMS
  },
  "totalMatchedPerProject": [
    {
      "projectSlug": "string",
      "totalMatchedAmount": "number"
    }
  ]
}
```

### POST /api/createStockDonationPledge

**Description:** Creates a stock donation pledge.

**Request Method:** POST

**Request Body:**

```json
{
  "organizationId": "number",
  "projectSlug": "string",
  "assetSymbol": "string",
  "assetDescription": "string",
  "pledgeAmount": "number",
  "receiptEmail": "string",
  "firstName": "string",
  "lastName": "string",
  "addressLine1": "string",
  "addressLine2": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "zipcode": "string",
  "phoneNumber": "string",
  "joinMailingList": "boolean",
  "socialX": "string",
  "socialFacebook": "string",
  "socialLinkedIn": "string"
}
```

**Response Body:**

```json
{
  "donationUuid": "string"
}
```

### POST /api/createFiatDonationPledge

**Description:** Creates a fiat donation pledge.

**Request Method:** POST

**Request Body:**

```json
{
  "organizationId": "number",
  "projectSlug": "string",
  "pledgeCurrency": "string",
  "pledgeAmount": "number",
  "receiptEmail": "string",
  "firstName": "string",
  "lastName": "string",
  "addressLine1": "string",
  "addressLine2": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "zipcode": "string",
  "taxReceipt": "boolean",
  "isAnonymous": "boolean",
  "joinMailingList": "boolean",
  "socialX": "string",
  "socialFacebook": "string",
  "socialLinkedIn": "string"
}
```

**Response Body:**

```json
{
  "pledgeId": "string"
}
```

### POST /api/createDepositAddress

**Description:** Creates a deposit address for a crypto donation.

**Request Method:** POST

**Request Body:**

```json
{
  "organizationId": "number",
  "projectSlug": "string",
  "pledgeCurrency": "string",
  "pledgeAmount": "number",
  "receiptEmail": "string",
  "firstName": "string",
  "lastName": "string",
  "addressLine1": "string",
  "addressLine2": "string",
  "country": "string",
  "state": "string",
  "city": "string",
  "zipcode": "string",
  "taxReceipt": "boolean",
  "isAnonymous": "boolean",
  "joinMailingList": "boolean",
  "socialX": "string",
  "socialFacebook": "string",
  "socialLinkedIn": "string"
}
```

**Response Body:**

```json
{
  "depositAddress": "string",
  "pledgeId": "string",
  "qrCode": "string"
}
```

### POST /api/clearKV

**Description:** Flushes the entire Vercel KV store and revalidates all project pages. This endpoint is protected and requires a bearer token.

**Request Method:** POST

**Headers:**

```json
{
  "Authorization": "Bearer YOUR_CRON_SECRET"
}
```

**Response Body:**

```json
{
  "message": "string"
}
```

### POST /api/chargeFiatDonationPledge

**Description:** Charges a fiat donation pledge using a card token.

**Request Method:** POST

**Request Body:**

```json
{
  "pledgeId": "string",
  "cardToken": "string"
}
```

**Response Body:**

```json
{
  "success": "boolean"
}
```

### GET /api/getContributors

**Description:** Retrieves a list of all active contributors.

**Request Method:** GET

**Response Body:**

```json
[
  {
    "id": "string",
    "name": "string",
    "url": "string",
    "avatar_url": "string"
  }
]
```

**Example Response:**

```json
[
  {
    "id": "12345",
    "name": "John Doe",
    "url": "https://github.com/johndoe",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345"
  }
]
```

### GET /api/getHomepageStats

**Description:** Retrieves homepage statistics from Blockchair and Litecoinspace, including daily transactions, USD value, network security, and more.

**Request Method:** GET

**Response Body:**

```json
{
  "numberOfDailyTransactions": "number",
  "usdValuePerDay": "number",
  "networkSecurity": "number",
  "dailyAddresses": "number",
  "median_transaction_fee_usd_24h": "number"
}
```

**Example Response:**

```json
{
  "numberOfDailyTransactions": 250000,
  "usdValuePerDay": 150000000,
  "networkSecurity": 1.2,
  "dailyAddresses": 50000,
  "median_transaction_fee_usd_24h": 0.05
}
```
