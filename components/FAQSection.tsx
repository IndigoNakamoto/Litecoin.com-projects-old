// /components/FAQSection.tsx
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

type FAQItem = {
  question: string
  answer: string
}

type FAQCategory = {
  category: string
  items: FAQItem[]
}

type BG = string

const PlusIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <div
      className={`transform transition-transform duration-700 ${
        isOpen ? 'rotate-[315deg]' : 'rotate-0'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </div>
  )
}

export const FAQSection: React.FC<{
  faqs: any[] // Updated to any[] to handle the new data structure
  bg?: BG
}> = ({ faqs, bg = '#222222' }) => {
  // console.log('FAQ SECTION COMPONENT, FAQS: ', faqs)
  const [openIndex, setOpenIndex] = useState<{
    catIndex: number
    qIndex: number
  } | null>(null)

  const handleToggle = (catIndex: number, qIndex: number) => {
    if (
      openIndex &&
      openIndex.catIndex === catIndex &&
      openIndex.qIndex === qIndex
    ) {
      setOpenIndex(null)
    } else {
      // Close the currently open FAQ first
      setOpenIndex(null)
      // Open the new FAQ after a short delay to allow the close animation to complete
      setTimeout(() => {
        setOpenIndex({ catIndex, qIndex })
      }, 300)
    }
  }

  const getMaxHeight = (catIndex: number, qIndex: number) => {
    return openIndex &&
      openIndex.catIndex === catIndex &&
      openIndex.qIndex === qIndex
      ? 'max-h-[1000px]' // Adjust this value as needed
      : 'max-h-0'
  }

  if (!faqs || faqs.length === 0) {
    return (
      <div className="">
        <h3 className="">Frequently Asked Questions</h3>
      </div>
    )
  }

  // **Step 1: Group FAQs by Category**
  const categoryMap: { [category: string]: FAQItem[] } = {}

  faqs.forEach((faq) => {
    // Extract the necessary fields from fieldData
    const { category = 'General', name: question, answer } = faq.fieldData

    const faqItem: FAQItem = {
      question,
      answer,
    }

    // Assign FAQs to their respective categories
    if (categoryMap[category]) {
      categoryMap[category].push(faqItem)
    } else {
      categoryMap[category] = [faqItem]
    }
  })

  // Convert the categoryMap into an array for rendering
  const faqCategories: FAQCategory[] = Object.keys(categoryMap).map(
    (category) => ({
      category,
      items: categoryMap[category],
    })
  )

  return (
    <div>
      {faqCategories.map((category, catIndex) => (
        <div key={catIndex} className="">
          <h4 className="mb-4 pt-4 font-space-grotesk text-[30px] font-semibold text-[black] ">
            {category.category.trim()}
          </h4>
          {category.items.map((faq, qIndex) => (
            <div key={qIndex} className="mb-4">
              <button
                onClick={() => handleToggle(catIndex, qIndex)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    handleToggle(catIndex, qIndex)
                  }
                }}
                style={{ backgroundColor: bg }}
                className="flex w-full cursor-pointer items-center justify-between rounded-none p-6 text-left font-space-grotesk text-xl font-semibold text-[#c6d3d6] focus:border-[#222222] focus:outline-none"
              >
                <span>{faq.question}</span>
                <PlusIcon
                  isOpen={
                    openIndex !== null &&
                    openIndex.catIndex === catIndex &&
                    openIndex.qIndex === qIndex
                  }
                />
              </button>

              <div
                className={`overflow-hidden border border-[black] bg-white transition-all duration-700 ${getMaxHeight(
                  catIndex,
                  qIndex
                )}`}
              >
                <div
                  className="text-md p-6 text-gray-700"
                  style={{
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                  }}
                >
                  <ReactMarkdown className="text-md">
                    {faq.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
