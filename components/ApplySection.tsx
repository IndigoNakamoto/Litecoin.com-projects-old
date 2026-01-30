import { ReactNode } from 'react'
import PageHeading from '@/components/PageHeading'
import React from 'react'

interface Props {
  children: ReactNode
  title: string
  style?: string
}

export default function ApplySection({
  title,
  children,
  style = 'markdown',
}: Props) {
  return (
    <div className="bg-white p-8">
      <div className="m-auto my-auto min-h-screen max-w-2xl bg-white py-32">
        <h1 className="markdown m-auto items-center py-4 font-space-grotesk text-4xl font-semibold">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}
