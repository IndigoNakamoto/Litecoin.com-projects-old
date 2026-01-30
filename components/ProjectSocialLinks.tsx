// components/ProjectSocialLinks.tsx
import SocialIcon from './social-icons'

const formatLinkText = (kind, url) => {
  if (!url) {
    return '' // Return an empty string if the URL is undefined or null
  }

  // Normalize the URL by stripping out protocol and www
  const normalizedUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '')

  switch (kind) {
    case 'website':
      return normalizedUrl // Return the normalized URL directly
    case 'github':
      return 'Github'
    case 'x':
    case 'twitter':
    case 'telegram':
      return `@${normalizedUrl.split('/').pop()}` // Extract the last part of the URL and prepend '@'
    case 'discord':
      return 'Discord' // Just returns "Discord"
    case 'facebook':
      return normalizedUrl.split('/').pop() // Extract the last part of the URL
    case 'reddit':
      return `/r/${normalizedUrl.split('/').pop()}` // Extract the last part of the URL and prepend "/r/"
    default:
      return normalizedUrl
  }
}

const ProjectSocialLinks = ({
  website,
  gitRepository,
  twitterHandle,
  discordLink,
  telegramLink,
  facebookLink,
  redditLink,
  onHowDonationsWorkClick,
}) => {
  const projectLinks = [
    { kind: 'website', url: website },
    { kind: 'github', url: gitRepository },
    { kind: 'twitter', url: twitterHandle },
    { kind: 'discord', url: discordLink },
    { kind: 'telegram', url: telegramLink },
    { kind: 'facebook', url: facebookLink },
    { kind: 'reddit', url: redditLink },
  ]

  return (
    <div className="flex flex-col px-6">
      <h3>Links:</h3>
      {projectLinks.map((link) =>
        link.url ? (
          <a
            key={link.kind}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-2 text-[#222222] no-underline transition-colors duration-300 hover:font-semibold hover:text-gray-900"
          >
            <SocialIcon kind={link.kind} href={link.url} noLink />
            <span className="text-md leading-none text-[#222222] group-hover:text-gray-900">
              {formatLinkText(link.kind, link.url)}
            </span>
          </a>
        ) : null
      )}
      <div
        onClick={onHowDonationsWorkClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onHowDonationsWorkClick()
          }
        }}
        role="button"
        tabIndex={0}
        className="group flex cursor-pointer items-center space-x-2 text-[#222222] no-underline transition-colors duration-300 hover:font-semibold hover:text-gray-900"
      >
        <SocialIcon kind="info" href="#" noLink />
        <span className="text-md leading-none text-[#222222] group-hover:text-gray-900 group-hover:underline">
          How Donations Work
        </span>
      </div>
    </div>
  )
}

export default ProjectSocialLinks
