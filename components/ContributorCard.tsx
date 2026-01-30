// components/ContributorCard.tsx

import React, { useState } from 'react'
import Image from 'next/image'
import ReactModal from 'react-modal'
import SocialIcon from './social-icons' // Ensure the correct path

interface Contributor {
  id: string
  fieldData: {
    name: string
    slug?: string
    'twitter-link'?: string
    'github-link'?: string
    linkedin?: string
    website?: string
    'profile-picture'?: {
      url: string
      alt?: string | null
    }
    [key: string]: any
  }
}

export interface ContributorCardProps {
  contributor: Contributor
}

const ContributorCard: React.FC<ContributorCardProps> = ({ contributor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    const initials = names.map((n) => n.charAt(0).toUpperCase())
    return initials.slice(0, 2).join('')
  }

  const formatLinkText = (kind: string, url: string): string => {
    if (!url) {
      return ''
    }

    const normalizedUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '')

    switch (kind) {
      case 'website':
        return normalizedUrl
      case 'github':
        return 'GitHub'
      case 'twitter':
        return `@${normalizedUrl.split('/').pop()}`
      case 'discord':
        return 'Discord'
      case 'telegram':
        return `@${normalizedUrl.split('/').pop()}`
      case 'facebook':
        return normalizedUrl.split('/').pop() || ''
      case 'reddit': {
        const redditUsername = normalizedUrl.split('/').filter(Boolean).pop()
        return redditUsername ? `u/${redditUsername}` : ''
      }
      case 'linkedin':
        return `LinkedIn`
      case 'youtube':
        return `YouTube`
      default:
        return normalizedUrl
    }
  }

  const socialLinks = [
    { kind: 'github', url: contributor.fieldData['github-link'] },
    { kind: 'twitter', url: contributor.fieldData['twitter-link'] },
    { kind: 'discord', url: contributor.fieldData['discord-link'] },
    { kind: 'telegram', url: contributor.fieldData['telegram-link'] },
    { kind: 'facebook', url: contributor.fieldData['facebook-link'] },
    { kind: 'youtube', url: contributor.fieldData['youtube-link'] },
    { kind: 'linkedin', url: contributor.fieldData.linkedin },
    { kind: 'website', url: contributor.fieldData.website },
    { kind: 'reddit', url: contributor.fieldData['reddit'] },
    { kind: 'email', url: contributor.fieldData.email },
    // Add more social links as needed
  ]

  return (
    <>
      <button
        className="contributor group w-full transform cursor-pointer border-none !bg-[white] !p-3 text-center transition-transform duration-300 focus:outline-none group-hover:scale-105"
        onClick={handleCardClick}
        tabIndex={0}
      >
        {/* Use aspect-square to maintain square aspect ratio */}
        <div className="relative flex aspect-square items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {contributor.fieldData['profile-picture'] ? (
            <Image
              src={contributor.fieldData['profile-picture'].url}
              alt={
                contributor.fieldData['profile-picture'].alt ||
                contributor.fieldData.name
              }
              className="h-full w-full transform rounded-full object-cover p-1 transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: 'cover',
              }}
            />
          ) : (
            <span className="transform text-2xl font-semibold text-white transition-transform duration-300 group-hover:scale-105">
              {getInitials(contributor.fieldData.name)}
            </span>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-center text-base text-white">
              {contributor.fieldData.name}
            </span>
          </div>
        </div>
      </button>

      {/* Modal */}
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="h-auto max-w-md overflow-y-auto rounded bg-white p-8 shadow-xl outline-none sm:m-8 sm:w-full"
        overlayClassName="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80"
        ariaHideApp={false}
      >
        {/* Close button */}
        <div className="relative mb-4 flex justify-end">
          <button
            onClick={handleModalClose}
            className="text-2xl font-bold text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>
        {/* Modal content */}
        <div className="flex flex-col items-center">
          {contributor.fieldData['profile-picture'] ? (
            <Image
              src={contributor.fieldData['profile-picture'].url}
              alt={
                contributor.fieldData['profile-picture'].alt ||
                contributor.fieldData.name
              }
              className="mb-4 h-32 w-32 rounded-full object-cover"
              width={128}
              height={128}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          ) : (
            <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-blue-500">
              <span className="text-4xl font-semibold text-white">
                {getInitials(contributor.fieldData.name)}
              </span>
            </div>
          )}
          <h2 className="mb-2 text-2xl font-bold">
            {contributor.fieldData.name}
          </h2>
          {/* Display other info as needed */}
          {/* Social Links */}
          <div className="mt-4 w-full px-6">
            <p className="mb-2 text-lg font-semibold text-gray-800">Links:</p>
            <div className="flex flex-col space-y-2">
              {socialLinks.map((link) =>
                link.url ? (
                  <a
                    key={link.kind}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 text-gray-700 no-underline hover:font-semibold hover:text-gray-900"
                  >
                    <SocialIcon kind={link.kind} href={link.url} noLink />
                    <span className="text-md leading-none group-hover:text-gray-900">
                      {formatLinkText(link.kind, link.url)}
                    </span>
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </ReactModal>
    </>
  )
}

export default ContributorCard
