
import * as React from "react"

export function useViewportSize() {
  const [size, setSize] = React.useState<{
    width: number
    height: number
  }>({
    width: window.innerWidth,
    height: window.innerHeight
  })

  React.useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    // Initial size set
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return size
}

export function useIsLandscape() {
  const { width, height } = useViewportSize()
  return width > height
}

export function useIsPortrait() {
  return !useIsLandscape()
}
