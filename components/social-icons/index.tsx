// components/social-icons/index.tsx
import { FaLink, FaEnvelope, FaGlobe, FaInfoCircle } from 'react-icons/fa' // FaEnvelope for mail icon
import {
  SiGithub,
  SiFacebook,
  SiYoutube,
  SiLinkedin,
  SiX,
  SiReddit,
  SiTelegram,
  SiDiscord,
} from 'react-icons/si'
import React from 'react'

// Icons taken from: https://react-icons.github.io/react-icons/

const components = {
  twitter: SiX, // Assuming SiX represents Twitter; replace if different
  x: SiX,
  github: SiGithub,
  reddit: SiReddit,
  email: FaEnvelope,
  mail: FaEnvelope,
  linkedin: SiLinkedin,
  discord: SiDiscord,
  facebook: SiFacebook,
  youtube: SiYoutube,
  nostr: null, // Nostr icon might not be available, handle separately if needed
  telegram: SiTelegram,
  website: FaGlobe,
  link: FaLink,
  info: FaInfoCircle,
}

interface SocialIconProps {
  kind: string
  href: string
  size?: number
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  noLink?: boolean // New prop to control link rendering
}

const SocialIcon: React.FC<SocialIconProps> = ({
  kind,
  href,
  onClick,
  noLink = false,
}) => {
  if (
    !href ||
    (kind === 'mail' &&
      !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href))
  )
    return null

  const IconComponent = components[kind]

  // Handle cases where the icon might not be available
  if (!IconComponent) return null

  const padding = 10

  const iconElement = (
    <div
      className={`flex items-center justify-center h-${padding} w-${padding} rounded-lg transition-colors group-hover:text-gray-900`}
    >
      <IconComponent
        className={`h-5 w-5 fill-current text-gray-700 transition-colors group-hover:text-gray-900`}
      />
    </div>
  )

  if (noLink) {
    return (
      <span className="inline-block text-gray-600 transition-colors duration-300 hover:text-gray-900">
        {iconElement}
      </span>
    )
  }

  return (
    <a
      className={`inline-block text-gray-600 transition-colors duration-300 hover:text-gray-900`}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      onClick={onClick}
    >
      <span className="sr-only">{kind}</span>
      {iconElement}
    </a>
  )
}

export default SocialIcon
