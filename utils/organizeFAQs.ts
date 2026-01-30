// /utils/organizeFAQs.ts
import { CMSFAQItem, FAQCategory, FAQItem } from './types'

export const organizeFAQsByCategory = (
  cmsFaqs: CMSFAQItem[] = []
): FAQCategory[] => {
  const categoryMap: { [key: string]: FAQItem[] } = {}

  cmsFaqs.forEach((cmsFaq) => {
    const category = cmsFaq.fieldData.category?.trim() || 'Uncategorized'
    const faqItem: FAQItem = {
      question: cmsFaq.fieldData.name,
      answer: cmsFaq.fieldData.answer,
    }

    if (!categoryMap[category]) {
      categoryMap[category] = []
    }

    categoryMap[category].push(faqItem)
  })

  // Convert the map to an array
  return Object.entries(categoryMap).map(([category, items]) => ({
    category,
    items,
  }))
}
