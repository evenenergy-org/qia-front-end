import { useCallback } from 'react'

/**
 * 统一处理点击事件的 Hook
 * 同时支持 PC 端 onClick 和移动端 onTap 事件
 */
export const useClickHandler = (handler: (...args: any[]) => void) => {
  return {
    onClick: handler,
    onTap: handler
  }
} 