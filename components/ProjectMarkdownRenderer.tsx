import React, { useState, useEffect } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

type ProjectProps = {
  slug: string
}

const ProjectMarkdownRenderer: React.FC<ProjectProps> = ({ slug }) => {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project data from the serverless API route
        const response = await fetch(`/api/webflow/projects?slug=${slug}`)
        const data = await response.json()
        // console.log('data: ', data.project.fieldData)

        // Check if 'content-2' exists
        if (data.project && data.project.fieldData['content-2']) {
          // Replace escaped newlines (\\n) with actual newlines (\n)
          const contentWithNewlines = data.project.fieldData[
            'content-2'
          ].replace(/\\n/g, '\n')

          // Configure marked to handle single newlines as line breaks
          marked.setOptions({
            breaks: true, // Enable GFM line breaks
            // You can add more options here if needed
          })

          // Parse the markdown content with marked
          const contentParsed = await marked.parse(contentWithNewlines)

          // Sanitize the HTML to prevent XSS attacks
          const sanitizedHtml = DOMPurify.sanitize(contentParsed)

          setContent(sanitizedHtml)
        } else {
          setContent('No content available')
        }
      } catch (error) {
        console.error('Error fetching project data:', error)
        setContent('Error loading content')
      }
    }

    fetchProjectData()
  }, [slug])

  if (!content) {
    return <p>Loading...</p>
  }

  return (
    <div className="bg-white">
      <h1>Project Markdown Renderer</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown" />
    </div>
  )
}

export default ProjectMarkdownRenderer
