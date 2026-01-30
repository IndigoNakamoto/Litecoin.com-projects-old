// import Link from './Link'
// import siteMetadata from '@/data/siteMetadata'
// import SocialIcon from '@/components/social-icons'
import Image from 'next/image'

export default function Footer() {
  return (
    // TODO: Footer
    <footer className="relative h-[600px] max-w-full bg-[#222222]">
      {/* Full-width section with bg-[#222222] */}
      <div className="mx-auto w-[1300px] max-w-[90%] pb-60 pt-20">
        {/* background */}

        {/* Overlay on top */}
        <div className="">
          <div className="flex flex-col space-x-0 text-[#c6d3d6] lg:flex-row">
            <Image
              src="/static/images/design/Group 5.svg"
              alt="Black Logo"
              // Fixed width
              width={260}
              // This will allow the height to auto-adjust based on aspect ratio
              height={0}
              className="min-h-max max-w-min pr-16"
              style={{
                // Maintain aspect ratio
                height: 'auto',

                opacity: 1,
                maxWidth: '100%',
              }}
            />
            {/*
             */}
            <div className="flex w-full flex-row justify-between pt-10 xl:pl-36 xl:pt-0">
              <div className="w-full">
                <h1 className="font-space-grotesk text-[18px] font-bold">
                  LITECOIN SOCIALS
                </h1>
                <p className="pt-4 text-sm">
                  <a
                    href="https://x.com/litecoin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    twitter
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://t.me/Litecoin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    telegram
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://www.reddit.com/r/litecoin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    reddit
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://github.com/litecoin-project"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github
                  </a>
                </p>
              </div>

              <div className="w-full">
                <h1 className="font-space-grotesk text-[18px] font-bold">
                  FOUNDATION SOCIAL
                </h1>
                <p className="pt-4 text-sm">
                  <a
                    href="https://x.com/LTCFoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    twitter
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://reddit.com/r/litecoin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    reddit
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://www.facebook.com/LitecoinFoundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    facebook
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="https://github.com/litecoin-foundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github
                  </a>
                </p>
              </div>

              <div className="w-full">
                <h1 className="font-space-grotesk text-[18px] font-bold">
                  CONTACT
                </h1>
                <p className="pt-4 text-sm">
                  <a
                    href="mailto:contact@litecoin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    contact@litecoin.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-auto flex h-[52px] items-center bg-[black] bg-cover bg-center">
        {/* TODO: Link privacy and terms */}
        <div
          className="mx-auto flex w-[1300px] max-w-[90%] items-center bg-black text-left text-[14px] text-[#767e7f]"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
          }}
        >
          Copyright © 2024 Litecoin Foundation. |
          <a
            href="https://litecoin.com/privacy"
            className="pl-1 underline hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <br />
        </div>
      </div>
    </footer>
  )
}
