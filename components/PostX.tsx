import React from 'react'
import { Tweet } from 'react-tweet'

function PostX({ XPostID }) {
  return (
    <div data-theme="light">
      <Tweet id={XPostID} />
    </div>
  )
}

export default PostX
