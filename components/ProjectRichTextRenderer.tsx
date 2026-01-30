import React, { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { optimizeWebflowImageUrl } from '../utils/customImageLoader'

type ProjectProps = {
  slug: string
}

/**
 * Processes HTML content to optimize Webflow CDN image URLs
 * @param html - The HTML content to process
 * @returns The HTML with optimized image URLs
 */
const optimizeImagesInHtml = (html: string): string => {
  // Use regex to find all img src attributes with Webflow CDN URLs
  return html.replace(
    /(<img[^>]+src=["'])(https?:\/\/[^"']*cdn\.prod\.website-files\.com[^"']*)(["'])/gi,
    (match, prefix, url, suffix) => {
      const optimizedUrl = optimizeWebflowImageUrl(url)
      return `${prefix}${optimizedUrl}${suffix}`
    }
  )
}

const ProjectRichTextRenderer: React.FC<ProjectProps> = ({ slug }) => {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project data from the serverless API route
        const response = await fetch(`/api/webflow/project?slug=${slug}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // console.log('data: ', data.project.fieldData)

        // Check if 'content-rich' exists
        if (data.project && data.project.fieldData['content-rich']) {
          // Assuming 'content-rich' is already in HTML format
          const richContent = data.project.fieldData['content-rich']

          // Optimize Webflow image URLs in the HTML content
          const optimizedContent = optimizeImagesInHtml(richContent)

          // Sanitize the HTML to prevent XSS attacks
          const sanitizedHtml = DOMPurify.sanitize(optimizedContent)

          setContent(sanitizedHtml)
        } else {
          setContent('No content available')
        }
      } catch (error: any) {
        console.error('Error fetching project data:', error)
        setError('Failed to load content. Please try again later.')
      }
    }

    fetchProjectData()
  }, [slug])

  if (error) {
    return <p className="error">{error}</p>
  }

  if (!content) {
    return <p>Loading...</p>
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} className="markdown" />
  )
}

export default ProjectRichTextRenderer
