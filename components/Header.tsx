import siteMetadata from '@/data/siteMetadata'
import Link from './Link'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import MobileNav from './MobileNav'

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState({
    useLitecoin: false,
    theFoundation: false,
  })
  const [isMobile, setIsMobile] = useState(false)

  const useLitecoinRef = useRef<HTMLLIElement | null>(null)
  const theFoundationRef = useRef<HTMLLIElement | null>(null)

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
    }))
  }

  const handleClickOutside = (event) => {
    if (
      useLitecoinRef.current &&
      !useLitecoinRef.current.contains(event.target as Node)
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
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const maxScrollHeight = 225
  const minHeight = 80
  const initialHeight = 92

  const bgOpacity = Math.min(scrollPosition / maxScrollHeight, 1)
  const headerHeight = Math.max(
    initialHeight -
      (scrollPosition / maxScrollHeight) * (initialHeight - minHeight),
    minHeight
  )
  const logoSize = Math.max(
    70.2 - (scrollPosition / maxScrollHeight) * (70.2 - 60),
    60
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

  return (
    <header
      style={{
        backgroundColor: `rgba(34, 34, 34, ${bgOpacity})`,
        height: `${headerHeight}px`,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      }}
      className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between"
    >
      <div className="mx-auto flex h-full w-[1300px] max-w-[90%] items-center justify-between">
        <div className="relative flex h-full items-center pb-1">
          <Link href="/" aria-label={siteMetadata.headerTitle}>
            <div
              className="relative mt-[3px]"
              style={{
                height: `${logoSize}px`,
                width: `${logoSize}px`,
                transform: 'translateY(-0.5px)',
              }}
            >
              <Image
                src="/logo2.svg"
                alt="Black Logo"
                fill
                style={{
                  opacity: 1 - bgOpacity,
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
              <Image
                src="/logo2-white.svg"
                alt="White Logo"
                fill
                style={{
                  opacity: bgOpacity,
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
          </Link>
        </div>
        <nav>
          {isMobile ? (
            <MobileNav />
          ) : (
            <ul className="flex flex-row">
              <li
                className="text-md relative m-[1rem] flex cursor-pointer items-center font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.15px',
                  fontSize: `${scaledFontSize}px`,
                  transform: 'translateY(-1px)',
                  marginRight: `${scaledMargin - 1.9}px`,
                }}
                onClick={() => toggleDropdown('useLitecoin')}
                onKeyDown={(e) =>
                  e.key === 'Enter' && toggleDropdown('useLitecoin')
                }
                tabIndex={0}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="button"
                aria-expanded={dropdownOpen.useLitecoin}
                aria-haspopup="true"
                ref={useLitecoinRef}
              >
                Use Litecoin
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`ml-2 h-4 w-4 ${
                    dropdownOpen.useLitecoin ? 'rotate-180' : ''
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
                <ul
                  className={`absolute left-0 top-full mt-3 w-[113.63px] rounded-3xl ${
                    dropdownOpen.useLitecoin
                      ? 'dropdown-enter-active'
                      : 'dropdown-exit-active'
                  }`}
                  style={{
                    backgroundColor: dropdownBgColor,
                    color: dropdownTextColor,
                    fontSize: `${scaledFontSize}px`,
                    visibility: dropdownOpen.useLitecoin ? 'visible' : 'hidden',
                  }}
                >
                  <li className="ml-2 mt-2 p-2 pl-4 text-left">
                    <Link href="/use-litecoin/buy">Buy</Link>
                  </li>
                  <li className="ml-2 p-2 pl-4 text-left">
                    <Link href="/use-litecoin/spend">Spend</Link>
                  </li>
                  <li className="ml-2 p-2 pl-4 text-left">
                    <Link href="/use-litecoin/store">Store</Link>
                  </li>
                  <li className="mb-2 ml-2 p-2 pl-4 text-left">
                    <Link href="/use-litecoin/business">Business</Link>
                  </li>
                </ul>
              </li>

              <li
                className="text-md m-[.95rem] font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 0.8}px`,
                }}
              >
                <Link href="/learn">Learn</Link>
              </li>
              <li
                className="text-md m-[.95rem] font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 2.5}px`,
                }}
              >
                <Link href="/projects">Projects</Link>
              </li>

              <li
                className="text-md relative m-[1rem] flex cursor-pointer items-center font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.15px',
                  fontSize: `${scaledFontSize}px`,
                  transform: 'translateY(-1px)',
                  marginRight: `${scaledMargin - 1.9}px`,
                }}
                onClick={() => toggleDropdown('theFoundation')}
                onKeyDown={(e) =>
                  e.key === 'Enter' && toggleDropdown('theFoundation')
                }
                tabIndex={0}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="button"
                aria-expanded={dropdownOpen.theFoundation}
                aria-haspopup="true"
                ref={theFoundationRef}
              >
                The Foundation
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`ml-2 h-4 w-4 ${
                    dropdownOpen.theFoundation ? 'rotate-180' : ''
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
                <ul
                  className={`absolute left-0 top-full mt-3 rounded-3xl pr-8 ${
                    dropdownOpen.theFoundation
                      ? 'dropdown-enter-active'
                      : 'dropdown-exit-active'
                  }`}
                  style={{
                    backgroundColor: dropdownBgColor,
                    color: dropdownTextColor,
                    fontSize: `${scaledFontSize}px`,
                    visibility: dropdownOpen.theFoundation
                      ? 'visible'
                      : 'hidden',
                  }}
                >
                  <li className="ml-2 mt-2 p-2 pl-4 text-left">
                    <Link href="/the-foundation/about">About</Link>
                  </li>
                  <li className="ml-2 p-2 pl-4 text-left">
                    <Link href="/the-foundation/resources">Resources</Link>
                  </li>
                  <li className="ml-2 p-2 pl-4 text-left">
                    <Link href="/the-foundation/financials">Financials</Link>
                  </li>
                  <li className="mb-2 ml-2 p-2 pl-4 text-left">
                    <Link href="/the-foundation/contact">Contact</Link>
                  </li>
                </ul>
              </li>
              <li
                className="text-md m-[.95rem] font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 1}px`,
                }}
              >
                <Link href="/news">News</Link>
              </li>
              <li
                className="text-md m-[.95rem] font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 0.5}px`,
                }}
              >
                <Link href="/events">Events</Link>
              </li>
              <li
                className="text-md m-[.95rem] font-[500]"
                style={{
                  color: fontColor,
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 0.8}px`,
                }}
              >
                <Link href="/shop">Shop</Link>
              </li>
              <li
                className="text-md m-[.95rem] font-[600]"
                style={{
                  color: '#FC5C39',
                  letterSpacing: '-0.2px',
                  fontSize: `${scaledFontSize}px`,
                  marginRight: `${scaledMargin + 1}px`,
                }}
              >
                <Link href="/explorer">Explorer</Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
