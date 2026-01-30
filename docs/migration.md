# Next.js v15 Migration Checklist: Donation Flow

This document outlines the components and APIs that need to be migrated from the Next.js v13 project to the new Next.js v15 project.

## Components

### Payment Flow

- [x] `components/PaymentForm.tsx`

### Payment Options

- [x] `components/PaymentModalCryptoOption.tsx`
- [x] `components/PaymentModalFiatOption.tsx`
- [x] `components/PaymentModalStockOption.tsx`

### Donation Steps

- [x] `components/PaymentModalPersonalInfo.tsx`
- [x] `components/PaymentModalCryptoDonate.tsx`
- [x] `components/PaymentModalFiatDonate.tsx`
- [x] `components/PaymentModalFiatThankYou.tsx`
- [x] `components/PaymentModalStockBrokerInfo.tsx`
- [x] `components/PaymentModalStockDonorSignature.tsx`
- [x] `components/PaymentModalStockDonorThankYou.tsx`

### Shared Components

- [x] `components/Button.tsx`
- [x] `components/GradientButton.tsx`
- [x] `components/ConversionRateCalculator.tsx`
- [x] `components/Notification.tsx`

## Hooks & Contexts

- [x] `contexts/DonationContext.tsx`
- [x] `next-auth/react` (ensure `useSession` is correctly configured)
  - [x] **1. Migrate NextAuth.js API Route**:
    - [x] Move the NextAuth configuration from `pages/api/auth/[...nextauth].ts` to `app/api/auth/[...nextauth]/route.ts`.
    - [x] Update the `route.ts` file to export named `GET` and `POST` handlers, as required by the App Router.
    - [ ] Verify the `jwt` and `session` callbacks are correctly implemented to pass the `username` from the Twitter profile to the client-side session object.
  - [ ] **2. Configure Session Provider for App Router**:
    - [ ] Ensure the `<SessionProvider>` is implemented within a dedicated Client Component (e.g., `app/providers.tsx`).
    - [ ] Confirm this `Providers` component wraps the `{children}` in the root layout (`app/layout.tsx`) to make the session available globally.
  - [ ] **3. Update Component Usage**:
    - [ ] Add the `"use client";` directive to the top of all components that use the `useSession` hook, such as `DonationForm.tsx`.
    - [ ] Check that components are correctly accessing the session data (e.g., `session.user.username`).
    - [ ] Replace any usage of `signIn` and `signOut` from `next-auth/react` and ensure they function as expected.

## API Endpoints

- [x] `/api/getWidgetSnippet`
- [x] `/api/getCryptoRate`
- [x] `/api/getTickerList`
- [x] `/api/getTickerCost`
- [x] `/api/createFiatDonationPledge`
- [x] `/api/createDepositAddress`
- [x] `/api/createStockDonationPledge`
- [ ] `/api/chargeFiatDonationPledge`
- [x] `/api/getBrokersList`
- [ ] `/api/submitStockDonation`
- [ ] `/api/signStockDonation`

## External Dependencies

- [ ] Shift4.js
- [ ] react-signature-canvas
