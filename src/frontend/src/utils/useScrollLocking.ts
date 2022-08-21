import { useEffect } from 'react'
// TODO: refactor to this https://usehooks-ts.com/react-hook/use-locked-body
export default function useScrollLock(shouldLock: boolean) {
  const hasWindow = typeof window !== 'undefined'

  useEffect(() => {
    if (hasWindow) {
      if (shouldLock) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }
    return () => null
  }, [hasWindow, shouldLock])
}
