import { ReactNode } from 'react'
// import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import SubmittedSection from '@/components/SubmittedSection'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<any>
}

export default function SubmittedLayout({ children, content }: Props) {
  const { title = '', summary = '' } = content

  return (
    <>
      <PageSEO title={`Litecoin | ${title}`} description={`${summary}`} />
      <SubmittedSection title={title}>{children}</SubmittedSection>
    </>
  )
}
