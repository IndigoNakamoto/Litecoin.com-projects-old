import React from 'react'

function PostYouTube({ YouTubeID }) {
  return (
    <div className="mb-6 w-full max-w-[550px] rounded-xl border border-gray-300 bg-white p-4">
      <div className="aspect-video">
        <iframe
          className="h-full w-full rounded-md"
          src={`https://www.youtube.com/embed/${YouTubeID}?autoplay=0&mute=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}

export default PostYouTube
