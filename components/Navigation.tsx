// components/Navigation.tsx
import siteMetadata from '@/data/siteMetadata'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import HorizontalSocialIcons from './HorizontalSocialIcons'
import LitecoinLogo from '../public/static/litecoin_dark_logo.svg'

const Navigation = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState({
    useLitecoin: false,
    theFoundation: false,
    learn: false, // Added state for Learn dropdown
  })
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState({
    useLitecoin: false,
    theFoundation: false,
    learn: false, // Added state for Learn dropdown in mobile
  })
  const [isMobile, setIsMobile] = useState(false)
  const [navShow, setNavShow] = useState(false)

  const useLitecoinRef = useRef<HTMLLIElement | null>(null)
  const theFoundationRef = useRef<HTMLLIElement | null>(null)
  const learnRef = useRef<HTMLLIElement | null>(null) // Ref for Learn dropdown

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992)
    }

    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleDropdown = (menu) => {
    setDropdownOpen((prev) => ({
      useLitecoin: menu === 'useLitecoin' ? !prev.useLitecoin : false,
      theFoundation: menu === 'theFoundation' ? !prev.theFoundation : false,
      learn: menu === 'learn' ? !prev.learn : false, // Toggle Learn dropdown
    }))
  }

  const toggleMobileDropdown = (menu) => {
    setMobileDropdownOpen((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu], // Toggle the specific dropdown
    }))
  }

  const handleClickOutside = (event) => {
    if (
      useLitecoinRef.current &&
      !useLitecoinRef.current.contains(event.target)
    ) {
      setDropdownOpen((prev) => ({
        ...prev,
        useLitecoin: false,
      }))
    }
    if (
      theFoundationRef.current &&
      !theFoundationRef.current.contains(event.target)
    ) {
      setDropdownOpen((prev) => ({
        ...prev,
        theFoundation: false,
      }))
    }

    if (learnRef.current && !learnRef.current.contains(event.target)) {
      setDropdownOpen((prev) => ({
        ...prev,
        learn: false,
      }))
    }
    // Removed extraneous text
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }

  const maxScrollHeight = 225
  const minHeight = 80
  const initialHeight = 80
  const bgOpacity = Math.min(scrollPosition / maxScrollHeight, 1)
  const baseHeaderHeight = isMobile ? initialHeight - 10 : initialHeight
  const minHeaderHeight = isMobile ? minHeight - 10 : minHeight
  // const headerHeight = Math.max(
  //   baseHeaderHeight -
  //     (scrollPosition / maxScrollHeight) * (baseHeaderHeight - minHeaderHeight),
  //   minHeaderHeight
  // )
  const headerHeight = isMobile ? 70 : 82
  const baseLogoSize = isMobile ? 130 : 142 // Adjusted for clarity
  const minLogoSize = isMobile ? 124 : 124
  const logoSize = Math.max(
    baseLogoSize -
      (scrollPosition / maxScrollHeight) * (baseLogoSize - minLogoSize),
    minLogoSize
  )
  const baseFontSize = 16
  const scaledFontSize = Math.max(
    baseFontSize - (scrollPosition / maxScrollHeight) * 2,
    14.25
  )
  const baseMargin = 14
  const scaledMargin = Math.max(
    baseMargin - (scrollPosition / maxScrollHeight) * 4,
    12
  )

  const interpolateColor = (startColor, endColor, factor) => {
    const result = startColor
      .slice(1)
      .match(/.{2}/g)
      .map((hex, i) => {
        return Math.round(
          parseInt(hex, 16) * (1 - factor) +
            parseInt(endColor.slice(1).match(/.{2}/g)[i], 16) * factor
        )
          .toString(16)
          .padStart(2, '0')
      })
    return `#${result.join('')}`
  }

  const fontColor = interpolateColor('#222222', '#C6D3D6', bgOpacity)
  const dropdownBgColor = interpolateColor('#c6d3d6', '#222222', bgOpacity)
  const dropdownTextColor = interpolateColor('#222222', '#C6D3D6', bgOpacity)
  const hamburgerColor = interpolateColor('#222222', '#ffffff', bgOpacity) // Updated
  const mobileMenuTextColor = interpolateColor('#222222', '#C5D3D6', bgOpacity)
  const socialIconTextColor = interpolateColor('#222222', '#ffffff', bgOpacity) // New color for social icons
  const logoColor = bgOpacity < 0.5 ? '#000000' : '#ffffff'

  useEffect(() => {
    // console.log('Scroll Position:', scrollPosition, 'bgOpacity:', bgOpacity)
  }, [scrollPosition, bgOpacity])

  return (
    <>
      <header
        style={{
          backgroundColor: `rgba(34, 34, 34, ${bgOpacity})`,
          height: `${headerHeight}px`,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
        className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between"
      >
        <div className="mx-auto flex h-full w-[1300px] max-w-[90%] items-center justify-between">
          <div className="relative flex h-full items-center pb-1">
            <a
              href="https://litecoin.com"
              aria-label={siteMetadata.headerTitle}
            >
              <div
                className={`relative ${isMobile ? 'ml-2' : 'ml-1'}  mt-[3px]`}
                style={{
                  height: `${logoSize}px`,
                  width: `${logoSize}px`,
                  transform: 'translateY(-0.5px)',
                  color: logoColor, // Set the color for the SVG
                  transition: 'color 0.3s ease-in-out', // Smooth transition
                }}
              >
                <LitecoinLogo
                  width={logoSize}
                  height={logoSize}
                  // If needed, pass additional props
                />
              </div>
            </a>
          </div>
          <nav>
            {isMobile ? (
              // Hamburger menu with updated color interpolation
              <div
                className={`nav-toggle mt-[-10px] ${navShow ? 'open' : ''}`}
                onClick={onToggleNav}
                onKeyPress={onToggleNav}
                aria-label="menu"
                role="button"
                tabIndex={0}
              >
                <span
                  className="bar"
                  style={{ backgroundColor: hamburgerColor }}
                ></span>
                <span
                  className="bar"
                  style={{ backgroundColor: hamburgerColor }}
                ></span>
                <span
                  className="bar"
                  style={{ backgroundColor: hamburgerColor }}
                ></span>
              </div>
            ) : (
              <ul className="flex flex-row">
                {/* Use Litecoin Dropdown */}
                <li
                  className="relative !-mr-[0.2rem] !-mt-[.17rem] flex items-center !font-[500]"
                  ref={useLitecoinRef}
                >
                  <button
                    className="flex items-center tracking-[-0.01em]"
                    onClick={() => toggleDropdown('useLitecoin')}
                    aria-expanded={dropdownOpen.useLitecoin}
                    aria-haspopup="true"
                    style={{ color: fontColor, fontSize: '1rem' }}
                  >
                    Use Litecoin
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`ml-2 h-4 w-4${
                        dropdownOpen.useLitecoin ? ' rotate-180' : ''
                      }`}
                      style={{
                        transformOrigin: 'center',
                        transform: `translateX(-2px) ${
                          dropdownOpen.useLitecoin ? 'rotate(180deg)' : ''
                        }`,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3.25}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul
                    className={`w-[var(--dropdown-width, 113.63px)] absolute left-0 top-full mt-3 rounded-2xl ${
                      dropdownOpen.useLitecoin
                        ? 'dropdown-enter-active'
                        : 'dropdown-exit-active'
                    }`}
                    style={
                      {
                        backgroundColor: dropdownBgColor,
                        color: dropdownTextColor,
                        fontSize: `${scaledFontSize}px`,
                        visibility: dropdownOpen.useLitecoin
                          ? 'visible'
                          : 'hidden',
                        '--dropdown-width': '113.63px',
                      } as React.CSSProperties & { [key: string]: string }
                    }
                  >
                    <li className="ml-2 mt-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/buy">Buy</a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/spend">Spend</a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/store">Store</a>
                    </li>
                    <li className="mb-2 ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/for-business">Business</a>
                    </li>
                  </ul>
                </li>
                {/* Learn Dropdown */}
                <li
                  className="relative !-mr-[.36rem] !-mt-[.17rem] flex items-center !font-[500]"
                  ref={learnRef}
                >
                  <button
                    className="flex items-center tracking-[-0.01em]"
                    onClick={() => toggleDropdown('learn')}
                    aria-expanded={dropdownOpen.learn}
                    aria-haspopup="true"
                    ref={learnRef as React.RefObject<HTMLButtonElement>} // Updated
                    style={{ color: fontColor }}
                  >
                    Learn
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`ml-2 h-4 w-4${
                        dropdownOpen.learn ? ' rotate-180' : ''
                      }`}
                      style={{
                        transformOrigin: 'center',
                        transform: `translateX(-2px) ${
                          dropdownOpen.learn ? 'rotate(180deg)' : ''
                        }`,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3.25}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul
                    className={`w-[var(--dropdown-width, 180px)] absolute left-0 top-full mt-3 rounded-2xl ${
                      dropdownOpen.learn
                        ? 'dropdown-enter-active'
                        : 'dropdown-exit-active'
                    }`}
                    style={
                      {
                        backgroundColor: dropdownBgColor,
                        color: dropdownTextColor,
                        fontSize: `${scaledFontSize}px`,
                        visibility: dropdownOpen.learn ? 'visible' : 'hidden',
                        '--dropdown-width': '165px',
                      } as React.CSSProperties & { [key: string]: string }
                    }
                  >
                    <li className="ml-2 mt-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/learningcenter">
                        Learning Center
                      </a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/resources">Resources</a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/chat">Chat</a>
                    </li>
                  </ul>
                </li>
                {/* End of Learn Dropdown */}

                {/* Projects Menu Item */}
                <li
                  className="text-md mb-[.95rem] ml-[1rem] mt-[.85rem] font-[500]"
                  style={{
                    color: fontColor,
                    letterSpacing: '-0.2px',
                    fontSize: `${scaledFontSize}px`,
                    marginRight: `${scaledMargin + 1}px`,
                  }}
                >
                  <Link href="/projects">Projects</Link>
                </li>

                {/* The Foundation Dropdown */}
                <li
                  className="relative !-mt-[0.1rem] !ml-[-.1rem] flex items-center !font-[500]"
                  ref={theFoundationRef}
                >
                  <button
                    className="flex items-center tracking-[-0.01em]"
                    onClick={() => toggleDropdown('theFoundation')}
                    aria-expanded={dropdownOpen.theFoundation}
                    aria-haspopup="true"
                    style={{ color: fontColor }}
                  >
                    The Foundation
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`ml-2 h-4 w-4${
                        dropdownOpen.theFoundation ? ' rotate-180' : ''
                      }`}
                      style={{
                        transformOrigin: 'center',
                        transform: `translateX(-2px) ${
                          dropdownOpen.theFoundation ? 'rotate(180deg)' : ''
                        }`,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3.25}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul
                    className={`w-[var(--dropdown-width, 180px)] absolute left-0 top-full mt-3 rounded-2xl ${
                      dropdownOpen.theFoundation
                        ? 'dropdown-enter-active'
                        : 'dropdown-exit-active'
                    }`}
                    style={
                      {
                        backgroundColor: dropdownBgColor,
                        color: dropdownTextColor,
                        fontSize: `${scaledFontSize}px`,
                        visibility: dropdownOpen.theFoundation
                          ? 'visible'
                          : 'hidden',
                        '--dropdown-width': '140px',
                      } as React.CSSProperties & { [key: string]: string }
                    }
                  >
                    <li className="ml-2 mt-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/litecoin-foundation">
                        About
                      </a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/donate">Donate</a>
                    </li>
                    <li className="ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/litecoin-foundation#contact">
                        Contact
                      </a>
                    </li>
                    <li className="mb-2 ml-2 p-2 pl-4 text-left">
                      <a href="https://litecoin.com/financials">Financials</a>
                    </li>
                  </ul>
                </li>
                {/* End of The Foundation Dropdown */}

                <li
                  className="text-md mb-[.95rem] ml-[.6rem] mt-[.85rem] font-[500]"
                  style={{
                    color: fontColor,
                    letterSpacing: '-0.2px',
                    fontSize: `${scaledFontSize}px`,
                    marginRight: `${scaledMargin + 1}px`,
                  }}
                >
                  <a href="https://litecoin.com/news">News</a>
                </li>
                <li
                  className="text-md mb-[.95rem] ml-[.8rem] mt-[.85rem] font-[500]"
                  style={{
                    color: fontColor,
                    letterSpacing: '-0.2px',
                    fontSize: `${scaledFontSize}px`,
                    marginRight: `${scaledMargin + 0.5}px`,
                  }}
                >
                  <a href="https://litecoin.com/events">Events</a>
                </li>
                <li
                  className="text-md mb-[.95rem] ml-[.8rem] mt-[.85rem] font-[500]"
                  style={{
                    color: fontColor,
                    letterSpacing: '-0.2px',
                    fontSize: `${scaledFontSize}px`,
                    marginRight: `${scaledMargin + 0.8}px`,
                  }}
                >
                  <a href="https://shop.litecoin.com">Shop</a>
                </li>
                <li
                  className="text-md mb-[.95rem] ml-[.8rem] mt-[.85rem] font-[500]"
                  style={{
                    color: fontColor,
                    letterSpacing: '-0.2px',
                    fontSize: `${scaledFontSize}px`,
                    marginRight: `${scaledMargin + 1}px`,
                  }}
                >
                  <a
                    href="https://litecoinspace.org/"
                    target="_blank" // Opens the link in a new tab
                    rel="noopener noreferrer" // Security best practices
                  >
                    Explorer
                  </a>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Nav with dynamic background color */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-10 min-w-full transform pt-20 duration-300 ease-in md:clear-left ${
          navShow ? 'translate-x-0' : 'translate-x-[105%]'
        }`}
        style={{
          backgroundColor: interpolateColor('#C5D3D6', '#222222', bgOpacity),
        }}
      >
        {/* LINKS */}
        <div className="flex flex-col gap-x-6">
          <nav className="mt-10 h-full">
            {[
              { title: 'Use Litecoin', dropdown: true },
              { title: 'Learn', dropdown: true },
              {
                title: 'Projects',
                link: 'https://litecoin.com/projects',
              },
              { title: 'The Foundation', dropdown: true },
              { title: 'News', link: 'https://litecoin.com/news' },
              { title: 'Events', link: 'https://litecoin.com/events' },
              { title: 'Shop', link: 'https://shop.litecoin.com' },
              { title: 'Explorer', link: 'https://litecoinspace.org/' },
            ].map((item) => {
              const itemKey = item.title.replace(' ', '').toLowerCase()
              return (
                <div key={item.title} className="px-10 py-2 short:py-0.5">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => toggleMobileDropdown(itemKey)}
                        className="m-0 flex w-full items-center justify-between pl-0 pr-0 text-left font-space-grotesk text-[2.1rem] font-semibold"
                        style={{ color: mobileMenuTextColor }}
                        aria-expanded={mobileDropdownOpen[itemKey]}
                        aria-haspopup="true"
                      >
                        {item.title}
                        {/* Mobile SVG chevron will now flip up and down */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{
                            transform: `translateY(-0.5px) ${
                              mobileDropdownOpen[itemKey]
                                ? 'rotate(180deg)'
                                : ''
                            }`,
                          }}
                        >
                          <path
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                            strokeWidth={2.5}
                            d="M19 9l-6.75 6.75-6.75-6.75"
                          />
                        </svg>
                      </button>
                      {mobileDropdownOpen[itemKey] ? (
                        <ul
                          className={`pl-6 font-space-grotesk text-[2.1rem] font-semibold`}
                          style={{ color: mobileMenuTextColor }}
                        >
                          {/* Menu items based on `item.title` */}
                          {item.title === 'Use Litecoin' ? (
                            <>
                              <li className="py-1">
                                <a href="https://litecoin.com/buy">Buy</a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/spend">Spend</a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/store">Store</a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/for-business">
                                  Business
                                </a>
                              </li>
                            </>
                          ) : item.title === 'The Foundation' ? (
                            <>
                              <li className="py-1">
                                <a href="https://litecoin.com/litecoin-foundation">
                                  About
                                </a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/litecoin-foundation#contact">
                                  Contact
                                </a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/donate">Donate</a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/financials">
                                  Financials
                                </a>
                              </li>
                            </>
                          ) : item.title === 'Learn' ? (
                            <>
                              <li className="py-1">
                                <a href="https://litecoin.com/what-is-litecoin">
                                  What Is Litecoin
                                </a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/resources">
                                  Resources
                                </a>
                              </li>
                              <li className="py-1">
                                <a href="https://litecoin.com/chat">Chat</a>
                              </li>
                            </>
                          ) : null}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <a
                      href={item.link}
                      className="flex w-full items-center justify-between text-left font-space-grotesk text-[2.1rem] font-semibold"
                      style={{ color: mobileMenuTextColor }}
                    >
                      {item.title}
                    </a>
                  )}
                </div>
              )
            })}
          </nav>

          <HorizontalSocialIcons mobileMenuTextColor={socialIconTextColor} />
        </div>
      </div>
      <style jsx>{`
        :root {
          /* CSS Variables for easy adjustments */
          --menu-item-margin: ${scaledMargin -
          1.9}px; /* Adjust spacing between menu items */
          --dropdown-width: 180px; /* Default dropdown width, can be overridden inline */
        }

        .nav-toggle {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 28px;
          width: 45px;
        }

        .nav-toggle .bar {
          height: 4px;
          width: 100%;
          background-color: ${hamburgerColor};
          transition: transform 300ms ease-in-out, width 300ms ease-in-out;
        }

        .nav-toggle:not(.open) .bar {
          /* Remove transition when closing */
          transition: none;
        }

        .nav-toggle:hover {
          cursor: pointer;
        }

        /* Styles when 'open' class is present (X shape) */
        .nav-toggle.open .bar:nth-of-type(1) {
          transform: rotate(45deg) translateY(-4px); /* Shift up */
          transform-origin: top left;
          width: 44px;
        }

        .nav-toggle.open .bar:nth-of-type(2) {
          transform-origin: center;
          width: 0;
        }

        .nav-toggle.open .bar:nth-of-type(3) {
          transform: rotate(-45deg) translateY(4px); /* Shift down */
          transform-origin: bottom left;
          width: 44px;
        }

        /* Dropdown fade-in and fade-out animations */
        .dropdown-enter-active,
        .dropdown-exit-active {
          transition: opacity 200ms ease-in-out, visibility 200ms ease-in-out;
        }

        .dropdown-enter-active {
          opacity: 1;
          visibility: visible;
        }

        .dropdown-exit-active {
          opacity: 0;
          visibility: hidden;
        }

        /* Ensure instant flip for SVG icons */
        svg {
          transition: transform 0ms ease-in-out; /* Smooth transition for rotation */
        }

        /* Additional styles for alignment adjustments */
        ul > li > ul {
          /* Adjust the top position if dropdown is misaligned */
          top: 100%; /* Ensures dropdown starts right below the parent */
          left: 0;
        }

        /* Optional: Adjust dropdown position horizontally */
        ul > li > ul {
          /* Uncomment and adjust the value if needed */
          /* left: 10px; */
        }

        /* Optional: Add spacing between menu items */
        ul.flex > li {
          margin-right: var(--menu-item-margin);
        }

        /* Optional: Adjust dropdown width via CSS variables */
        ul > li > ul {
          width: var(--dropdown-width);
        }

        /* Responsive adjustments for dropdowns */
        @media (max-width: 991px) {
          /* Adjustments specific to mobile view if needed */
        }
      `}</style>
    </>
  )
}

export default Navigation
