// components/GradientButton.tsx

import React from 'react'

type GradientButtonProps = {
  onClick?: (
    e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLButtonElement>
  ) => void
  isLoading: boolean
  disabled?: boolean
  appearDisabled?: boolean // New prop to control appearance without disabling functionality
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  backgroundColor?: string // User-defined background color
  textColor?: string // User-defined text gradient color
  textColor2?: string
  loadingText?: string // Customizable loading text
  moveOnHover?: boolean // New prop to control hover movement
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  appearDisabled = false,
  children,
  type = 'button',
  backgroundColor = '#222222',
  textColor = '#ffffff',
  textColor2 = '#444444',
  loadingText = 'Submitting...',
  moveOnHover = true, // Default to true
}) => {
  // Determine if the button should be functionally disabled
  const isFunctionallyDisabled = disabled

  // Determine if the button should appear disabled
  const isAppearanceDisabled = disabled || appearDisabled

  // Hover movement style
  const hoverMoveStyle =
    moveOnHover && !isAppearanceDisabled ? 'hover:-translate-y-[5px]' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isFunctionallyDisabled} // Only disable functionality if `disabled` is true
      className={`relative w-full transform overflow-hidden !rounded-3xl py-3 text-[14px] transition duration-200 ${
        isAppearanceDisabled
          ? 'cursor-not-allowed bg-gray-400 text-gray-700' // Apply disabled styles
          : `cursor-pointer text-white hover:from-blue-600 ${hoverMoveStyle}` // Apply active styles with hover movement
      } focus:outline-none`}
      style={{
        backgroundColor: isAppearanceDisabled ? textColor2 : backgroundColor,
        color: isAppearanceDisabled ? '#858585' : textColor,
        cursor: isAppearanceDisabled ? 'not-allowed' : 'pointer',
      }} // Inline styles to override external styles
    >
      <span className={`${isLoading ? 'text-gradient-animation ' : ''}`}>
        {isLoading ? loadingText : children}
      </span>
      <style jsx>{`
        .text-gradient-animation {
          background: linear-gradient(
            70deg,
            ${textColor},
            ${textColor},
            ${textColor},
            ${textColor2},
            ${textColor2},
            ${textColor2},
            ${textColor2},
            ${textColor2},
            ${textColor}
          );
          background-size: 200%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: gradient-move 7s infinite;
        }

        @keyframes gradient-move {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </button>
  )
}

export default GradientButton
