// components/TwitterUsers.tsx
import Link from './Link'
import Image from 'next/image'
// import { customImageLoader } from '../utils/customImageLoader'
import Head from 'next/head'

type TwitterUser = {
  name: string
  screen_name: string
  profile_image_url_https: string
}

type TwitterUsersProps = {
  users: TwitterUser[]
}

const TwitterUsers: React.FC<TwitterUsersProps> = ({ users }) => {
  return (
    <div className="col-span-2 col-start-2 grid grid-cols-3 space-y-2 sm:gap-x-2 md:grid-cols-5 md:gap-x-8">
      {users.map((user, index) => (
        <div className="items-left flex flex-col space-x-1 pt-2" key={index}>
          {index < 3 && ( // Preload first three images (if critical)
            <Head>
              <link
                as="image"
                href={user.profile_image_url_https.replace('_normal', '')}
              />
            </Head>
          )}
          <Link
            href={`https://x.com/${user.screen_name}`}
            className=" transition-transform duration-200 ease-in-out hover:scale-105"
          >
            <Image
              src={user.profile_image_url_https.replace('_normal', '')}
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full"
              // Apply lazy loading
              loading="lazy"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Link>
        </div>
      ))}
    </div>
  )
}

export default TwitterUsers
