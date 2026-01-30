import { ReactNode } from 'react'
import React from 'react'

interface Props {
  children: ReactNode
  bgColor?: string
  style?: string
}

export default function SectionProjects({ children, bgColor }: Props) {
  return (
    <div className={`bg-[${bgColor}] || bg-[#f0f0f0] `}>
      <div className={`mx-auto w-full max-w-[1300px] p-8`}>{children}</div>
    </div>
  )
}
