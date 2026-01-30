import { ReactNode } from 'react'
import Image from '@/components/Image'
import PageHeading from '@/components/PageHeading'

interface Props {
  children: ReactNode
  title: string
  image: string
}

export default function PageSection({ title, image, children }: Props) {
  return (
    <div className="divide-y divide-gray-200 ">
      <PageHeading title={title}>
        <div className="markdown max-w-none pb-8 pt-8 xl:col-span-2">
          {children}
        </div>
        <div className="flex flex-col items-center space-x-2 pl-4 pt-8 xl:block">
          <Image
            src={image}
            alt="avatar"
            width={210}
            height={210}
            className="h-48 w-48"
          />
        </div>
      </PageHeading>
    </div>
  )
}
