import { ReactNode } from 'react'
import PageHeading from '@/components/PageHeading'
import React from 'react'

interface Props {
  children: ReactNode
  title: string
  style?: string
}

export default function DonateSection({
  title,
  children,
  style = 'markdown',
}: Props) {
  return (
    <div
      className="bg-[#f0f0f0] p-6"
      style={{
        backgroundImage: "url('/static/images/design/Mask-Group-20.webp')",
      }}
    >
      <div
        className="mx-auto mt-32 w-full max-w-[1300px] overflow-x-hidden pb-16"
        style={{ minHeight: '', marginTop: '8rem' }}
      >
        <h1 className="markdown py-4 font-space-grotesk text-4xl font-semibold">
          {title}
        </h1>
        <div>{children}</div>
      </div>
    </div>
  )
}
