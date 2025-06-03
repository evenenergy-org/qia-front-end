import { useSortable } from "@dnd-kit/react/sortable"
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers"
import { PreviewOpen, PreviewClose, Drag } from '@icon-park/react'
import { ImageObject } from '../../types/image'
import './LayerPanelItem.css'

interface LayerPanelItemProps {
  element: ImageObject
  index: number
  onToggleVisibility: (index: number) => void
}

export const LayerPanelItem: React.FC<LayerPanelItemProps> = ({
  element,
  index,
  onToggleVisibility,
}) => {

  const { ref, isDragging } = useSortable({ id: element.id, index, modifiers: [RestrictToVerticalAxis] })


  return (
    <div
      ref={ref}
      className={`py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150 flex items-center gap-3 group`}
    >
      {/* 可见性控制按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility(index)
        }}
        className="text-gray-400 hover:text-gray-600 p-1"
      >
        {element.visible ? (
          <PreviewOpen theme="outline" size="18" />
        ) : (
          <PreviewClose theme="outline" size="18" />
        )}
      </button>

      {/* 图片预览区域 */}
      <div className="flex-1 min-w-0">
        <div className="aspect-square w-12 bg-gray-100 rounded overflow-hidden">
          {element.imageData && (
            <img
              src={element.imageData.src}
              alt={element.name || `图层 ${index + 1}`}
              className="w-full h-full object-cover preview-img"
            />
          )}
        </div>
      </div>

      {/* 拖拽图标 */}
      <button className="text-gray-400 hover:text-gray-600 p-1 cursor-move">
        <Drag theme="outline" size="18" />
      </button>
    </div>
  )
} 