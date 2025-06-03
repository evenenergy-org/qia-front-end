import React from 'react'
import { createRoot } from 'react-dom/client'

/**
 * 将 React 图标组件转换为 Konva 可用的图片格式
 * @param IconComponent React 图标组件
 * @param props 图标属性
 * @returns Promise<HTMLImageElement>
 */
export const createKonvaIcon = (IconComponent: React.ComponentType<any>, props: any = {}): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    // 创建一个临时的 div 来渲染图标
    const div = document.createElement('div')
    div.style.width = '24px'
    div.style.height = '24px'
    div.style.position = 'absolute'
    div.style.left = '-9999px'
    div.style.top = '-9999px'
    document.body.appendChild(div)

    // 使用 React 渲染图标
    const root = createRoot(div)
    root.render(React.createElement(IconComponent, {
      theme: 'filled',
      size: '24',
      fill: '#000000',
      strokeWidth: 2,
      ...props
    }))

    // 清理函数
    const cleanup = () => {
      observer.disconnect()
      root.unmount()
      if (div.parentNode === document.body) {
        document.body.removeChild(div)
      }
    }

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations, obs) => {
      const svgElement = div.querySelector('svg')
      if (svgElement) {
        // 设置 SVG 属性
        svgElement.setAttribute('width', '24')
        svgElement.setAttribute('height', '24')
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        // 将 SVG 转换为图片
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const img = new window.Image()
        img.onload = () => {
          cleanup()
          resolve(img)
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      }
    })

    // 开始观察
    observer.observe(div, {
      childList: true,
      subtree: true
    })

    // 设置超时，如果 1 秒后还没有渲染完成，就返回一个空图片
    setTimeout(() => {
      cleanup()
      resolve(new Image())
    }, 1000)
  })
} 