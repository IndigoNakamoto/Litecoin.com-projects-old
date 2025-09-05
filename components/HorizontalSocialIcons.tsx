import React from 'react'
import { FaTwitter, FaRedditAlien, FaFacebookF, FaGithub } from 'react-icons/fa'

interface HorizontalSocialIconsProps {
  topOffset?: string
  mobileMenuTextColor?: string // Added mobileMenuTextColor prop
}

const HorizontalSocialIcons: React.FC<HorizontalSocialIconsProps> = ({
  topOffset,
  mobileMenuTextColor = 'white', // Default color set to 'white'
}) => {
  // Common style for all icons
  const iconStyle = {
    color: mobileMenuTextColor,
  }

  return (
    <div className={`flex flex-row space-x-10 pl-10 pt-10${topOffset || ''}`}>
      <a
        href="https://x.com/ltcfoundation"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaTwitter
          className="h-[28px] w-[28px] transition-transform duration-200 ease-in-out hover:translate-y-[-4px]"
          style={iconStyle}
        />
      </a>
      <a
        href="https://reddit.com/r/litecoin"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaRedditAlien
          className="h-[28px] w-[28px] transition-transform duration-200 ease-in-out hover:translate-y-[-4px]"
          style={iconStyle}
        />
      </a>
      <a
        href="https://facebook.com/LitecoinFoundation/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaFacebookF
          className="h-[28px] w-[28px] transition-transform duration-200 ease-in-out hover:translate-y-[-4px]"
          style={iconStyle}
        />
      </a>
      <a
        href="https://github.com/litecoin"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub
          className="h-[28px] w-[28px] transition-transform duration-200 ease-in-out hover:translate-y-[-4px]"
          style={iconStyle}
        />
      </a>
    </div>
  )
}

export default HorizontalSocialIcons
