import ReactModal from 'react-modal'
import Image from 'next/image'
import { customImageLoader } from '../utils/customImageLoader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { ProjectItem } from '../utils/types'
import { useSession } from 'next-auth/react' // Import useSession
import { useRouter } from 'next/router' // Import useRouter
import SocialIcon from './social-icons'

type ModalProps = {
  isOpen: boolean
  onRequestClose: () => void
  project: ProjectItem | undefined
}

const ThankYouModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  project,
}) => {
  const { data: session } = useSession() // Access session data
  const router = useRouter() // Access router

  if (!project) {
    return <div />
  }

  const getCleanImageUrl = (url) => {
    return url.replace('_normal', '')
  }

  const focusStyle = {
    outline: 'none',
  }
  // Construct the message for sharing
  const shareMessage = encodeURIComponent(
    `I've just donated to ${project.title}!\n\nJoin me in supporting this amazing project: https://www.lite.space/missions/${project.slug}.\n\n${project.hashtag}\n\n#LiteSpace @LTCFoundation`
  )

  // URLs for sharing on social media
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareMessage}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    `https://www.lite.space/missions/${project.slug}`
  )}&quote=${shareMessage}`

  let userName = ''
  if (router.query.name !== undefined) {
    userName += `, ${router.query.name}`
  }
  if (session?.user?.name !== undefined) {
    userName += `, ${session?.user?.name}`
  }

  return (
    <ReactModal
      isOpen={isOpen}
      style={{ content: focusStyle }}
      onRequestClose={onRequestClose}
      className="max-h-full max-w-sm overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl  sm:m-8 md:max-w-xl"
      overlayClassName="inset-0 fixed backdrop-blur-xl  flex items-center justify-center transform duration-400 ease-in"
      appElement={
        typeof window === 'undefined'
          ? undefined
          : document?.getElementById('root') || undefined
      }
    >
      <div className="relative -mb-12 flex justify-end">
        <FontAwesomeIcon
          icon={faClose}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="items-center space-y-4 py-4">
        <div className="">
          <div className="mt-4 flex flex-col items-center justify-center">
            {session?.user?.image && (
              <Image
                // Use the custom loader
                loader={customImageLoader}
                src={getCleanImageUrl(session.user.image)}
                alt={session.user.name}
                width={96}
                height={96}
                className="rounded-full"
                // Apply lazy loading
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            )}
            <h1 className="font-regular text-center font-sans text-4xl">
              Thank You for Your Support{userName}!
            </h1>
            <div>
              <p className="mx-16 mt-4 text-center">
                Your donation to {project.title} makes a big difference. It
                helps the contributors maintain and improve {project.title},
                keeping Litecoin at the forefront of cryptocurrency.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="font-semi flex w-min gap-4 rounded-xl bg-blue-100 p-2 px-6 font-semibold ">
          SHARE:
          <SocialIcon kind="twitter" href={twitterShareUrl} size={8} />
          <SocialIcon kind="facebook" href={facebookShareUrl} size={8} />
        </div>
      </div>
    </ReactModal>
  )
}

export default ThankYouModal
