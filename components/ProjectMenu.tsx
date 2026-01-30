import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

type ProjectMenuProps = {
  onMenuItemChange: (menuItem: string) => void
  activeMenu: string | null
  commentCount: number | 0
  faqCount: number | 0
  updatesCount: number | 0
}

const ProjectMenu: React.FC<ProjectMenuProps> = ({
  onMenuItemChange,
  activeMenu,
  commentCount,
  faqCount,
  updatesCount,
}) => {
  const [activeItem, setActiveItem] = useState(activeMenu)
  const [showLeftChevron, setShowLeftChevron] = useState(false)
  const [showRightChevron, setShowRightChevron] = useState(true) // Assuming there's overflow initially
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const menuElement = menuRef.current

    const checkForOverflow = () => {
      if (menuElement) {
        const { scrollWidth, clientWidth, scrollLeft } = menuElement
        setShowLeftChevron(scrollLeft > 0)
        setShowRightChevron(scrollLeft < scrollWidth - clientWidth)
      }
    }

    // Initial check
    checkForOverflow()

    // Add event listener
    menuElement?.addEventListener('scroll', checkForOverflow)

    // Cleanup
    return () => menuElement?.removeEventListener('scroll', checkForOverflow)
  }, [])

  const scrollMenu = (direction: 'left' | 'right') => {
    if (menuRef.current) {
      const { clientWidth } = menuRef.current
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth
      menuRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleMenuItemClick = (menuItem: string) => {
    setActiveItem(menuItem)
    onMenuItemChange(menuItem)
  }

  return (
    <nav className="relative mt-6 flex h-16 items-center justify-between border-b border-t border-gray-300">
      <ul
        ref={menuRef}
        className="overflow-x:overlay flex space-x-2 overflow-x-auto whitespace-nowrap py-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Wrap the button in a div for each li. TODO: Decide to add community back 'community' */}
        {['Info', 'faq', 'updates', 'posts'].map((item) => (
          <li
            className="group flex h-16 items-center justify-center rounded-lg "
            key={item}
          >
            {item === 'faq' && faqCount === 0 ? null : item === 'updates' && // Hide the entire button for "FAQ" when faqCount is 1
              updatesCount === 0 ? null : item === 'posts' && // Hide the entire button for "Updates" when updatesCount is 0
              commentCount === 0 ? null : ( // Hide the entire button for "Posts" when commentCount is 0
              <div className="transform-gpu overflow-hidden rounded-xl transition duration-200">
                <button
                  onClick={() => handleMenuItemClick(item)}
                  className={`text-[14px] uppercase ${
                    activeItem === item
                      ? 'font-semibold text-[#000000]'
                      : 'text-gray-700'
                  }`}
                >
                  {item === 'faq'
                    ? 'FAQ'
                    : item === 'updates'
                    ? 'Updates'
                    : item === 'posts'
                    ? 'Posts'
                    : item.charAt(0).toUpperCase() + item.slice(1)}{' '}
                  {/* Display "FAQ," "Updates," and "Posts" in uppercase */}
                  {item === 'faq' &&
                    faqCount > 1 && ( // Conditionally render the span if faqCount > 1
                      <span
                        className={`absolute text-xs ${
                          activeItem === 'faq'
                            ? 'font-bold text-[#000000]'
                            : 'font-semibold'
                        }`}
                      >
                        {faqCount}
                      </span>
                    )}
                  {item === 'updates' &&
                    updatesCount > 0 && ( // Conditionally render the span if updatesCount > 0
                      <span
                        className={`absolute text-xs ${
                          activeItem === 'updates'
                            ? 'font-bold text-[#000000]'
                            : 'font-semibold'
                        }`}
                      >
                        {updatesCount}
                      </span>
                    )}
                  {item === 'posts' &&
                    commentCount > 0 && ( // Conditionally render the span if commentCount > 0
                      <span
                        className={`absolute text-xs ${
                          activeItem === 'posts'
                            ? 'font-bold text-[#000000]'
                            : 'font-semibold'
                        }`}
                      >
                        {commentCount}
                      </span>
                    )}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default ProjectMenu
