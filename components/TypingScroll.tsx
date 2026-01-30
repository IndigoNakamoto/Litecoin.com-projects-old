import React, { useState, useEffect } from 'react'

export default function TypingScroll() {
  const words = [
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach', // end
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach', // end
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
    'Growth',
    'Research',
    'Contributors',
    'Hard Money',
    'Partnerships',
    'Open-Source',
    'Developers',
    'Decentralization',
    'Collaboration',
    'Knowledge',
    'Education',
    'Community',
    'Outreach',
  ]

  // Extend the list by adding the first few words to the end
  // This helps create a smooth transition when looping back to the start
  const extendedWords = [...words, ...words.slice(0, 2)]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Increment index or reset to 0 when reaching the end of the extended list
        return prevIndex < extendedWords.length - 1 ? prevIndex + 1 : 0
      })
    }, 2000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div style={{ overflow: 'hidden', height: '50px' }}>
      <div
        className="mx-auto flex flex-col items-center"
        style={{
          transform: `translateY(${-50 * currentIndex}px)`,
          transition: 'transform 1s ease',
        }}
      >
        {extendedWords.map((word, index) => (
          <div
            key={index}
            style={{ lineHeight: '50px' }}
            className="font-space-grotesk"
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  )
}
