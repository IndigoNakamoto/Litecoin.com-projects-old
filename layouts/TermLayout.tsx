/* eslint-disable */
import { ReactNode } from 'react'
// import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<any>
}

export default function PageLayout({ children, content }: Props) {
  const { title = '', summary = '' } = content

  return (
    <>
      <PageSEO title={`Litecoin | ${title}`} description={`${summary}`} />
      <div className="max-w-full">
        <h1 className="pl-4 pt-20 text-5xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
          {title}
        </h1>
        <div className="dark:prose-dark prose mt-0 max-w-none rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 p-8 text-xl  dark:from-gray-700 dark:to-gray-800">
          {children}
        </div>
      </div>
    </>
  )
}
