/* eslint-disable */
import { ReactNode } from 'react'
// import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import React from 'react'

interface Props {
  children: ReactNode
  content: Omit<any, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const {
    name,
    nym,
    avatar,
    occupation,
    company,
    email,
    twitter,
    nostr,
    github,
  } = content

  return (
    <>
      <PageSEO title={`${name} | About `} description={`About me - ${name}`} />
      <div className="">
        <div className="space-y-2 pb-0 pt-10 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          {/* <h1 className="text-3xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2"> */}
          <h1 className="pl-4 pt-10 text-5xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
            About {name}
          </h1>
        </div>
        <div className="space-y-2 rounded-xl bg-gradient-to-b from-gray-200 to-white p-4 dark:from-gray-700 dark:to-gray-900 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0 ">
          <div className="flex flex-col items-center space-x-2 pt-10">
            {avatar && ( // Check if avatar is defined
              <Image
                src={avatar}
                alt="avatar"
                width={192}
                height={192}
                className="h-48 w-48 rounded-xl"
              />
            )}
            <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight">
              {nym && (
                <span className="pr-0.5 font-mono text-gray-500 dark:text-gray-400">
                  @
                </span>
              )}
              <span className="">{nym ? nym : name}</span>
            </h3>
            <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
            <div className="text-gray-500 dark:text-gray-400">{company}</div>
            <div className="flex space-x-3 pt-6">
              {email && <SocialIcon kind="mail" href={`mailto:${email}`} />}
              {nostr && <SocialIcon kind="nostr" href={`nostr:${nostr}`} />}
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="twitter" href={twitter} />
            </div>
          </div>
          <div className="dark:prose-dark prose max-w-none pb-8 pt-8 xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
