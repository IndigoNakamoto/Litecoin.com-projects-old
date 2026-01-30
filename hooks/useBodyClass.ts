// hooks/useBodyClass.ts
import { useEffect } from 'react'

const useBodyClass = (className: string, active: boolean) => {
  useEffect(() => {
    if (active) {
      document.body.classList.add(className)
    } else {
      document.body.classList.remove(className)
    }

    // Cleanup in case the component is unmounted
    return () => {
      document.body.classList.remove(className)
    }
  }, [className, active])
}

export default useBodyClass
