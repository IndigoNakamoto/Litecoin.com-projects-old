# Hooks & Contexts Migration: File Checklist

This document lists the files that need to be created, migrated, or modified to complete the "Hooks & Contexts" section of the Next.js v15 migration.

## Existing Files to be Migrated or Modified

- **`contexts/DonationContext.tsx`**: The main context for managing donation state. This may need updates to align with App Router patterns.
- **`pages/api/auth/[...nextauth].ts`**: The existing NextAuth.js API route located in the `pages` directory. The logic from this file will be migrated to a new route handler in the `app` directory.
- **`components/DonationForm.tsx`**: A primary component that utilizes the `useSession` hook. This file will need the `"use client";` directive and its usage of `useSession` will need to be verified.
- **`pages/_app.tsx`**: The current root component of the application. The providers used here (`SessionProvider`, `DonationProvider`) will be moved to `app/providers.tsx` in the new architecture.

## New Files to be Created

Below are the files that will need to be created in the new Next.js 15 project.

### `app/api/auth/[...nextauth]/route.ts`

This new file will contain the NextAuth.js configuration as a Route Handler for the App Router. It will export named `GET` and `POST` functions.

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { Session } from 'next-auth'

// Extend the Session type to include the username property
interface CustomSession extends Session {
  user: {
    name: string
    email: string
    image: string
    username: string
    id: string
  }
}

interface CustomProfile {
  data: {
    id: string
    name: string
    image: string
    username: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: '2.0', // opt-in to Twitter OAuth 2.0
      profile(profile) {
        const { id, name, username, profile_image_url: image } = profile.data
        return {
          id,
          name,
          username,
          image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      try {
        if (profile) {
          const customProfile = profile as CustomProfile // Cast to CustomProfile
          token.username = customProfile.data.username
        }
        return token
      } catch (error) {
        console.error('Error in JWT callback:', error)
        throw new Error('Failed to process JWT token.')
      }
    },
    async session({ session, token }) {
      try {
        const customSession = session as CustomSession
        customSession.user.username = token.username as string // Cast to string to satisfy TypeScript
        return customSession
      } catch (error) {
        console.error('Error in session callback:', error)
        throw new Error('Failed to update user session.')
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### `app/providers.tsx`

A dedicated client component (`"use client";`) that will wrap the application with the `SessionProvider` from `next-auth/react` and the `DonationProvider`.

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'
import { DonationProvider } from '@/contexts/DonationContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DonationProvider>{children}</DonationProvider>
    </SessionProvider>
  )
}
```

### `app/layout.tsx`

The root layout for the App Router. This file will import and use the `Providers` component to make session data available globally.

```typescript
import './globals.css'
import Providers from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```
