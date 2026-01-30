import { ReactNode } from 'react'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  title: string
}

export default function PageHeading({ title, children }: Props) {
  return (
    <div className="">
      <div className="items-start xl:grid xl:gap-x-8">
        <div></div>
        <h1 className="pl-4 pt-20 text-5xl font-semibold leading-9 tracking-tight text-gray-900  sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
          {title}
        </h1>
      </div>
      <div className="mt-0 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100    md:px-4 lg:px-8 xs:px-4">
        {children}
      </div>
    </div>
  )
}
