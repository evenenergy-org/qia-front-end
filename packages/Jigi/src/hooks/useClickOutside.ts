import { useEffect, RefObject } from 'react'

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    // 监听鼠标按下事件
    document.addEventListener('mousedown', handleOutside)
    // 监听触摸开始事件
    document.addEventListener('touchstart', handleOutside)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [ref, handler, enabled])
} 