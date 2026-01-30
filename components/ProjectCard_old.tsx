import Image from 'next/image'
import Link from 'next/link'
import { ProjectItem } from '../utils/types'

export type ProjectCardProps = {
  project: ProjectItem
  openPaymentModal: (project: ProjectItem) => void
  showButton?: boolean // Make showButton optional with a default value
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  // openPaymentModal,
}) => {
  const {
    slug,
    title,
    summary,
    coverImage,
    // gitRepository,
    // twitterHandle,
    // nym,
  } = project

  // const showButton = project.bountyStatus !== 'completed'

  return (
    <figure className="lga:flex lga:flex-row lga:px-[12px] lga:py-[85px] h-full rounded-3xl border border-stone-200 bg-[#EEEEEE] px-10 py-10 dark:border-stone-800 dark:bg-stone-900">
      {/* Image container: column by default, row on small screens */}
      <div className="lga:m-auto lga:pb-0 lga:pl-20 relative w-1/3 pb-8 ">
        {' '}
        {/* Fixed to a square ratio */}
        <Link href={`/missions/${slug}`} passHref>
          <div className="relative mx-auto aspect-square max-h-[300px] min-h-[150px] min-w-[150px] max-w-[300px]">
            <Image
              alt={title}
              src={coverImage}
              className="cursor-pointer rounded-2xl bg-white dark:bg-black "
              priority={true}
              fill
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: '50% 50%',
              }}
            />
          </div>
        </Link>
      </div>
      {/* Text content: column by default, row on small screens */}
      <figcaption className="lga:m-auto lga:pl-20 flex flex-col justify-between  sm:flex-1">
        {' '}
        {/* Flex-1 allows it to fill the remaining space */}
        <div className="lga:p-4 max-w-[620px]">
          <h2
            className="mb-[20px] mt-[10px] font-space-grotesk text-[30px] font-medium leading-[32px] tracking-[-0.5px] text-[#222222]"
            style={{
              wordSpacing: '0px',
              textTransform: 'none',
              textDecoration: 'none',
              transform: 'scaleX(1.2)', // Slight horizontal scaling
              transformOrigin: 'left center',
            }}
          >
            {title}
          </h2>
          <div className="font-space-grotesk text-[17px] font-medium text-[#222222]">
            {summary}
          </div>
        </div>
        <div className="pt-4">
          <div className="pt-2 text-left">
            <Link
              href={`/missions/${slug}`}
              passHref
              className="text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 lga:p-4 font-bold text-[#7e7e7e] underline"
              aria-label="FIND OUT MORE"
            >
              FIND OUT MORE &rarr;
            </Link>
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

export default ProjectCard
