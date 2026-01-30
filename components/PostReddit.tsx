import React from 'react'

function PostReddit({ redditPostURL }) {
  return (
    <div className="mb-6 w-full max-w-[550px] rounded-xl border border-gray-300 bg-white p-4">
      <div className="aspect-video">
        <iframe
          className="h-full w-full rounded-md"
          src={`https://www.redditmedia.com${
            new URL(redditPostURL).pathname
          }?ref_source=embed&amp;ref=share&amp;embed=true`}
          title="Reddit post"
          sandbox="allow-scripts allow-same-origin allow-popups"
          style={{ border: 'none', overflow: 'hidden' }}
          height="500"
          width="100%"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  )
}

export default PostReddit
