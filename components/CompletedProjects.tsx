import React from 'react'
import TypingScroll from './TypingScroll'
import SectionContributors from './SectionContributors'

// Assuming you have images in the /public/static/images/projects/completed/ directory

function CompletedProjects() {
  return (
    <section className="flex flex-col pb-10 pt-16 font-space-grotesk text-gray-800">
      <div className="flex flex-col items-center pb-8  pt-4 text-center">
        <h1 className="font-space-grotesk text-[39px] font-[600] text-[black]">
          The Litecoin Project Development Portal
        </h1>
        <h2 className="pt-2 font-space-grotesk text-[30px] font-[600] text-[black]">
          We help advance
        </h2>
        <h3 className="font-space-grotesk text-[20px] font-semibold text-[black]">
          <TypingScroll />
        </h3>
      </div>
      <SectionContributors />
    </section>
  )
}

export default CompletedProjects
