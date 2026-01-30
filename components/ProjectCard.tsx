import Image from 'next/image'
import React, { useState } from 'react'
import { customImageLoader } from '../utils/customImageLoader'
import Link from 'next/link'
import { ProjectItem } from '../utils/types'

export type ProjectCardProps = {
  project: ProjectItem
  openPaymentModal: (project: ProjectItem) => void
  bgColor: string // Accept bgColor as a prop
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, bgColor }) => {
  const { slug, title, summary, coverImage } = project

  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true) // Set loading state to true on click
  }

  return (
    <Link
      href={`/projects/${slug}`}
      className={`flex flex-col justify-between rounded-md p-4 shadow sm:p-6 md:p-6 ${bgColor} w-full cursor-pointer space-y-4 overflow-y-auto sm:space-x-0 sm:space-y-0`}
      onClick={handleClick}
      aria-label={`View project: ${title}`}
    >
      {/* Updated Image Container */}
      <div className="relative aspect-square w-full">
        <Image
          // Use the custom loader
          loader={customImageLoader}
          // Ensure this is a valid URL from Webflow
          src={coverImage}
          alt={title}
          // Replaces layout="fill"
          fill
          className="rounded-sm"
          priority={true}
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
          style={{
            objectFit: 'cover',
            objectPosition: '50% 50%',
          }}
        />
      </div>
      <figcaption className="flex flex-1 flex-col justify-between pt-0 sm:pt-8">
        <div className="h-auto">
          <h2 className="font-space-grotesk text-2xl font-semibold leading-tight tracking-tight text-[#000000] sm:text-3xl">
            {title}
          </h2>
          <p
            className="pt-4 !text-[16px] text-[#000000] sm:text-base"
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4, // Limits to 4 lines
            }}
          >
            {summary}
          </p>
        </div>
        <div className="mt-4 text-left">
          {isLoading ? (
            <span className="loading-text-gradient text-[14px]">
              LOADING &rarr;
            </span>
          ) : (
            <span className="text-secondary-500 hover:text-secondary-600 text-[14px]">
              READ MORE &rarr;
            </span>
          )}
        </div>
      </figcaption>

      {/* CSS for Gradient Effect */}
      <style jsx>{`
        .loading-text-gradient {
          background: linear-gradient(
            70deg,
            #333333,
            #333333,
            #7e7e7e,
            #7e7e7e,
            #333333
          );
          background-size: 200%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradient-move 3s infinite;
        }

        @keyframes gradient-move {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </Link>
  )
}

export default React.memo(ProjectCard)
