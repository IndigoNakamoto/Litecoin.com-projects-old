# Next.js v15 Migration Checklist: Donation Flow

This document outlines the components and APIs that need to be migrated from the Next.js v13 project to the new Next.js v15 project.

## Components

### Payment Flow

- [ ] `components/PaymentForm.tsx`

### Payment Options

- [ ] `components/PaymentModalCryptoOption.tsx`
- [ ] `components/PaymentModalFiatOption.tsx`
- [ ] `components/PaymentModalStockOption.tsx`

### Donation Steps

- [ ] `components/PaymentModalPersonalInfo.tsx`
- [ ] `components/PaymentModalCryptoDonate.tsx`
- [ ] `components/PaymentModalFiatDonate.tsx`
- [ ] `components/PaymentModalFiatThankYou.tsx`
- [ ] `components/PaymentModalStockBrokerInfo.tsx`
- [ ] `components/PaymentModalStockDonorSignature.tsx`
- [ ] `components/PaymentModalStockDonorThankYou.tsx`

### Shared Components

- [ ] `components/Button.tsx`
- [ ] `components/GradientButton.tsx`
- [ ] `components/ConversionRateCalculator.tsx`
- [ ] `components/Notification.tsx`

## Hooks & Contexts

- [ ] `contexts/DonationContext.tsx`
- [ ] `next-auth/react` (ensure `useSession` is correctly configured)

## API Endpoints

- [ ] `/api/getWidgetSnippet`
- [ ] `/api/getCryptoRate`
- [ ] `/api/getTickerList`
- [ ] `/api/getTickerCost`
- [ ] `/api/createFiatDonationPledge`
- [ ] `/api/createDepositAddress`
- [ ] `/api/createStockDonationPledge`
- [ ] `/api/chargeFiatDonationPledge`
- [ ] `/api/getBrokersList`
- [ ] `/api/submitStockDonation`
- [ ] `/api/signStockDonation`

## External Dependencies

- [ ] Shift4.js
- [ ] react-signature-canvas
