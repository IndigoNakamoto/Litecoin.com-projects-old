/* eslint-disable jsx-a11y/anchor-has-content */
import NextLink from 'next/link'
import { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'

// Define the props type, including children
interface CustomLinkProps
  extends DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  href: string
  children: ReactNode
}

const CustomLink = ({ href, children, ...rest }: CustomLinkProps) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return (
      <NextLink href={href} passHref legacyBehavior>
        <a {...rest}>{children}</a>
      </NextLink>
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...rest}>
      {children}
    </a>
  )
}

export default CustomLink
