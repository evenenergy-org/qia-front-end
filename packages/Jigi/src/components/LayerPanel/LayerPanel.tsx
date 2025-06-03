import { useState, useRef, useCallback, useMemo } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { Layers } from '@icon-park/react'
import { ImageObject } from '../../types/image'
import { useClickOutside } from '../../hooks/useClickOutside'
import { LayerPanelItem } from './LayerPanelItem'

interface LayerPanelProps {
  elements: ImageObject[]
  onElementsChange?: (elements: ImageObject[]) => void
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ elements, onElementsChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // 创建反序数组用于显示
  const reversedElements = useMemo(() => [...elements].reverse(), [elements])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useClickOutside(panelRef, handleClose, isOpen)

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }, [isOpen])

  // 切换图层可见性
  const toggleLayerVisibility = useCallback((index: number) => {
    // 将倒序索引转换为正序索引
    const originalIndex = elements.length - 1 - index
    const newElements = elements.map((element, i) => {
      if (i === originalIndex) {
        return {
          ...element,
          visible: !element.visible
        }
      }
      return element
    })
    onElementsChange?.(newElements)
  }, [elements, onElementsChange])

  const handleDragEnd = (event: any) => {
    // 在反序数组上进行排序操作
    const newReversedElements = move(reversedElements, event)
    // 将排序后的数组转回原始顺序
    const newElements = [...newReversedElements].reverse()
    onElementsChange?.(newElements)
  }

  return (
    <div className="absolute bottom-6 right-6 z-50" ref={panelRef}>
      {/* 图层按钮 */}
      <button
        onClick={handleButtonClick}
        className={`flex items-center bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg transition-all duration-200 border ${isOpen
          ? 'bg-blue-50 border-blue-200 shadow-blue-100/50'
          : 'border-gray-100 hover:bg-white hover:border-gray-200'
          }`}
      >
        <Layers
          theme="outline"
          size="18"
          className={`mr-1.5 transition-colors duration-200 ${isOpen ? 'text-blue-500' : 'text-gray-600'
            }`}
        />
        <span className={`font-medium transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-gray-700'
          }`}>
          图层
        </span>
      </button>

      {/* 图层列表 */}
      <div
        className={`absolute bottom-full right-0 mb-2 w-50 bg-white rounded-xl shadow-xl p-2 border border-gray-100 transition-all duration-200 transform origin-bottom-right ${isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
      >
        <div className="max-h-80 overflow-y-auto">
          <DragDropProvider onDragEnd={handleDragEnd}>
            {reversedElements.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                暂无图层
              </div>
            ) : (
              reversedElements.map((element, index) => (
                <LayerPanelItem
                  key={element.id}
                  element={element}
                  index={index}
                  onToggleVisibility={toggleLayerVisibility}
                />
              ))
            )}
          </DragDropProvider>
        </div>
      </div>
    </div>
  )
} 