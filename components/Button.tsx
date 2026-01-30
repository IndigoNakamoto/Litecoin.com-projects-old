// components/Button.tsx

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  moveOnHover?: boolean // New prop to control hover movement
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  icon,
  iconPosition = 'left',
  moveOnHover = true, // Default to true
  ...props
}) => {
  // Base styles for all buttons
  const baseStyles =
    'cursor-pointer rounded-3xl text-center text-[14px] font-medium transition transform duration-200 ease-in-out flex items-center justify-center'

  // Variant-specific styles
  let variantStyles = ''
  switch (variant) {
    case 'secondary':
      variantStyles =
        'bg-transparent border border-black tracking-wide text-black'
      break
    case 'primary':
    default:
      variantStyles = 'bg-[#222222] border border-[#222222] text-white'
      break
  }

  // Hover movement style
  const hoverMoveStyle = moveOnHover ? 'hover:-translate-y-[5px]' : ''

  // Combine variant styles with hover movement
  variantStyles += ` ${hoverMoveStyle}`

  // Disabled styles handled by the component
  const disabledStyles = props.disabled
    ? 'opacity-50 cursor-not-allowed hover:-translate-y-0'
    : ''

  // Conditional rendering of the icon
  const renderIcon = () => {
    if (!icon) return null

    return (
      <span
        className={`${
          iconPosition === 'left' ? 'mr-2' : 'ml-2'
        } flex items-center`}
      >
        {icon}
      </span>
    )
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  )
}

export default Button
