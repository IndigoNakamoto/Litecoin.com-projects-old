// components/ButtonDAF.tsx

import React, { useEffect, useState } from 'react'
import Button from './Button'
import { FaHandHoldingHeart } from 'react-icons/fa'

const ButtonDAF: React.FC = () => {
  const [buttonText, setButtonText] = useState('Donate')
  const [buttonId, setButtonId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchButtonText = async () => {
      try {
        const response = await fetch('/api/getWidgetSnippet')
        const data = await response.json()
        if (data.text) {
          setButtonText(data.text)
        }
        // If you need to use the button ID or other data, you can set it here
        if (data.id) {
          setButtonId(data.id)
        }
      } catch (error) {
        console.error('Error fetching button text:', error)
      }
    }

    fetchButtonText()
  }, [])

  const handleClick = () => {
    // Handle button click, e.g., open donation modal or redirect
    console.log('Donation button clicked!')
    // You can integrate with your donation flow here
  }

  return (
    <Button
      id={buttonId}
      onClick={handleClick}
      variant="primary"
      // Add any additional props or classNames if needed
    >
      {buttonText}
    </Button>
  )
}

export default ButtonDAF
