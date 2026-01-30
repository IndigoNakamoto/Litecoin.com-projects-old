/* eslint-disable */
//layouts/FaqLayout.tsx

import { ReactNode, useState } from 'react'
// import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<any>
}

export function CollapsibleQuestion({
  question,
  answer,
}: {
  question: string
  answer: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="faq-item mb-5 overflow-hidden rounded border border-gray-300 transition-colors duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="faq-question text-10xl block w-full bg-gray-200 p-4 text-left font-semibold leading-9 tracking-tight text-gray-900 focus:outline-none dark:text-gray-100 sm:text-5xl sm:leading-10 md:text-5xl md:leading-14"
        // <h1 className="text-3xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl sm:leading-10 md:text-5xl md:leading-14"></h1>
      >
        {question}
      </button>
      {isOpen && (
        <div className="faq-answer border-t border-gray-300 bg-white p-4">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQLayout({ children, content }: Props) {
  const { title = '', summary = '' } = content

  return (
    <>
      <PageSEO title={`Lite.Space | ${title}`} description={`${summary}`} />
      <div className="dark:prose-dark prose max-w-none pb-8 xl:col-span-2 ">
        <h1 className="mt-10 font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:text-7xl md:leading-14 xs:text-6xl">
          {title}
        </h1>
        <div className="rounded-xl bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          {children}
        </div>
      </div>
    </>
  )
}
