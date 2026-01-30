import { useState } from 'react'
import Link from './Link'
import SocialIcon from '@/components/social-icons-mobile'
import siteMetadata from '@/data/siteMetadata'

// The LINKS, SOCIAL ICONS, and FOOTER overlap on devices with height 667px, but looks fine on devices with height 896px. height 740px it's starting to look cramped.

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        // Prevent scrolling
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }

  return (
    <div className="z-100 ">
      <div
        className="flex items-center transition-colors duration-300"
        role="button"
        tabIndex={0}
        onClick={onToggleNav}
        onKeyPress={onToggleNav}
        aria-label="Toggle Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-12 text-white "
        >
          <path d="M3 4.5h14v1H3zM3 9.5h14v1H3zM3 14.5h14v1H3z" />
        </svg>
      </div>

      <div
        className={`fixed bottom-0 right-0 top-0 z-10 min-w-full transform bg-[#C5D3D6]  duration-300 ease-in  md:clear-left  ${
          navShow ? 'translate-x-0' : 'translate-x-[105%]'
        }`}
      >
        {/* x button */}
        <div className="flex justify-end">
          <button
            className="mr-8 mt-4 h-8 w-8 rounded"
            aria-label="Toggle Menu"
            onClick={onToggleNav}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-8 w-8 text-gray-100"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div></div>
        </div>
        {/* LINKS */}
        <div className="flex flex-col gap-x-6 ">
          <nav className="mt-8 h-full">
            {/* Use Litecoin */}
            <div key={'Use Litecoin'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Use Litecoin'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300  "
                onClick={onToggleNav}
              >
                {'Use Litecoin'}
              </Link>
            </div>

            {/* Learn */}
            <div key={'Learn'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Learn'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'Learn'}
              </Link>
            </div>

            {/* Projects */}
            <div key={'Projects'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Projects'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'Projects'}
              </Link>
            </div>
            {/* The Foundation */}
            <div key={'The Foundation'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'The Foundation'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'The Foundation'}
              </Link>
            </div>
            {/* News */}
            <div key={'News'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'News'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'News'}
              </Link>
            </div>
            {/* Events */}
            <div key={'Events'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Events'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'Events'}
              </Link>
            </div>
            {/* Shop */}
            <div key={'Shop'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Shop'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'Shop'}
              </Link>
            </div>
            {/* Explorer */}
            <div key={'Explorer'} className="px-12 py-2 short:py-0.5">
              <Link
                href={'Explorer'}
                className="text-3xl font-semibold tracking-widest text-[#222222] hover:text-blue-300 "
                onClick={onToggleNav}
              >
                {'Explorer'}
              </Link>
            </div>
          </nav>
          <div className="">
            <div className="absolute bottom-12 mt-12 flex w-full flex-col ">
              {/* SOCIAL ICONS */}

              <div className="flex space-x-4 px-12 text-[#222222]">
                <SocialIcon
                  kind="mail"
                  href={`mailto:${siteMetadata.email}`}
                  // size={6}
                />
                <SocialIcon kind="github" href={siteMetadata.github} />
                <SocialIcon kind="facebook" href={siteMetadata.facebook} />
                <SocialIcon kind="youtube" href={siteMetadata.youtube} />
                <SocialIcon kind="linkedin" href={siteMetadata.linkedin} />
                <SocialIcon kind="reddit" href={siteMetadata.reddit} />
                <SocialIcon kind="x" href={siteMetadata.twitter} />
              </div>

              {/* FOOTER */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNav
